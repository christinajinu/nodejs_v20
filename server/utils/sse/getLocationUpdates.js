import LocationModel from '../../models/location.model.js';

const getLocationUpdates = async () => {
  try {
    const locations = await LocationModel.aggregate([
      {
        $group: {
          _id: '$cityCountry',
          count: { $count: {} },
        },
      },
    ]);
    return locations;
  } catch (error) {
    return error;
  }
};
export default getLocationUpdates;
