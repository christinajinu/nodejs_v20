import mongoose from 'mongoose';
const clientSchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please add unique ID'],
    },
    companyId: {
      type: String,
      required: [true, 'Please add unique ID'],
    },
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    designation: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: 'stakeholder',
      enum: {
        values: ['stakeholder', 'origin'],
        message: 'Please enter a valid role',
      },
    },
    archive: {
      type: Boolean,
      default: 'false',
    },
    APIKey: {
      type: String,
      default: 'APIKey',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    registrarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    vendors: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Client',
        },
        companyId: String,
        company: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Client', clientSchema);
