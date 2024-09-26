import batchModel from '../models/batch.model.js';
import productModel from '../models/masterProducts.model.js';
export const findProductName = async (productId) =>
  productModel.find({ _id: productId });

export const saveBatchToDB = async (
  registrarId,
  creatorId,
  adminId,
  companyId,
  uniqueId,
  batchId,
  productId,
  productName,
  dynamicData,
  batchesUsed,
  batchNames,
  uploadedImage,
  uploadedDocFiles,
  activityStatus,
  blockNumber,
  hash,
  blockHash
) => {
  const batchData = {
    registrarId,
    creatorId,
    adminId,
    companyId,
    uniqueId,
    batchId,
    productId,
    productName,
    dynamicData,
    batchesUsed,
    batchNames,
    imageUrl: uploadedImage,
    docDetails: uploadedDocFiles,
    activityStatus,
  };

  if (activityStatus === 'completed') {
    batchData.transactionDetails = {
      transactionId: hash,
      blockNo: blockNumber,
      blockHash: blockHash,
    };
    batchData.Count = {
      typeCount: 'write',
      count: 1,
    };
  }

  return batchModel.create(batchData);
};

export const findBatchFromDB = async (uniqueId) =>
  batchModel.find({ uniqueId });
export const getProductFromDB = async (uniqueId) => {
  try {
    const assetReadUpdate = await batchModel.findOneAndUpdate(
      { uniqueId },
      {
        $push: {
          Count: {
            typeCount: 'read',
            count: 1,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!assetReadUpdate) {
      return 'Read count is not updated';
    }
    return assetReadUpdate;
  } catch (error) {
    console.error(error);
  }
};
export const previewBatchToDB = async (
  uniqueId,
  productId,
  productName,
  dynamicData,
  batchesUsed,
  batchNames,
  uploadedImage,
  uploadedDocFiles,
  activityStatus,
  blockNumber,
  hash,
  blockHash
) => {
  const updateQuery = {
    productId,
    productName,
    dynamicData,
    imageUrl: uploadedImage,
    activityStatus,
    docDetails: uploadedDocFiles,
    batchesUsed,
    batchNames,
  };

  // Conditionally add the Count object if activityStatus is 'completed'
  if (activityStatus === 'completed') {
    updateQuery.$push = {
      Count: { typeCount: 'write', count: 1 },
      transactionDetails: {
        transactionId: hash,
        blockNo: blockNumber,
        blockHash: blockHash,
      },
    };
  }

  return batchModel.findOneAndUpdate({ uniqueId }, updateQuery, {
    new: true,
    runValidators: true,
  });
};

export const updateBatchToDB = async (
  uniqueId,
  dynamicData,
  uploadedDocFiles,
  blockNumber,
  hash,
  blockHash
) =>
  batchModel.findOneAndUpdate(
    { uniqueId },
    {
      $push: {
        dynamicData: { $each: dynamicData },
        docDetails: uploadedDocFiles,
        transactionDetails: {
          transactionId: hash,
          blockNo: blockNumber,
          blockHash,
        },
        Count: {
          typeCount: 'write',
          count: 1,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
