import { uploadDocsToBlob } from '../middleware/blobUpload.js';
import Batch from '../models/batch.model.js';
import Client from '../models/client.model.js';
import { contractInstance } from '../services/instance.js';
import { convertObjectToArray } from '../utils/arrayConverter.js';
import setOptimalGas from '../utils/setOptimalGas.js';
import { getAssetId } from '../utils/utilities.js';

import {
  saveBatchToDB,
  findBatchFromDB,
  getProductFromDB,
  updateBatchToDB,
  findProductName,
  previewBatchToDB,
} from './batch.DBCalls.js';
export const createBatch = async (req, res) => {
  try {
    const {
      batchId,
      // productId,
      product_id,
      dynamicData = [],
      batchesUsed = [],
      batchNames = [],
      functionality,
    } = req.body;
    const registrarId = req.client.registrarId; //Id of stakeholder who onboarde the stakeholsder who is creating this batch
    const creatorId = req.client._id; //Id of batch creator
    const adminId = req.client.adminId; //Id of admin stakeholder
    const companyId = req.client.companyId;
    if (!creatorId || !companyId || !functionality) {
      return res.status(400).json({
        status: 'warning',
        message: 'Some fields are not Generated ',
      });
    }
    const uniqueId = await getAssetId(batchId, companyId);
    if (!uniqueId) {
      return res
        .status(400)
        .json({ status: 'warning', message: 'Unique ID is not generated' });
    }

    const duplicateId = await findBatchFromDB(uniqueId);

    if (functionality === 'add' && duplicateId?.length > 0) {
      return res
        .status(400)
        .json({ status: 'warning', message: 'Batch Id already Exists' });
    }
    // Note: If functionality is update and unique ID does not exist then return an error msg does not exist unique ID
    if (functionality === 'update' && duplicateId?.length <= 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Id does not exist',
      });
    }
    let productId;
    let productName;
    let uploadedImage;

    if (functionality === 'add') {
      const findProduct = await findProductName(product_id);
      productId = findProduct[0].productId;
      productName = findProduct[0].productName;
      uploadedImage = findProduct[0].imageLink;
    }

    // const invalidDynamicData = JSON.parse(dynamicData)?.some(
    //   (data) =>
    //     data?.value === undefined || data?.value === null || data?.value === ''
    // );

    // if (invalidDynamicData) {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Some keys in the dynamic data have invalid values',
    //   });
    // }
    // let uploadedImage;
    let uploadedDocFiles = [];
    if (req.files) {
      const { docFiles } = req.files;

      if (docFiles) uploadedDocFiles = await uploadDocsToBlob(docFiles);
    }
    const updatedDynamicData = convertObjectToArray(JSON.parse(dynamicData));
    if (productId) updatedDynamicData.push(['productId', productId]);
    if (productName) updatedDynamicData.push(['productName', productName]);
    if (batchesUsed?.length)
      updatedDynamicData.push(['batchesUsed', JSON.stringify(batchesUsed)]);
    if (batchNames?.length)
      updatedDynamicData.push(['batchNames', JSON.stringify(batchNames)]);
    if (uploadedImage)
      updatedDynamicData.push(['productImage', JSON.stringify(uploadedImage)]);
    if (uploadedDocFiles?.docDetails?.length)
      updatedDynamicData.push([
        'Documents',
        JSON.stringify(uploadedDocFiles.docDetails),
      ]);
    const optimalGas = await setOptimalGas();
    // Function: Adding block to the public network
    const txn = await contractInstance.addProduct(
      uniqueId,
      batchId,
      updatedDynamicData,
      optimalGas
    );
    const response = await txn.wait();
    const { blockNumber, hash, blockHash } = response;
    if (!blockNumber || !hash || !blockHash)
      return res.status(400).json({
        status: 'error',
        message: 'Block details are not fetched. ',
      });
    const data =
      functionality === 'add'
        ? await saveBatchToDB(
            registrarId,
            creatorId,
            adminId,
            companyId,
            uniqueId,
            batchId,
            productId,
            productName,
            JSON.parse(dynamicData),
            JSON.parse(batchesUsed),
            JSON.parse(batchNames),
            uploadedImage,
            uploadedDocFiles.docDetails,
            blockNumber,
            hash,
            blockHash
          )
        : await updateBatchToDB(
            uniqueId,
            JSON.parse(dynamicData),
            uploadedDocFiles.docDetails,
            blockNumber,
            hash,
            blockHash
          );
    if (functionality === 'add') {
      updateChildBatches(data);
    }
    async function updateChildBatches(response) {
      try {
        // Iterate through each batch ID in batchesUsed
        for (const batchId of response.batchesUsed) {
          await Batch.findByIdAndUpdate(
            batchId,
            {
              $addToSet: {
                childBatches: {
                  childId: response._id,
                  batchName: response.batchId,
                },
              },
            }, // Use $addToSet to avoid duplicates
            { new: true }
          );
        }
      } catch (err) {
        console.error('Error updating child batches:', err);
      }
    }
    if (response) {
      return res.status(200).json({
        status: 'success',
        message: 'Data Stored to Blockchain Successfully',
        blockchainData: response,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error while storing data',
      error,
    });
  }
};

