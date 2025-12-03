import e from "express";
import employee from "../schema/employee.js";
import { v2 as cloudinary } from "cloudinary";

export const getAllEmployees = async (req, res) => {
  let query = req.query;
  let queryBuilder = {};
  const page = Number(query.page) || 1;
  const items = Number(query.items) || 10;
  if (query.name) queryBuilder = { ...queryBuilder, fname: query.name };
  if (query.specialized)
    queryBuilder = { ...queryBuilder, specialized: query.specialized };
  if (query.adharId) queryBuilder = { ...queryBuilder, adharId: query.adharId };
  if (query.currentOrder == "null")
    queryBuilder = {
      ...queryBuilder,
      $or: [{ currentOrder: { $exists: false } }, { currentOrder: null }],
    };
  else if (query.currentOrder == "occupied"){
    queryBuilder = { ...queryBuilder, currentOrder: {$ne:null}} }
  else if (query.currentOrder)
    queryBuilder = { ...queryBuilder, currentOrder: query.currentOrder };
  if (query.id) queryBuilder = { _id: query.id };
  console.log("Query 123", queryBuilder);
  try {
    const count = await employee.countDocuments(queryBuilder);
    const employees = await employee
      .find(queryBuilder)
      .skip((page - 1) * query.items)
      .limit(items)
      .populate("currentOrder", "_id")
      .populate("specialized");
    return res.status(200).json({
      message: "Successful",
      item: employees,
      pagination: { totalCount: count },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  const empId = req.params.empId;
  if (!empId) {
    return res.status(400).json({ message: "Please enter valid employee id" });
  }
  try {
    const empFound = await employee
      .findOne({ _id: empId })
      .populate("specialized")
      .populate("currentOrder");
    return res.status(200).json({ message: "Successful", item: empFound });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  const empId = req.params.empId;
  if (!empId) {
    return res.status(400).json({ message: "Please enter valid employee id" });
  }
  try {
    await employee.deleteOne({ _id: empId });
    return res.status(200).json({ message: "profile deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteProfileImage = async (req, res) => {
  const empId = req.params.empId;

  const emp = await employee.findById(empId).select("publicId");
  if (!emp) return res.status(404).json({ message: "Employee not found" });

  try {
    if (emp.publicId) {
      const { result } = await cloudinary.uploader.destroy(emp.publicId);
      if (result !== "ok" && result !== "not found") {
        return res.status(502).json({ message: "Cloudinary delete failed", result });
      }
    }
    await employee.updateOne(
      { _id: empId },
      { $unset: { profileImage: 1, publicId: 1 } }
    );

    return res.status(200).json({ message: "Profile image removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllOrdersByEmployeeId = async (req, res) => {
  const empId = req.params.empId;
  if (!empId) {
    return res.status(400).json({ message: "Please enter valid employee id" });
  }
  try {
    const empFound = await employee.findOne({ _id: empId }).populate("orders");
    return res.status(200).json({ message: "Successful", item: empFound });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateEmployeeDetails = async (req, res) => {
  const empId = req.params.empId;
  const { previousPublicId, ...body } = req.body;
  try {
    if (previousPublicId) {
      await cloudinary.uploader.destroy(previousPublicId);
    }
    await employee.updateOne({ _id: empId }, { $set: { ...body } });
    return res.status(201).json({ message: "Employee updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  const {
    fname,
    lname,
    phone,
    adharId,
    specializationCategory,
    profileImage,
    publicId,
    address,
    state,
    city,
    postalCode,
  } = req.body;
  console.log("Req Body:", req.body);
  if (
    !fname ||
    !lname ||
    !phone ||
    !adharId ||
    !specializationCategory.length > 0 ||
    !address ||
    !city ||
    postalCode.length != 6
  ) {
    return res
      .status(400)
      .json({ message: "Please enter all required fields" });
  }
  try {
    const empFound = await employee.findOne({ adharId });
    if (empFound) {
      return res.status(500).json({ message: "Duplicate adhar not allowed" });
    }
    const newEmp = new employee({
      fname,
      lname,
      phone,
      adharId,
      specialized: specializationCategory,
      profileImage,
      publicId,
      address,
      state,
      city,
      postalCode,
    });
    await newEmp.save();
    return res.status(201).json({ message: "created successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

