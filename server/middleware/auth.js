import jwt from 'jsonwebtoken';
import Client from '../models/client.model.js';
// todo:auth setup for all stakeholders
const client = async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        res.status(401).send('Not authorized, no token');
      }
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get client from the token
      req.client = await Client.findById(decoded.id).select('-password');
      if (req.client === null)
        return res
          .status(404)
          .json({ status: 'fail', message: 'Client not found' });
      next();
    } catch (error) {
      res.status(401).send('Not authorized');
    }
  } else if (req.query.token) {
    try {
      // Get token as params when using SSE
      token = req.query.token;
      if (!token) {
        res.status(401).send('Not authorized, no token');
      }
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get client from the token
      req.client = await Client.findById(decoded.id).select('-password');
      if (req.client === null)
        return res
          .status(404)
          .json({ status: 'fail', message: 'Client not found' });
      next();
    } catch (error) {
      res.status(401).send('Not authorized');
    }
  }
};
export default { client };
