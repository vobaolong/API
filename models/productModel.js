const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên sản phẩm"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả sản phẩm"],
    },
    price: {
      type: Number,
      required: [true, "Vui lòng nhập giá sản phẩm"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    brand: {
      type: String,
      required: [true, "Hãy chọn thương hiệu giày"],
    },
    stock: {
      type: Number,
      required: [true, "Hãy nhập số lượng giày"],
      default: 1,
      min: [0, "Số lượng giày không được bé hơn 0"],
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
