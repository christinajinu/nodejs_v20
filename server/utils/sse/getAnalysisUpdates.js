import AnalysisModel from '../../models/analysis.model.js';

const getAnalysisUpdates = async () => {
  try {
    const response = await AnalysisModel.find();
    return response;
  } catch (error) {
    return error;
  }
};

export default getAnalysisUpdates;
