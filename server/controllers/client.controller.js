import bcrypt from 'bcrypt';
import Client from '../models/client.model.js';
import {
  hashPassword,
  generatePassword,
  generateToken,
  verifyToken,
  generateCompanyId,
} from '../utils/utilities.js';
import { sendMail } from '../services/sendMail.js';
const url = process.env.CLIENTURL;
export const registerAdmin = async (req, res) => {
  try {
    const {
      companyName,
      firstName,
      lastName,
      email,
      role,
      archive,
      designation,
    } = req.body;

    if (!companyName || !firstName || !email || !lastName)
      return res
        .status(400)
        .json({ status: 'failed', message: 'Please Add All Fields' });
    //Create Company Id
    const companyId = await generateCompanyId(companyName);
    if (!companyId) {
      return res
        .status(400)
        .json({ status: 'failed', message: 'Company ID required' });
    }
    const clientExist = await Client.findOne({ email });
    if (clientExist)
      return res
        .status(400)
        .json({ status: 'Failed', message: 'User Exists. Check the Email ID' });

    //generate random password
    const password = await generatePassword();
    console.log(password);
    // Hash password
    const hashedPassword = await hashPassword(password);
    // Create user
    const admin = await Client.create({
      companyName,
      companyId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      designation,
      role,
      archive,
    });
    if (admin) {
      const emailData = {
        login_link: `${url}/login`,
        year: new Date().getFullYear(),
        login_password: password,
        login_email: email,
        firstName: firstName,
        lastName: lastName,
      };

      sendMail({
        to: email,
        subject: 'Welcome!',
        template: 'welcome.html',
        data: emailData,
      });
      // const APIkey = await generateToken(admin._id);
      // const updatedAPIKey = await Client.findByIdAndUpdate(
      //   admin._id,
      //   { APIKey: APIkey, adminId: admin._id },
      //   {
      //     new: true,
      //     runValidators: true,
      //   }
      // );
      // if (updatedAPIKey) {
      return res.status(200).json({
        status: 'success',
        message: 'Admin added Successfully',
        adminData: admin,
      });
      // }
    }
    return res
      .status(400)
      .json({ status: 'fail', message: 'Failed to add to DB' });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while creating user.',
      error: error.message,
    });
  }
};
export const clientExist = async (req, res) => {
  try {
    const { email } = req.body;
    const findUser = await Client.findOne({ email });
    const clientId = req.client._id;
    const client = await Client.findById(clientId);

    const vendorExists = client.vendors.some(
      (vendor) => vendor.companyId.toString() === findUser.companyId.toString()
    );

    if (vendorExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Client is already registered in your Application',
      });
    }
    if (findUser) {
      const clientData = await Client.findByIdAndUpdate(
        clientId,
        {
          $push: {
            vendors: {
              userId: findUser._id,
              companyId: findUser.companyId,
              company: findUser.companyName,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        status: 'success',
        message: 'Client Added Successfully',
        clientData: clientData,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while registering the client',
      error: error.message,
    });
  }
};
// @description: register a client
// @request: POST
// @route: api/v1/clients/
// @access: private
// @return: message
export const registerClient = async (req, res) => {
  try {
    const {
      companyName,
      firstName,
      lastName,
      email,
      archive,
      designation,
      role,
    } = req.body;
    const registrarId = req.client._id;
    // const adminId = req.client.adminId;
    // const APIKey = req.client.APIKey;
    // const rank = req.client.role;
    if (
      !companyName ||
      !firstName ||
      !email ||
      !lastName ||
      !registrarId ||
      !role
    )
      return res
        .status(400)
        .json({ status: 'failed', message: 'Please Add All Fields' });

    const clientExist = await Client.findOne({ email });
    if (clientExist)
      return res.status(400).json({
        status: 'Failed',
        message: 'The User is already registered in the Supplychain Platform',
      });
    const companyId = await generateCompanyId(companyName);
    if (!companyId) {
      return res
        .status(400)
        .json({ status: 'failed', message: 'Company ID required' });
    }
    //generate random password
    const password = await generatePassword();
    console.log(password);
    // Hash password
    const hashedPassword = await hashPassword(password);
    // Create user
    const client = await Client.create({
      companyName,
      companyId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      designation,
      archive,
      registrarId,
      role,
    });
    if (client) {
      const emailData = {
        // todo:login link
        login_link: `${url}/login`,
        year: new Date().getFullYear(),
        login_password: password,
        login_email: email,
        firstName: firstName,
        lastName: lastName,
      };
      // todo: Email template need to updated
      sendMail({
        to: email,
        subject: 'Welcome!',
        template: 'welcome.html',
        data: emailData,
      });
      await Client.findByIdAndUpdate(
        { _id: registrarId },
        {
          $push: {
            vendors: {
              userId: client._id,
              companyId: client.companyId,
              company: client.companyName,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
      return res.status(200).json({
        status: 'success',
        message: 'Client Added Successfully',
        clientData: client,
      });
    }
    return res
      .status(400)
      .json({ status: 'fail', message: 'Failed to add to DB' });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while creating user.',
      error: error.message,
    });
  }
};

// @description: login
// @request: POST
// @route: api/v1/clients/login
// @access: private
// @return: message
export const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ status: 'error', message: 'Please Add All Fields' });

    const client = await Client.findOne({ email });
    // const { _id, firstName, lastName, designation, role } = client;
    if (client && (await bcrypt.compare(password, client.password))) {
      return res.status(200).json({
        status: 'success',
        message: 'Client logged in',
        token: await generateToken(client._id),
        client: client,
      });
    }
    return res
      .status(401)
      .json({ status: 'error', message: 'Invalid Credentials' });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message:
        'something went wrong while user login/not a registered Email Id.',
    });
  }
};

