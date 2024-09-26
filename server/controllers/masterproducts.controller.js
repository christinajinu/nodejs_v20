import { uploadImageToBlob } from '../middleware/blobUpload.js';
import masterProductModel from '../models/masterProducts.model.js';
import { sendError, sendWarning, sendSuccess } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';
// @description: add new product
// @request: POST
// @route: api/v1/masterproduct/
// @access: private
// @return: success message
export const createProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      productDescription,
      process: productProcess,
    } = req.body;
    const processArray = JSON.parse(productProcess);
    const uniquePID = uuidv4();
    const creatorId = req.client._id;
    if (!creatorId) {
      return res.status(400).json({
        status: 'warning',
        message: 'Creator Id is Required ',
      });
    }
    const mandatoryFields = ['productId', 'productName', 'productDescription'];
    if (!mandatoryFields.every((field) => req.body[field]))
      return sendWarning(res, 400, 'Please add all mandatory fields');

    const findProduct = await masterProductModel.findOne({
      productId,
      creatorId,
    });
    if (findProduct) {
      return res.status(201).json({
        status: 'error',
        message: 'Product ID Already Exists for this Creator',
      });
    }
    let uploadedImage;
    const { imageFile } = req.files;
    // Upload image files to Azure blob and get their URLs
    if (imageFile) {
      uploadedImage = await uploadImageToBlob(imageFile);
    }
    const newProduct = {
      productId,
      uniquePID,
      creatorId,
      productName,
      productDescription,
      imageLink: uploadedImage,
      process: processArray,
    };
    const response = await masterProductModel.create(newProduct);
    if (response)
      return res.status(200).json({
        status: 'success',
        response,
        message: 'Master Product added successfully',
      });
    return res.status(500).json({
      status: 'error',
      message: 'Error while creating product',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error while creating product',
      error,
    });
  }
};

// @description: get single product
// @request: GET
// @route: api/v1/masterproduct/product
// @access: private
// @return: Product details with id
export const getProductById = async (req, res) => {
  const productId = req.query.id;
  if (!productId)
    return sendWarning(res, 400, 'Please add all mandatory fields');
  try {
    const productDetails = await masterProductModel.findOne({
      uniquePID: productId,
    });
    return productDetails
      ? sendSuccess(
          res,
          200,
          'Single Product fetched successfully',
          productDetails
        )
      : sendError(res, 404, 'Single product fetching failed');
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// @description: update product
// @request: PATCH
// @route: api/v1/masterproduct/
// @access: private
// @return: success message
// eslint-disable-next-line consistent-return
export const updateProduct = async (req, res) => {
  try {
    const id = req.params._id;
    const {
      productId,
      productName,
      productDescription,
      imageLink,
      process: productProcess,
    } = req.body;
    const processArray = JSON.parse(productProcess);
    const mandatoryFields = ['productId', 'productName', 'productDescription'];
    if (!mandatoryFields.every((field) => req.body[field]))
      return sendWarning(res, 400, 'Please add all mandatory fields');
    let uploadedImage = imageLink;
    if (req.files && req.files.imageFile) {
      // <-- Check if req.files and req.files.imageFile exist
      const { imageFile } = req.files;
      uploadedImage = await uploadImageToBlob(imageFile);
    }

    const response = await masterProductModel.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          productId,
          productName,
          productDescription,
          imageLink: uploadedImage,
          process: processArray,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (response)
      return res.status(200).json({
        status: 'success',
        message: `Product updated successfully`,
        response,
      });
    return res.status(500).json({
      status: 'error',
      message: 'Error while updating product',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error while create product',
      error,
    });
  }
};
//  todo: bug when creating same productid for different client in masterproduct creation
// @description: get all product
// @request: GET
// @route: api/v1/masterProduct/
// @access: private
// @return: Product list
export const getAllProduct = async (req, res) => {
  try {
    const productList = await masterProductModel.find();
    return productList
      ? sendSuccess(
          res,
          200,
          'Master Products fetched successfully',
          productList
        )
      : sendError(res, 404, 'Master product fetching failed');
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
      error,
    });
  }
};
export const getCreatorProducts = async (req, res) => {
  try {
    const id = req.client._id;
    const myProducts = await masterProductModel.find({ creatorId: id });
    if (!myProducts) {
      return res.status(404).json({
        status: 'error',
        message:
          "couldn't find product details, please try again after sometime.",
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Client Products  fetched successfully.',
      data: myProducts,
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
// @description: delete a product
// @request: DELETE
// @route: api/v3/masterProduct/
// @access: private
// @return: message
export const deleteProduct = async (req, res) => {
  try {
    if (!req.body._id)
      return res.status(400).json({ status: 'Fail', message: 'Id Not Found' });
    const deletedProduct = await masterProductModel.findByIdAndDelete(
      req.body._id
    );
    if (deletedProduct) {
      return res.status(200).json({
        status: 'Success',
        message: `${deletedProduct.productName}  Deleted Successfully`,
      });
    }
    if (!deletedProduct) {
      return res.status(404).json({ status: 'Fail', message: 'No Data Found' });
    }
  } catch (error) {
    console.error(error);
  }
};
