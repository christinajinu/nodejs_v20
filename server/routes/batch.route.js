import express from 'express';
const batchRouter = express.Router();
import authenticator from '../middleware/auth.js';
import {
  // createBatch,
  createandpreviewBatch,
  getSingleBatch,
  getSingleTreeBatch,
  myBatches,
  getRegistrarBatches,
  userBatches,
} from '../controllers/batch.controller.js';
batchRouter.post('/', authenticator.client, createandpreviewBatch);
batchRouter.get('/:companyId/:id', getSingleBatch);
batchRouter.get('/myBatch', authenticator.client, myBatches);
batchRouter.get('/batches', authenticator.client, getRegistrarBatches);
batchRouter.get('/userBatches', userBatches);
batchRouter.get('/:id', getSingleTreeBatch);
export default batchRouter;
