import mongoose from 'mongoose';
const activityTypeEnum = [
  'origin',
  'shipping',
  'receiving',
  'processing',
  'production',
];
// needed
const activityStatusEnum = ['pending', 'in_progress', 'completed', 'cancelled'];
// phase-3
const locationSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    description:
      'Geographical coordinates of the activity location, in the format [longitude, latitude]',
  },
});
const batchSchema = mongoose.Schema(
  {
    // activityType: {
    //   type: String,
    //   enum: activityTypeEnum,
    //   description: 'Type of activity in the supply chain process',
    // },
    activityDate: {
      type: Date,
      description: 'Date when the activity occurred',
      default: Date.now(),
    },
    activityStatus: {
      type: String,
      enum: activityStatusEnum,
      default: 'pending',
      description: 'Current status of the activity',
    },
    // location: {
    //   type: locationSchema,
    // },
    companyId: {
      type: String,
      // required: [true, ' add  company ID'],
    },
    uniqueId: {
      type: String,
      // required: [true, ' add  company ID'],
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
    registrarId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: 'Client',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: 'Client',
    },
    batchId: {
      type: String,
      // required: [true, 'add Batch ID'],
    },
    dynamicData: {
      type: Array,
    },
    productId: {
      type: String,
      required: [true, 'add Product Name'],
    },
    productName: {
      type: String,
      required: [true, 'add Product Name'],
    },
    childBatches: [
      {
        childId: mongoose.Schema.Types.ObjectId,
        batchName: String,
      },
    ],
    batchesUsed: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
      },
    ],
    batchNames: [
      {
        name: String,
        batch_id: mongoose.Schema.Types.ObjectId,
      },
    ],
    docDetails: [
      {
        fileName: String,
        url: String,
        docHash: String,
        docType: String,
      },
    ],
    imageUrl: {
      type: String,
      required: [true, 'add Product Name'],
    },
    //quantity of parentbatch:percent or number
    transactionDetails: [
      {
        transactionId: String,
        blockNo: Number,
        blockHash: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    Count: [
      {
        typeCount: String,
        count: Number,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Batch', batchSchema);
