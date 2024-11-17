import React, { useEffect, useState } from "react";
import logoutlogo from "../assets/logoutlogo.png";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin = () => {
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem("token");
  const [signature,setSig]=useState("NA");
  const navigate = useNavigate();
  const Logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  const fetchFiles = async () => {
    try {
      const { data } = await axios.get("http://localhost:3001/files");
      setFiles(data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Error fetching files");
    }
  };

  const handleSign = async (fileId) => {
    try {
      const { data } = await axios.post(`http://localhost:3001/sign/${fileId}`);
      setSig(data.signature);
      toast.success("File signed successfully!");
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error signing file:", error);
      toast.error("Error signing file");
    }
  };

  const handleReject = async (fileId) => {
    try {
      await axios.post(`http://localhost:3001/reject/${fileId}`);
      toast.success("File rejected successfully!");
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error("Error rejecting file:", error);
      toast.error("Error rejecting file");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="fulladmin">
      <h1>Admin </h1>
      <ToastContainer />
      <div className="filetable1">
        <div className="fileone1">
          <div>
            <h2>UserName</h2>
          </div>
          <div>
            <h2>FileName</h2>
          </div>
          <div>
            <h2>Status</h2>
          </div>
          <div>
            <h2>Action</h2>
          </div>
        </div>
        {files.map((file) => (
          <div key={file._id} className="fileone1">
            <div>
              <strong>{file.userEmail}</strong>
            </div>
            <div>
              <a
                href={`http://localhost:3001${file.filePath}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.fileName}
              </a>
            </div>
            <div>{file.status}</div>
            <div>
              {file.status === "Pending" && (
                <>
                  <button onClick={() => handleSign(file._id)}>Sign</button>
                  <button onClick={() => handleReject(file._id)}>Reject</button>
                </>
              )}
              {file.status !== "Pending" && <span>{file.signature}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="logoutdiv">
        <img src={logoutlogo} className="logout" />
        <a href="#" className="cta" onClick={Logout}>
          Logout{" "}
        </a>
      </div>
    </div>
  );
};

export default Admin;
