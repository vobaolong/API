const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      fullname: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      phoneNo: {
        type: Number,
        required: true,
      },
    },

    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },

    paymentInfo: {
      id: {
        type: String,
      },
      status: {
        type: String,
        required: true,
      },
    },

    paidAt: {
      type: Date,
    },

    itemsPrice: {
      type: Number,
      default: 0,
      required: true,
    },
    taxPrice: {
      type: Number,
      default: 0,
      required: true,
    },
    shippingPrice: {
      type: Number,
      default: 0,
      required: true,
    },

    totalPrice: {
      type: Number,
      default: 0,
      required: true,
    },

    orderStatus: {
      type: String,
      required: true,
      default: 'Processing',
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
