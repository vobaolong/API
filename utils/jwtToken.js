// Creating token and saving in cookie
const sendToken = (user, statusCode, res, msg) => {
  const token = user.getJWTToken();
  
  // options for cookies
  const options = {
    httpOnly: true,
    secure: false,
    path: "/",
    sameSite: "strict"
  };
  

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message: msg,
    user,
    token,
  });
};

module.exports = sendToken;
