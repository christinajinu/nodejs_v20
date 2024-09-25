import express from 'express';
const masterProductRouter = express.Router();
import {
  createProduct,
  getProductById,
  updateProduct,
  getAllProduct,
  deleteProduct,
  getCreatorProducts,
} from '../controllers/masterproducts.controller.js';
import authenticator from '../middleware/auth.js';

masterProductRouter.route('/product').get(authenticator.client, getProductById);
masterProductRouter.route('/:_id').patch(authenticator.client, updateProduct);
masterProductRouter
  .route('/')
  .get(authenticator.client, getCreatorProducts)
  .post(authenticator.client, createProduct)
  .delete(authenticator.client, deleteProduct);

export default masterProductRouter;
