const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("./../models/userModel");
const sendToken = require("./../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

// Register for user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // cloudinary
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });

  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(user, 201, res, "Đăng ký thành công");
});

// login user
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // check if user entered email or password or not
  if (!email || !password) {
    return next(new ErrorHandler("Vui lòng nhập Email và mật khẩu", 400));
  }
  

  // kiểm tra email và password trong DB
  // dùng select vì mật khẩu đã hash nên kh thể nhìn
  const user = await User.findOne({ email }).select("+password");
  
  // nếu không tìm thấy user trong DB
  if (!user) {
    return next(new ErrorHandler("Email hoặc mật khẩu không chính xác", 401));
  }
 

  // kiểm tra password có khớp với DB không bằng comparePassword method
  const isPasswordMatched = await user.comparePassword(password);

  // nếu password hoặc email không khớp
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Email hoặc mật khẩu không chính xác", 401));
  }
  

  sendToken(user, 200, res, "Đăng nhập thành công");
});

// logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

// Forgot password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // tìm người dùng trong DB bằng email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorHandler("Không tìm thấy người dùng sử dụng Email này", 404)
    );
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  // lưu giá trị trong schema của passwordtoken và passwordexpire
  await user.save({ validateBeforeSave: false });

  // cho localserver
  // ${process.env.FRONTEND_URL}
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `Đường Link thay đổi mật khẩu của bạn :- \n\n ${resetPasswordUrl}\n\n Nếu bạn chưa yêu cầu email này thì hãy bỏ qua nó`;

  try {
    // gửi email cho người dùng sau khi gửi mã thông báo
    await sendEmail({
      email: user.email,
      subject: `G101 Store Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Đã gửi đến Email ${user.email}`,
    });
  } catch (error) {
    // if there is error than we already generated a these below token so it's duty define them as undefined
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // so again save these values in schema
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // create token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Mật khẩu không hợp lệ", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // lưu tất cả thông tin trên vào schema
  await user.save();

  sendToken(user, 200, res);
});

// get user details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update user password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Mật khẩu cũ không chính xác", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Mật khẩu không khớp", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res, "Thay đổi mật khẩu thành công");
});

// update user profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Cập nhật thông tin thành công",
  });
});

// Get all user -- admin
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user -- admin
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`Không tìm thấy người dùng với id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update user role
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    message: "Cập nhật vai trò người dùng thành công",
  });
});

// delete user  -- admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(
        `Người dùng không tồn tại với mã người dùng: ${req.params.id}`
      )
    );
  }

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  await user.remove();

  res.status(200).json({
    success: true,
    message: "Xóa người dùng thành công",
  });
});
