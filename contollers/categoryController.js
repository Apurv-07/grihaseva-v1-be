import category from "../schema/category.js";
import { v2 as cloudinary } from "cloudinary";
import order from "../schema/order.js";
import serviceModal from "../schema/service.js";

export const getAllCategories = async (req, res) => {
  try {
    const allData = await category.find({})
    return res.status(200).json({ data: allData })
  } catch (err) {
    return res.status(404).json({ message: "Something is wrong! Try again." })
  }
}

export const getPopularCategories = async (req, res) => {
  try {
    const popularCategories = await order.aggregate([
      {
        $group: {
          _id: "$serviceCategory",   // ✅ FIXED
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          categoryName: "$categoryInfo.name",
          image: "$categoryInfo.image",
          startingFrom: "$categoryInfo.startingFrom",
          description: "$categoryInfo.description",
          priceDescription: "$categoryInfo.priceDescription",
          totalOrders: 1
        }
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 4 }
    ]);

    return res.status(200).json({ data: popularCategories });
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "Something is wrong! Try again." });
  }
};


export const createCategory = async (req, res) => {
  const categoryName = req.body.name;
  const { description, priceDescription, startingFrom, image, parentService } = req.body;
  if (!categoryName) {
    return res.status(400).json({ message: "Please enter valid category" })
  }
  const existingCategory = await category.findOne({ name: categoryName });
  if (existingCategory) {
    return res.status(300).json({ message: "Category with this name already exists" })
  }
  try {
    const newCategory = new category({
      name: categoryName,
      description,
      priceDescription,
      parentService,
      startingFrom,
      image
    })
    await newCategory.save();
    return res.status(201).json({ message: "Category created successfully" })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

export const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;
  if (!categoryId) {
    return res.status(400).json({ message: "Please enter valid category id" })
  }
  try {
    await category.findByIdAndDelete(categoryId);
    return res.status(200).json({ message: "Category deleted successfully" })
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
  }
}

export const updateCategory = async (req, res) => {
  const categoryId = req.params.id;
  const { prevPublicId, ...body } = req.body;
  if (!categoryId) {
    return res.status(400).json({ message: "Please enter valid category id" })
  }
  try {
    if (prevPublicId) {
      await cloudinary.uploader.destroy(prevPublicId)
    }
    await category.updateOne({ _id: categoryId }, { $set: { ...body } });
    return res.status(200).json({ message: "Category updated successfully" })
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" })
  }
}

export const deleteCategoryImage = async (req, res) => {
  const categoryId = req.params.id;

  const existingCategory = await category.findById(categoryId).select("publicId");
  if (!existingCategory) return res.status(404).json({ message: "Category not found" });

  try {
    if (existingCategory.publicId) {
      const { result } = await cloudinary.uploader.destroy(existingCategory.publicId);
      if (result !== "ok" && result !== "not found") {
        return res.status(502).json({ message: "Cloudinary delete failed", result });
      }
    }
    await category.updateOne(
      { _id: categoryId },
      { $unset: { image: 1, publicId: 1 } }
    );

    return res.status(200).json({ message: "Profile image removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addServiceCategory = async (req, res) => {
  const { serviceName } = req.body;
  const existingService = await serviceModal.findOne({ name: serviceName })
  if (existingService) {
    return res.status(300).json({ message: "Failed, duplicate names are not allowed" });
  }
  const newService = new serviceModal({
    name: serviceName
  })
  if (serviceName.length < 4) {
    return res.status(205).json({ message: "Operation failed, required length in 4" })
  }
  try {
    await newService.save();
    return res.status(201).json({ message: "Created" })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

export const getAllServices = async (req, res) => {
  try {
    const allServices = await serviceModal.find({})
    return res.status(200).json({ message: "Successful", data: allServices })
  } catch (e) {
    return res.status(400).json({ message: "Something went wrong", err: e.message })
  }
}

export const updateService = async (req, res) => {
  const { id, name } = req.body;
  try {
    const updatedItem = await serviceModal.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    return res.status(201).json({ message: "Success", data: updatedItem })
  } catch (err) {
    return res.status(404).json({ status: false, message: err.message })
  }
}

export const deleteTheService = async (req, res) => {
  const serviceId = req.params.serviceId;
  try {
    const updateResult = await category.users.updateMany(
      { parentService: serviceId },
      { $unset: { parentService: "" } }
    );
    console.log(`Unset parentService on ${updateResult.modifiedCount} documents.`);
    const deleteResult = await serviceModal.deleteOne({ _id: serviceId });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Service not found or already deleted." });
    }
    return res.status(204).send();
  } catch (err) {
    if (err.name === 'CastError') {
       return res.status(400).json({ status: false, message: "Invalid service ID format." });
    }
    return res.status(500).json({ status: false, message: `An error occurred during deletion: ${err.message}` });
  }
};