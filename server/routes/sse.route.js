import express from 'express';
const sseRouter = express.Router();
import {
  getLocationData,
  getAnalysisData,
  postLocationData,
  postAnalysisData,
} from '../controllers/sse.controller.js';

sseRouter.route('/location').get(getLocationData).post(postLocationData);
sseRouter.route('/analysis').get(getAnalysisData).post(postAnalysisData);
export default sseRouter;
