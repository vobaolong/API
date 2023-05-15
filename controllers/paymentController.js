const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const fetch = require('node-fetch');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  amount = req.body.amount;
  var myHeaders = new fetch.Headers();
  myHeaders.append('apikey', 'vUCv2tFmBLBeiryfUGLK4DgKVaQ1qipQ');

  var requestOptions = {
    method: 'GET',
    redirect: 'follow',
    headers: myHeaders,
  };

  const convert = await fetch(
    `https://api.apilayer.com/exchangerates_data/convert?to=USD&from=VND&amount=${amount}`,
    requestOptions
  );
  const result = await convert.json();
  const myPayment = await stripe.paymentIntents.create({
    amount: Math.floor(result.result),
    currency: 'usd',
    metadata: {
      company: 'G101 Store',
    },
  });

  res
    .status(200)
    .json({
      success: true,
      message: `Bạn đã thanh toán thành công số tiền ${(amount).toLocaleString()} VND tương đương $${Math.floor(
        result.result
      )}`,
      client_secret: myPayment.client_secret,
    });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
