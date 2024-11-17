import User from "../model/user.js";
import Admin from "../model/admin.js";
import createsecrettoken from "./secrettoken.js";
import bcrypt from "bcryptjs";

export const login = async (req, res, next) => {
  try {
    const { email, password, type } = req.body;
    console.log(type);
    if (!email || !password||!type) {
      return res.json({ success:false,message: "All fields are required" });
    }
    
    if (type === "user") {
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ message: "Incorrect password or email" });
      }
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        return res.json({ message: "Incorrect password or email" });
      }
      const token = createsecrettoken(user._id);

      res.status(201).json({
        token: token,
        message: "User logged in successfully",
        success: true,
        userid: user._id,
      });
    } else {
      const user = await Admin.findOne({ email });
      if (!user) {
        return res.json({ message: "Incorrect password or email" });
      }
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) {
        return res.json({ message: "Incorrect password or email" });
      }
      const token = createsecrettoken(user._id);
      res.status(201).json({
        token: token,
        message: "User logged in successfully",
        success: true,
        userid: user._id,
      });
    }
    next();
  } catch (error) {
    console.error(error);
  }
};

export const signup = async (req, res, next) => {
  const { username, email, password, type } = req.body;
  if (!email || !password||!type||!username) {
    return res.json({ success:false,message: "All fields are required" });
  }
  try {
    if (type === "user") {
      const isPresent = await User.findOne({ email });
      if (isPresent) {
        return res.json({ message: "User already exist" });
      }

      const user = await User.create({ username, email, password });

      user.password = await bcrypt.hash(password, 12);
      await user.save();
      const token = createsecrettoken(user._id);

      res.status(201).json({
        token: token,
        message: "User signed in successfully",
        success: true,
        user,
      });
    } else {
      const isPresent = await Admin.findOne({ email });
      if (isPresent) {
        return res.json({ message: "User already exist" });
      }

      const user = await Admin.create({ username, email, password });

      user.password = await bcrypt.hash(password, 12);
      await user.save();
      const token = createsecrettoken(user._id);

      res.status(201).json({
        token: token,
        message: "User signed in successfully",
        success: true,
        user,
      });
    }
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
};
