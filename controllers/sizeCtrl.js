const Size = require('../models/sizeModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');

// CREATE COLOR
const createSize = catchAsyncErrors(async (req, res) => {
  try {
    const newSize = await Size.create(req.body);
    res.json(newSize);
  } catch (error) {
    throw new Error(error);
  }
});

// UPDATE COLOR
const updateSize = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSize = await Size.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedSize);
  } catch (error) {
    throw new Error(error);
  }
});

//! DELETE COLOR
const deleteSize = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSize = await Size.findByIdAndDelete(id);
    res.json(deletedSize);
  } catch (error) {
    throw new Error(error);
  }
});

// GET COLOR
const getSize = catchAsyncErrors(async (req, res) => {
  const { id } = req.params;
  try {
    const getSize = await Size.findById(id);
    res.json(getSize);
  } catch (error) {
    throw new Error(error);
  }
});
const getAllSizes = catchAsyncErrors(async (req, res) => {
  try {
    const getAllSizes = await Size.find();
    res.json(getAllSizes);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  createSize,
  updateSize,
  deleteSize,
  getSize,
  getAllSizes,
};
