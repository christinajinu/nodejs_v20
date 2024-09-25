import express from 'express';
import clientRouter from './client.route.js';
import batchRouter from './batch.route.js';
import sseRouter from './sse.route.js';
import dashboardRouter from './dashboard.route.js';
import masterProductRouter from './masterProducts.route.js';
const router = express.Router();
router.use('/', clientRouter);
router.use('/batch', batchRouter);
router.use('/masterproduct', masterProductRouter);
router.use('/analysis', dashboardRouter);
router.use('/sse', sseRouter);
router.get('/', (_req, res) =>
  res.status(200).json({
    status: 'success',
    message:
      'You have successfully reached out Supply Chain PBC server API version 1.',
  })
);

export default router;
