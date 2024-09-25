import locationModel from '../models/location.model.js';
import getAnalysisUpdates from '../utils/sse/getAnalysisUpdates.js';
import getLocationUpdates from '../utils/sse/getLocationUpdates.js';
import AnalysisModel from '../models/analysis.model.js';

export const getLocationData = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  // eslint-disable-next-line no-console
  console.log('client connected');

  const sendLocationUpdates = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial product data
  const locationData = await getLocationUpdates();
  // sendUpdates(analysisData);
  sendLocationUpdates(locationData);

  // Listen for changes in the location collection and send updates
  const locationChangeStream = locationModel.watch();
  locationChangeStream.on('change', async () => {
    const data = await getLocationUpdates();
    sendLocationUpdates(data);
  });

  // Cleanup SSE connection when the client disconnects
  res.on('close', () => {
    locationChangeStream.close();
    res.end();
  });
};

// sse for product analysis
export const getAnalysisData = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');

  // eslint-disable-next-line no-console
  console.log('client connected');

  const sendUpdates = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Send initial product data
  const analysisData = await getAnalysisUpdates();
  sendUpdates(analysisData);

  // Listen for changes in the Analysis collection and send updates
  const analysisChangeStream = AnalysisModel.watch();
  analysisChangeStream.on('change', async () => {
    const data = await getAnalysisUpdates();
    sendUpdates(data);
  });

  // Cleanup SSE connection when the client disconnects
  res.on('close', () => {
    analysisChangeStream.close();
    res.end();
  });
};

export const postAnalysisData = async (req, res) => {
  try {
    const { productName, Location } = req.body;
    const response = await AnalysisModel.findOne({ productName });
    if (!response) {
      const newData = new AnalysisModel(req.body);
      newData.Count = 1;
      newData.save();
      return res.status(200).json({
        status: 'success',
        message: 'Successfully Added new data',
      });
    }
    const updateData = await AnalysisModel.findOneAndUpdate(
      { productName },
      { $push: { Location }, $inc: { Count: 1 } }
    );
    if (updateData) {
      return res.status(200).json({
        status: 'success',
        message: 'Successfully updated analysis data',
        data: updateData,
      });
    }
    return res.status(200).json({
      status: 'fail',
      message: 'error while updating existing data',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
      error,
    });
  }
};

export const postLocationData = async (req, res) => {
  try {
    const locationData = req.body;
    const location = new locationModel(locationData);
    await location.save();
    return res
      .status(200)
      .json({ status: 'success', message: 'location added successfully' });
  } catch (error) {
    return res
      .status(400)
      .json({ status: 'error', message: 'something went wrong', error });
  }
};
