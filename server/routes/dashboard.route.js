import {
  currentMonth,
  lastSevenDays,
  currentYear,
  customData,
} from '../controllers/dashboard.controller.js';
import authenticator from '../middleware/auth.js';
import express from 'express';
const dashboardRouter = express.Router();
dashboardRouter.get('/month', authenticator.client, currentMonth);
dashboardRouter.get('/week', authenticator.client, lastSevenDays);
dashboardRouter.get('/year', authenticator.client, currentYear);
dashboardRouter.get('/:sDate/:eDate', authenticator.client, customData);
export default dashboardRouter;
