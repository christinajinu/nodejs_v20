import {
  registerAdmin,
  registerClient,
  clientLogin,
  clientExist,
  deleteClient,
  getAllClients,
  getMe,
  updateClient,
  updatePassword,
  forgotPassword,
  resetPassword,
  passwordReset,
  getRegisteredUsers,
  getCompanies,
  getUsers,
  sendAlertMail,
  getClientEmail,
} from '../controllers/client.controller.js';
import express from 'express';
const clientRouter = express.Router();
import authenticator from '../middleware/auth.js';
// clientRouter.route('/admin').post(
//   // authenticator.admin,
//   registerAdmin
// );
clientRouter.route('/addClient').post(authenticator.client, clientExist);

clientRouter
  .route('/clients')
  .post(authenticator.client, registerClient)
  .patch(authenticator.client, updateClient)
  .get(authenticator.client, getUsers)
  .delete(
    // authenticator.admin,
    deleteClient
  );
clientRouter.route('/clients/get').get(
  // authenticator.admin,
  getAllClients
);
clientRouter
  .route('/clients/getUsers')
  .get(authenticator.client, getRegisteredUsers);
clientRouter
  .route('/clients/me')
  .get(authenticator.client, getMe)
  .patch(authenticator.client, updatePassword);
clientRouter.post('/clients/forgotpassword', forgotPassword);
clientRouter.patch('/clients/resetpassword', resetPassword);
clientRouter.post('/clients/reset', passwordReset);
clientRouter.post('/clients/login', clientLogin);
clientRouter.get('/clients/companies', getCompanies);
clientRouter.post('/clients/alert', sendAlertMail);
clientRouter.post('/clients/emails', getClientEmail);
export default clientRouter;
