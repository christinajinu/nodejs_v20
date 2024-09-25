import axios from 'axios';
import { ethers } from 'ethers';
import { gasStationURL } from '../services/instance.js';

let maxFeePerGas = BigInt('80000000000'); // fallback to 80 gwei
let maxPriorityFeePerGas = BigInt('40000000000'); // fallback to 40 gwei

const setOptimalGas = async () => {
  try {
    const { data } = await axios.get(gasStationURL);
    maxFeePerGas = ethers.parseUnits(
      `${Math.ceil(data.standard.maxFee)}`,
      'gwei'
    );
    maxPriorityFeePerGas = ethers.parseUnits(
      `${Math.ceil(data.standard.maxPriorityFee)}`,
      'gwei'
    );
  } catch (error) {
    console.error('Error fetching gas data:', error); // Log any errors that occur
  }
  return {
    maxFeePerGas,
    maxPriorityFeePerGas,
  };
};

export default setOptimalGas;