// @description: archive a client
// @request: DELETE
// @route: api/v1/clients/
// @access: private
// @return: message
export const deleteClient = async (req, res) => {
  try {
    if (!req.body._id)
      return res.status(400).json({ status: 'error', message: 'Id not found' });
    const deletedClient = await Client.findByIdAndUpdate(
      req.body._id,
      [{ $set: { archive: { $eq: [false, '$archive'] } } }],
      {
        new: true,
        runValidators: true,
      }
    );
    if (!deletedClient) {
      return res.status(404).json({ status: 'fail', message: 'No data found' });
    }

    const { firstName, lastName, archive } = deletedClient;
    res.status(200).json({
      status: 'success',
      message: `${firstName} ${lastName} is ${
        archive ? 'archived' : 'restored'
      } successfully`,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while deleting the user',
      error: error.message,
    });
  }
};
// not needed now
export const getRegisteredUsers = async (req, res) => {
  try {
    const id = req.client._id;
    const users = await Client.find({ registrarId: id });
    res.status(200).send(users);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while fetching all user data.',
    });
  }
};
// @description: get all client details
// @request: GET
// @route: api/v1/clients/
// @access: private
// @return: message
export const getAllClients = async (req, res) => {
  try {
    const client = await Client.find();
    res.status(200).send(client);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while fetching all user data.',
    });
  }
};
export const getUsers = async (req, res) => {
  try {
    const _id = req.client._id;
    const client = await Client.find({ _id: _id }).select('-password');
    if (!client) {
      return res.status(404).send('Client not found');
    }

    const vendors = client[0].vendors; // Assuming vendors is an array of vendor IDs
    const userDocuments = [];
    for (const vendor of vendors) {
      const users = await Client.find({ _id: vendor.userId }); // Assuming User model and _id field for userId
      userDocuments.push(...users);
    }

    // Return the user documents or do whatever you need with them
    res.status(200).json(userDocuments);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};
// @description: get my details
// @request: GET
// @route: api/v1/clients/me
// @access: private
// @return: message
export const getMe = async (req, res) => {
  try {
    const id = req.client._id;
    const myData = await Client.find({ _id: id }).select('-password');
    if (!myData) {
      return res.status(404).json({
        status: 'error',
        message: "couldn't find your data, please try again after sometime.",
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'my data fetched successfully.',
      data: myData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while while fetching my info',
    });
  }
};

// @description: update details
// @request: PATCH
// @route: api/v1/clients/
// @access: private
// @return: message
export const updateClient = async (req, res) => {
  try {
    const id = req.client._id;
    const updateData = req.body;
    const updatedClient = await Client.findByIdAndUpdate(
      { _id: id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');
    if (!updatedClient) {
      return res.status(404).json({ status: 'fail', message: 'No data found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'User data updated successfully',
      data: updatedClient,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while updating user',
    });
  }
};

// @description: update password
// @request: PATCH
// @route: api/v1/clients/me
// @access: private
// @return: message
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ status: 'fail', message: 'Please Add All Fields' });

    const client = await Client.findOne({ email: req.client.email });
    //   is it req.client or req.body.email

    if (client && (await bcrypt.compare(oldPassword, client.password))) {
      // Hash password
      const hashedPassword = await hashPassword(newPassword);

      const updatedData = await Client.findOneAndUpdate(
        { email: req.client.email },
        { $set: { password: hashedPassword }, resetPassword: true }
      );
      if (updatedData)
        return res.status(200).json({
          status: 'success',
          message: 'Password updated successfully',
        });
    } else {
      return res
        .status(401)
        .json({ status: 'failed', message: 'Current Password is Incorrect' });
    }
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while updating password',
    });
  }
};

