import admin from "../schema/admin.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

export const login = async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const adminCurrent = await admin.findOne({ userName });
    if (adminCurrent && adminCurrent.password == password) {
      const auth = jwt.sign(
        { name: adminCurrent.userName },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res
        .cookie("auth", auth, { httpOnly: true })
        .status(201)
        .json({ message: "Logged in", authorized: true });
    }
    return res.status(400).json({ message: "Not authorized" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createNewAdmin = async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }
  try {
    const adminCurrent = await admin.findOne({ userName });
    if (!adminCurrent) {
      const newAdmin = new admin({
        userName,
        password,
      });
      await newAdmin.save();
      return res.status(201).json({ message: "Admin created successfully" });
    }
    return res.status(400).json({ message: "Not authorized" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