export const createandpreviewBatch = async (req, res) => {
  try {
    const {
      batchId,
      product_id,
      dynamicData = [],
      batchesUsed = [],
      batchNames = [],
      functionality,
      activityStatus,
      deletedDocumentIds,
    } = req.body;
    const deletedDocIds = JSON.parse(deletedDocumentIds);

    let previewData;
    const registrarId = req.client.registrarId;
    const creatorId = req.client._id;
    const adminId = req.client.adminId;
    const companyId = req.client.companyId;

    if (!creatorId || !companyId || !functionality) {
      return res.status(400).json({
        status: 'warning',
        message: 'Some fields are not generated',
      });
    }

    const uniqueId = await getAssetId(batchId, companyId);
    if (!uniqueId) {
      return res.status(400).json({
        status: 'warning',
        message: 'Unique ID is not generated',
      });
    }

    const duplicateId = await findBatchFromDB(uniqueId);

    if (
      functionality === 'add' &&
      duplicateId[0]?.activityStatus === 'completed'
    ) {
      return res.status(400).json({
        status: 'warning',
        message: 'Batch Id already exists',
      });
    }
    const result = await Batch.updateOne(
      { uniqueId: uniqueId },
      {
        $pull: {
          docDetails: {
            _id: {
              $in: deletedDocIds.map((id) => id),
            },
          },
        },
      }
    );
    const findProduct = await findProductName(product_id);

    let productId = findProduct[0]?.productId;
    let productName = findProduct[0]?.productName;
    let uploadedImage = findProduct[0]?.imageLink;

    let uploadedDocFiles = [];
    if (req.files) {
      const { docFiles } = req.files;
      if (docFiles) {
        uploadedDocFiles = await uploadDocsToBlob(docFiles);
      }
    }

    if (activityStatus === 'pending') {
      if (duplicateId?.length <= 0) {
        previewData = await saveBatchToDB(
          registrarId,
          creatorId,
          adminId,
          companyId,
          uniqueId,
          batchId,
          productId,
          productName,
          JSON.parse(dynamicData),
          JSON.parse(batchesUsed),
          JSON.parse(batchNames),
          uploadedImage,
          uploadedDocFiles.docDetails,
          activityStatus
        );
      } else {
        previewData = await previewBatchToDB(
          uniqueId,
          productId,
          productName,
          JSON.parse(dynamicData),
          JSON.parse(batchesUsed),
          JSON.parse(batchNames),
          uploadedImage,
          uploadedDocFiles.docDetails,
          activityStatus
        );
      }
    } else if (activityStatus === 'completed') {
      if (functionality === 'update' && duplicateId?.length <= 0) {
        return res.status(404).json({
          status: 'error',
          message: 'ID does not exist',
        });
      }

      const updatedDynamicData = convertObjectToArray(JSON.parse(dynamicData));
      if (productId) updatedDynamicData.push(['productId', productId]);
      if (productName) updatedDynamicData.push(['productName', productName]);
      if (batchesUsed?.length) {
        updatedDynamicData.push(['batchesUsed', JSON.stringify(batchesUsed)]);
      }
      if (batchNames?.length) {
        updatedDynamicData.push(['batchNames', JSON.stringify(batchNames)]);
      }
      if (uploadedImage) {
        updatedDynamicData.push([
          'productImage',
          JSON.stringify(uploadedImage),
        ]);
      }
      if (uploadedDocFiles?.docDetails?.length) {
        updatedDynamicData.push([
          'Documents',
          JSON.stringify(uploadedDocFiles.docDetails),
        ]);
      }

      const optimalGas = await setOptimalGas();
      const txn = await contractInstance.addProduct(
        uniqueId,
        batchId,
        updatedDynamicData,
        optimalGas
      );
      const response = await txn.wait();
      const { blockNumber, hash, blockHash } = response;

      if (!blockNumber || !hash || !blockHash) {
        return res.status(400).json({
          status: 'error',
          message: 'Block details are not fetched',
        });
      }

      const data =
        functionality === 'add'
          ? duplicateId.length > 0
            ? await previewBatchToDB(
                uniqueId,
                productId,
                productName,
                JSON.parse(dynamicData),
                JSON.parse(batchesUsed),
                JSON.parse(batchNames),
                uploadedImage,
                uploadedDocFiles.docDetails,
                activityStatus,
                blockNumber,
                hash,
                blockHash
              )
            : await saveBatchToDB(
                registrarId,
                creatorId,
                adminId,
                companyId,
                uniqueId,
                batchId,
                productId,
                productName,
                JSON.parse(dynamicData),
                JSON.parse(batchesUsed),
                JSON.parse(batchNames),
                uploadedImage,
                uploadedDocFiles.docDetails,
                activityStatus,
                blockNumber,
                hash,
                blockHash
              )
          : await updateBatchToDB(
              uniqueId,
              JSON.parse(dynamicData),
              uploadedDocFiles.docDetails,
              blockNumber,
              hash,
              blockHash
            );

      if (functionality === 'add') {
        await updateChildBatches(data);
      }

      if (response) {
        return res.status(200).json({
          status: 'success',
          message: 'Data stored to blockchain successfully',
          blockchainData: response,
        });
      }
    }
    if (previewData) {
      return res.status(200).json({
        status: 'success',
        message: 'Data saved successfully',
        data: previewData,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error while storing data',
      error,
    });
  }
};

// Helper function to update child batches
async function updateChildBatches(response) {
  try {
    for (const batchId of response.batchesUsed) {
      await Batch.findByIdAndUpdate(
        batchId,
        {
          $addToSet: {
            childBatches: {
              childId: response._id,
              batchName: response.batchId,
            },
          },
        },
        { new: true }
      );
    }
  } catch (err) {
    console.error('Error updating child batches:', err);
  }
}

export const getSingleBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    if (!batchId)
      return res.status(400).json({
        status: 'warning',
        message: 'Batch ID required',
      });

    const uniqueId = batchId + req.params.companyId;
    const txnDetails = await Batch.findOne({
      uniqueId: uniqueId,
    });
    const { transactionDetails, _id, companyId, creatorId, childBatches } =
      txnDetails;
    const batchDetails = await contractInstance.getProductDetails(uniqueId);
    if (batchDetails) {
      await getProductFromDB(uniqueId);

      res.status(200).json({
        status: 'success',
        message: 'batch details fetched successfully.',
        data: {
          batchDetails,
          transactionDetails,
          _id,
          companyId,
          creatorId,
          childBatches,
        },
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message:
          "couldn't find batch details, please try again after sometime.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error while retrieving data',
      error,
    });
  }
};