// @description: forgot password link
// @request: PATCH
// @route: api/v1/clients/forgotpassword
// @access: private
// @return: message
export const forgotPassword = async (req, res) => {
  try {
    const client = await Client.findOne({ email: req.body.email });
    if (!client) {
      return res
        .status(404)
        .json({ status: 'error', message: 'email is not registered' });
    }
    // eslint-disable-next-line no-underscore-dangle
    const clientId = client._id;
    const expiresIn = '1h';
    const token = await generateToken({ clientId }, { expiresIn });
    const decodedToken = verifyToken(token);
    const emailData = {
      name: client.firstName,
      token,
      email: client.email,
      exp: decodedToken.exp,
      login_link: `${url}`,
    };
    if (client) {
      sendMail({
        to: client.email,
        subject: 'Reset password!',
        template: 'reset_password.html',
        data: emailData,
      });
      return res.status(200).json({
        status: 'success',
        message: 'Reset Password link sent to the registered mail id',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Error while reset the password',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error while reset password',
      error,
    });
  }
};

// @description: reset client password
// @request: PATCH
// @route: api/v1/clients/resetpassword
// @access: private
// @return: message
export const resetPassword = async (req, res) => {
  try {
    // eslint-disable-next-line prettier/prettier, prefer-destructuring
    const token = getToken(req);
    const decodedToken = verifyToken(token);

    if (!decodedToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Sorry, This link is expired... Try Again!',
      });
    }

    const client = await Client.findOne({ email: req.body.email });
    if (!client) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is not Registered',
      });
    }
    // Hash password
    const hashedPassword = encryptPassword(req.body.newPassword);
    const updatedData = await Client.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: hashedPassword } }
    );

    if (updatedData) {
      return res.status(200).json({
        status: 'success',
        message: 'Password updated successfully',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Error while reset the password',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        status: 'error',
        message: 'Reset password link has expired. Please request a new link.',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Error while reset the password',
      error,
    });
  }
};

// @description: reset client password
// @request: POST
// @route: api/v1/clients/reset
// @access: private
// @return:
export const passwordReset = async (req, res) => {
  try {
    const client = await Client.findOne({ email: req.body.email });
    if (!client) {
      return res.status(404).json({
        status: 'error',
        message: 'No client account found with this email',
      });
    }

    // generate random password
    const newPassword = await generatePassword();
    // Hash password
    const hashedPassword = await hashPassword(newPassword);
    const updatedData = await Client.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: hashedPassword } },
      {
        new: true,
        runValidators: true,
      }
    );
    const emailData = {
      name: `${updatedData.firstName} ${updatedData.lastName}`,
      password: newPassword,
      year: new Date().getFullYear(),
    };
    if (updatedData) {
      sendMail({
        to: updatedData.email,
        subject: 'Reset password!',
        template: 'forgot_password.html',
        data: emailData,
      });

      return res.status(200).json({
        status: 'success',
        message:
          'We have emailed your new password. Please follow the instructions in the email to log in and change your password.',
        newPassword,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  } catch (error) {
    return res.status(500).json({
      status: error,
      message: 'Something went wrong. Please try again later.',
      error,
    });
  }
};
// ?need change ..remove client role  used in view app frontpge
export const getCompanies = async (req, res) => {
  try {
    const client = await Client.find({ role: 'client' });
    res.status(200).send(client);
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while fetching all user data.',
    });
  }
};

export const sendAlertMail = async (req, res) => {
  try {
    const { emails, emailSubject, emailBody } = req.body;

    if (!emails || !emailSubject || !emailBody) {
      return res.status(400).json({
        status: 'error',
        message: 'Emails, subject, and body are all required fields.',
      });
    }

    if (
      !Array.isArray(emails) ||
      emails.length === 0 ||
      !emails.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide valid email addresses.',
      });
    }

    const emailData = {
      emails: emails,
      emailSubject,
      emailBody,
    };

    await sendMail({
      to: emails,
      subject: emailSubject,
      template: 'alert_template.html',
      data: emailData,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Alert mail sent to the registered email IDs.',
    });
  } catch (error) {
    console.error('Error sending alert mail', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while sending emails.',
      error: error.message || error,
    });
  }
};

export const getClientEmail = async (req, res) => {
  try {
    const { creatorIds } = req.body;

    if (!creatorIds || !Array.isArray(creatorIds) || creatorIds.length === 0) {
      return res.status(400).json({
        status: 'warning',
        message: 'A non-empty array of creator IDs is required.',
      });
    }

    const clientDetails = await Client.find({ _id: { $in: creatorIds } });

    if (clientDetails.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No client email details found for the provided IDs.',
      });
    }

    const clientMailIds = clientDetails.map((client) => ({
      email: client.email,
      companyName: client.companyName,
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Client emails fetched successfully.',
      data: clientMailIds,
    });
  } catch (error) {
    console.error('Error retrieving client emails', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving client emails.',
      error: error.message || error,
    });
  }
};

// export default{
//   // registerAdmin,
//   registerClient,
//   clientExist,
//   clientLogin,
//   deleteClient,
//   getAllClients,
//   getRegisteredUsers,
//   getCompanies,
//   getMe,
//   updateClient,
//   updatePassword,
//   forgotPassword,
//   resetPassword,
//   passwordReset,
//   getUsers,
//   sendAlertMail,
//   getClientEmail,
// };
