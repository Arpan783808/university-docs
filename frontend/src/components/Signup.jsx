import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../compcss/signup.css";
import rocket from "../assets/rocket.png";
import "../compcss/usersign.css";
const Signup = () => {
  const host = process.env.REACT_APP_BACKEND_URL;
  console.log(host);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
    username: "",
    type: "user",
  });
  const { email, password, username } = inputValue;
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setInputValue({
      ...inputValue,
      [name]: value,
    });
  };
  const handleType = (e) => {
    setInputValue({
      ...inputValue,
      type: e.target.value,
    });
  };
  const handleError = (err) =>
    toast.error(err, {
      position: "top-left",
    });
  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-right",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:3001/signup", {
        ...inputValue,
      });

      const { success, message } = data;
      if (success) {
        localStorage.setItem("token", data.token);
        handleSuccess(message);
        if (inputValue.type === "user") {
          setTimeout(() => {
            navigate("/usersign");
          });
        } else {
          setTimeout(() => {
            navigate("/admin");
          });
        }
      } else {
        handleError(message);
      }
    } catch (error) {
      console.log(error);
    }
    setInputValue({
      ...inputValue,
      email: "",
      password: "",
      username: "",
      type:"user",
    });
  };
  
  return (
    <div className="signupfull">
      <img src={rocket} className="rocket" />
      <h1>SignDesk</h1>
      <div className="form_container">
        <h2>Signup Account</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <div>
              <select
                className="email"
                name="type"
                value={inputValue.type}
                onChange={handleType}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <label className="email" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label className="email" htmlFor="email">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={username}
              placeholder="Enter your username"
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label className="email" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              placeholder="Enter your password"
              onChange={handleOnChange}
            />
          </div>
          <button className="sub" type="submit">
            Submit
          </button>
          <span>
            Already have an account? <Link to={"/"}>Login</Link>
          </span>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
