const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: "rzp_test_nO30QIbRTTdEb6",
  key_secret: "T1FvvysOYbPfOAUh9z1yaAYG",
});

const checkOut = async (req, res) => {
  const { amount } = req.body;
  const option = {
    amount: amount * 100,
    currency: "USD",
  };
  const order = await instance.orders.create(option);
  res.json({
    order,
    success: true,
  });
};

const paymentVerify = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId } = req.body;
  res.json({
    razorpayOrderId,
    razorpayPaymentId,
  });
};

module.exports = { checkOut, paymentVerify };
