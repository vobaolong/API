const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  order.orderItems.forEach(async (order_) => {
    await updateStock_decrease(order_.product, order_.quantity);
  });

  res.status(201).json({
    success: true,
    order,
  });
});

// get Single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(
      new ErrorHandler("Không tìm thấy đơn hàng với mã đơn hàng này!", 404)
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// nhận đơn hàng của người dùng đã đăng nhập bằng id
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all order -- admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update order status -- admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler("Không tìm thấy đơn hàng với mã đơn hàng này!", 404)
    );
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("Đơn hàng đã được giao", 400));
  }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
    if (!order.paymentInfo) {
      const paymentInfo = { id: req.params.id, status: "succeeded" };
      order.paymentInfo = paymentInfo;
    }
  } else if (req.body.status === "Cancel") {
    order.orderItems.forEach(async (order_) => {
      await updateStock_increase(order_.product, order_.quantity);
    });
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

async function updateStock_decrease(id, quantity) {
  const product = await Product.findById(id);

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

async function updateStock_increase(id, quantity) {
  const product = await Product.findById(id);

  product.stock += quantity;
  await product.save({ validateBeforeSave: false });
}

// delete order -- admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler("Không tìm thấy đơn hàng với mã đơn hàng này!", 404)
    );
  }

  await order.remove();

  res.status(200).json({
    success: true,
    message: "Xoá đơn hàng thành cống",
  });
});
