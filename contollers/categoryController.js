import category from "../schema/category.js";
import {v2 as cloudinary} from "cloudinary";

export const getAllCategories=async (req, res)=>{
    try{
        const allData=await category.find({})
        return res.status(200).json({data: allData})
    }catch(err){
        return res.status(404).json({message: "Something is wrong! Try again."})
    }
}

export const createCategory=async (req, res)=>{
    const categoryName=req.body.name;
    const {description, priceDescription, startingFrom, image}=req.body;
    if(!categoryName){
        return res.status(400).json({message: "Please enter valid category"})
    }
    try {
        const newCategory=new category({
            name: categoryName,
            description,
            priceDescription,
            startingFrom,
            image
        })
        await newCategory.save();
        return res.status(201).json({message: "Category created successfully"})
    }catch (err){
        return res.status(500).json({message: err.message})
    }
}

export const deleteCategory=async (req, res)=>{
    const categoryId=req.params.id;
    if(!categoryId){
        return res.status(400).json({message: "Please enter valid category id"})
    }
    try {
        await category.findByIdAndDelete(categoryId);
        return res.status(200).json({message: "Category deleted successfully"})
    }catch (err){
        return res.status(500).json({message:"Something went wrong"})
    }
}

export const updateCategory=async (req, res)=>{
    const categoryId=req.params.id;
    const {prevPublicId, ...body}=req.body;
    if(!categoryId){
        return res.status(400).json({message: "Please enter valid category id"})
    }
    try {
        if(prevPublicId){
            await cloudinary.uploader.destroy(prevPublicId)
        }
        await category.updateOne({ _id: categoryId }, { $set: { ...body } });
        return res.status(200).json({message: "Category updated successfully"})
    }catch (err){
        return res.status(500).json({message:"Something went wrong"})
    }
}

export const deleteCategoryImage = async (req, res) => {
  const categoryId=req.params.id;

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