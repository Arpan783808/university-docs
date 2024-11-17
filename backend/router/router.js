import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { login, signup } from "../controller/controller.js";
import { jwtAuth } from "../controller/jwtauth.js";
import File from "../model/document.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Update multer config to use the correct path
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDirectory); // Save to 'uploads' directory
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Save with original file name
    },
  }),
});

// Serve uploaded files statically
// router.use('/uploads', express.static(uploadDirectory));

// MongoDB Schema for Signature
const signatureSchema = new mongoose.Schema({
  signature: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Signature = mongoose.model("Signature", signatureSchema);

// Utility to sign content
const signContent = (content) => {
  const privateKey = fs.readFileSync(
    path.join(__dirname, "../private_key.pem"),
    "utf8"
  );
  const signer = crypto.createSign("SHA256");
  signer.update(content);
  signer.end();
  const signature = signer.sign(privateKey, "base64");
  return signature;
};

// Route to sign a document
router.post("/sign", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No file uploaded" });
  }

  const filePath = path.join(__dirname, "../uploads", req.file.filename);

  fs.readFile(filePath, "utf8", (err, content) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send({ error: "Error reading file" });
    }

    const signature = signContent(content);

    // Store signature and content in MongoDB
    const newSignature = new Signature({
      signature,
      content,
    });

    newSignature
      .save()
      .then(() => {
        fs.unlinkSync(filePath); // Clean up the uploaded file
        res.json({ signature });
      })
      .catch((err) => {
        console.error("Error saving signature to DB:", err);
        res.status(500).send({ error: "Error saving signature" });
      });
  });
});

// Route to verify the signature
router.post("/verify", (req, res) => {
  const { signature } = req.body;

  if (!signature) {
    return res.status(400).send({ error: "Signature is required" });
  }

  // Look for the signature in MongoDB
  Signature.findOne({ signature })
    .then((doc) => {
      if (!doc) {
        return res.status(404).send({ error: "Signature not found" });
      }

      const content = doc.content;
      const publicKey = fs.readFileSync(
        path.join(__dirname, "../public_key.pem"),
        "utf8"
      );
      const verifier = crypto.createVerify("SHA256");
      verifier.update(content);
      verifier.end();

      const isValid = verifier.verify(publicKey, signature, "base64");
      res.json({ isValid });
    })
    .catch((err) => {
      console.error("Error verifying signature:", err);
      res.status(500).send({ error: "Error verifying signature" });
    });
});


router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const {email} = req.body; // Extracting email from FormData
    const {file} = req;
    // const filePath = path.join(__dirname, "../uploads", file.originalname); // Save file path
    const filePath = path.posix.join('/uploads', file.originalname);
    const exist = await File.find({ fileName: file.originalname });
    // if(exist){
    //   return res.json({success:false,message:"upload failed"});
    // }
    // Save file metadata in DB
    const newFile = new File({
      userEmail: email,
      fileName: file.originalname,
      filePath, // Store the file path in DB
    });
    await newFile.save();
    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res
      .status(500)
      .json({ success: false, message: error, error: "Error uploading file" });
  }
});
router.get("/files", async (req, res) => {
  try {
    const files = await File.find();
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});
router.get("/userfiles", async (req, res) => {
  try {
    const {email} = req.query;
    const files = await File.find({ userEmail: email });
    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Error fetching files" });
  }
});

// Sign a file
router.post("/sign/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || file.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "Invalid file or already processed" });
    }

    // Generate signature
    const signature = `Signed by admin at ${new Date().toISOString()}`;
    file.signature = signature;
    file.status = "Signed";
    await file.save();

    res.status(200).json({ message: "File signed successfully", signature });
  } catch (error) {
    console.error("Error signing file:", error);
    res.status(500).json({ error: "Error signing file" });
  }
});

// Reject a file
router.post("/reject/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file || file.status !== "Pending") {
      return res
        .status(400)
        .json({ error: "Invalid file or already processed" });
    }
    file.signature=`Rejected by admin at ${new Date().toISOString()}`;
    file.status = "Rejected";
    await file.save();

    res.status(200).json({ message: "File rejected successfully",file });
  } catch (error) {
    console.error("Error rejecting file:", error);
    res.status(500).json({ error: "Error rejecting file" });
  }
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/", jwtAuth);
export default router;
