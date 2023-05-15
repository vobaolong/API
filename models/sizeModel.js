const mongoose = require("mongoose");

var sizeSchema = new mongoose.Schema(
  {
    size: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  } 
);

//Export the model
module.exports = mongoose.model("Size", sizeSchema);
