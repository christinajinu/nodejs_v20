import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Please add a product Id'],
    },
    uniquePID: {
      type: String,
      required: [true, 'Please add a unique Id'],
      unique: true,
    },
    creatorId: {
      type: String,
      required: [true, 'Please add creator Id'],
    },
    productName: {
      type: String,
      required: [true, 'Please add a product name'],
    },
    productDescription: {
      type: String,
      required: [true, 'Please add a product description'],
    },
    manufacturer: {
      type: String,
      // required: [true, 'Manufacturer is required'],
      description: 'Manufacturer of the product',
    },
    expiryDate: {
      type: Date,
      // required: [true, 'Expiry date is required'],
      validate: {
        validator: function (v) {
          return v > Date.now();
        },
        message: (props) => `${props.value} is not a valid expiry date!`,
      },
      description: 'Expiry date of the product',
    },
    quantity: {
      type: Number,
      // required: [true, 'Quantity is required'],
      validate: {
        validator: function (v) {
          return v > 0;
        },
        message: (props) => `${props.value} is not a valid quantity!`,
      },
      description: 'Quantity of the product involved in the event',
    },
    quantityUnit: {
      type: String,
      // required: [true, 'Quantity unit is required'],
      description: 'Unit of measurement for the product quantity',
    },
    imageLink: {
      type: String,
      // required: [true, 'Please add an image link of product'],
    },
    process: [
      {
        processName: {
          type: String,
        },
        processDescription: {
          type: String,
        },
        imgLink: {
          type: String,
        },
        videoLink: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('masterProducts', productSchema);
