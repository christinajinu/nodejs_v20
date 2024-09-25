import bcrypt from 'bcrypt';
import cryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import generator from 'generate-password';
import crypto from 'crypto';
// Encrypt password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Generate token
export const generateToken = async (id) => {
  const jwtSecret = process.env.JWT_SECRET;
  const token = jwt.sign({ id }, jwtSecret);
  return token;
};

//Generate random password (with uppercase, lowercase, numbers and symbols)
export const generatePassword = async () => {
  const password = generator.generate({
    length: 10,
    numbers: true,
    symbols: false,
    excludeSimilarCharacters: true,
    strict: true,
  });
  return password;
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const generateCompanyId = async (companyName) => {
  const company = companyName.slice(0, 4);
  const randomString1 = crypto.randomBytes(2).toString('hex');
  return company + randomString1;
};
export const getAssetId = async (batchId, companyId) => {
  try {
    const assetId = batchId + companyId;
    return assetId;
  } catch (error) {
    console.error(error);
  }
};
export const docHash = (file) => {
  // const secretKey = process.env.JWT_SECRET;
  const hash = cryptoJS.SHA3(file, { outputLength: 256 }).toString();
  return hash;
};
