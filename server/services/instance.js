import { ethers } from 'ethers';
import SupplyChain from '../contracts/Supplychain.json' assert { type: 'json' };

// Access the `abi` from the imported JSON object
const { abi } = SupplyChain;

const {
  NODE_ENV,
  PRIVATE_KEY,
  ALCHEMY_API_KEY,
  PRIVATE_KEY_AMOY,
  CONTRACT_ADDRESS,
  CONTRACT_ADDRESS_AMOY,
} = process.env;
console.log(process.env.PRIVATE_KEY);
console.log('vgvv');

const isMainnet = NODE_ENV === 'production';

export const provider = new ethers.AlchemyProvider(
  isMainnet ? 'matic' : 'matic-amoy',
  ALCHEMY_API_KEY
);
// Create an object with the environment-specific values

const privateKey = (isMainnet ? PRIVATE_KEY : PRIVATE_KEY_AMOY);
// 'a5c9752c3b17643760d22146aa592716b6eda0c23ec5fbf0e6dcbcfe8e6d9416';

const contractAddress = '0xD73feC1F321efe371F77C78CA075175FDA590cDA';
// isMainnet ? CONTRACT_ADDRESS : CONTRACT_ADDRESS_AMOY;

export const gasStationURL = isMainnet
  ? 'https://gasstation.polygon.technology/v2'
  : 'https://gasstation-testnet.polygon.technology/v2';

// 'https://gasstation.polygon.technology/v2'
// Create a signer

export const signer = new ethers.Wallet(privateKey, provider);

// Create a contract instance
export const contractInstance = new ethers.Contract(
  contractAddress,
  abi,
  signer
);

// module.exports = {
//   provider,
//   signer,
//   contractInstance,
//   gasStationURL,
// };