export const getSingleTreeBatch = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res.status(400).json({
        status: 'warning',
        message: 'ID is required',
      });
    const batchDetails = await Batch.find({ _id: id });
    if (batchDetails.length !== 0) {
      res.status(200).json({
        status: 'success',
        message: 'batch details fetched successfully.',
        data: batchDetails,
      });
    } else {
      return res.status(404).json({
        status: 'error',
        message:
          "couldn't find batch details, please try again after sometime.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error while retrieving data',
      error,
    });
  }
};
export const userBatches = async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const batches = await Batch.find({ companyId });
    if (!batches) {
      return res.status(404).json({
        status: 'error',
        message:
          "couldn't find batch details, please try again after sometime.",
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Batches of registered  fetched successfully.',
      data: batches,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error while retrieving data',
      error,
    });
  }
};
export const getRegistrarBatches = async (req, res) => {
  try {
    const id = req.client._id;
    const findUser = await Client.findOne({ _id: id });
    const companyIds = findUser?.vendors.map((vendor) => vendor.companyId);
    const registrarBatchArray = await Batch.aggregate([
      {
        $match: {
          companyId: { $in: companyIds },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      message: 'Batches of registered  fetched successfully.',
      data: registrarBatchArray,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error while retrieving data',
      error,
    });
  }
};

// get my batches
export const myBatches = async (req, res) => {
  try {
    const id = req.client._id;
    const myBatch = await Batch.find({ creatorId: id });
    if (!myBatch) {
      return res.status(404).json({
        status: 'error',
        message:
          "couldn't find batch details, please try again after sometime.",
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'My Batch fetched successfully.',
      data: myBatch,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Error while retrieving data',
      error,
    });
  }
};
