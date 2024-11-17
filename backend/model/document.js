import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({  
  userEmail: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  signature: { type: String, default: null },
  status: { type: String, enum: ["Pending", "Signed", "Rejected"], default: "Pending" },
});

const File = mongoose.model("File", fileSchema);

export default File;
