import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logoutlogo from "../assets/logoutlogo.png";
import Upload from "./upload";
const Usersign = () => {
  const [file, setFile] = useState(null);
  const [signature, setSignature] = useState("");
  const [content, setContent] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [inputSignature, setInputSignature] = useState("");
  const [uploadedfiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const host = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("token");
  // console.log(token);

  const fetchUploadedFiles = async (email) => {
    try {
      // console.log(user);
      const res = await axios.get("http://localhost:3001/userfiles", {
        params: { email },
      });
      console.log(res.data.files);
      setUploadedFiles(res.data.files);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
    }
  };
  useEffect(() => {
    const fetchUploadedFiles1 = async (email) => {
      try {
        // console.log(user);
        const res = await axios.get("http://localhost:3001/userfiles", {
          params: { email },
        });
        console.log(res.data.files);
        setUploadedFiles(res.data.files);
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };
    const verifyCookie = async () => {
      const { data } = await axios.post("http://localhost:3001/", { token });
      const { status, user } = data;
      setUsername(user);
    };
    fetchUploadedFiles1(username);
    verifyCookie();
  }, []);
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleCopySignature = () => {
    if (signature) {
      navigator.clipboard
        .writeText(signature)
        .then(() => {
          alert("Signature copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying signature: ", err);
        });
    }
  };
  const handleUpload = async () => {
    fetchUploadedFiles(username);
    if (!file) {
      toast.error("Please select a file to upload!");
      return;
    }
    const handleError = (err) =>
      toast.error(err, {
        position: "top-left",
      });
    const handleSuccess = (msg) =>
      toast.success(msg, {
        position: "top-right",
      });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", username);
    try {
      const res = await axios.post("http://localhost:3001/upload", formData);
      if (res.data.success) {
        handleSuccess(res.data.message);
      } else {
        handleError(res.data.message);
      }
      fetchUploadedFiles(username); // Refresh the file list
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error uploading file");
    }
  };
  const Logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  // const handleVerify = async () => {
  //   try {
  //     const res = await axios.post("http://localhost:3000/verify", {
  //       signature,
  //     });
  //     setIsValid(res.data.isValid);
  //   } catch (error) {
  //     console.error("Error verifying document:", error);
  //   }
  // };

  return (
    <div className="App">
      <h1>GET YOUR DOCS SIGNED</h1>

      <div className="upload">
        <div>
          <Upload file={file} setFile={setFile} />
        </div>
        <button onClick={handleUpload}>Upload</button>
      </div>

      <h2>Your Files</h2>
      <div className="filetable">
        <div className="fileone">
          <div>
            <h2>FileName</h2>
          </div>
          <div>
            <h2>FileName</h2>
          </div>
          <div>
            <h2>Signature</h2>
          </div>
        </div>

        {uploadedfiles.map((file) => (
          <div key={file._id} className="fileone">
            <div>
              <strong>{file.fileName}</strong>
            </div>
            <div>{file.status}</div>
            <div>
              {file.status === "Signed" && <p>Signature: {file.signature}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="logoutdiv">
        <img src={logoutlogo} className="logout" onClick={Logout} />
      </div>
    </div>
  );
};

export default Usersign;
