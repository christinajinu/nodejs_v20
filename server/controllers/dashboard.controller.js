import Client from '../models/client.model.js';
import Batch from '../models/batch.model.js';
import batchModel from '../models/batch.model.js';

export const currentMonth = async (req, res) => {
  try {
    const id = req.client._id;
    const Users = await Client.find({ registrarId: id });
    const usersCount = Users.length || 0;
    // const registrarBatchCount = await batchModel.find({ registrarId: id });
    const registrarBatchCount = await batchModel.aggregate([
      {
        $match: {
          registrarId: id,
        },
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                {
                  $eq: [{ $month: '$createdAt' }, { $month: new Date() }],
                },
                {
                  $eq: [{ $year: '$createdAt' }, { $year: new Date() }],
                },
              ],
            },

            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
    ]);
    const registeredBatchCount = registrarBatchCount.length || 0;

    const transactionDetails = await batchModel.aggregate([
      {
        $match: {
          creatorId: id,
        },
      },

      { $unwind: '$transactionDetails' }, // Unwind the transactionDetails array
      {
        $redact: {
          $cond: [
            {
              $and: [
                {
                  $eq: [
                    { $month: '$transactionDetails.updatedAt' },
                    { $month: new Date() },
                  ],
                },
                {
                  $eq: [
                    { $year: '$transactionDetails.updatedAt' },
                    { $year: new Date() },
                  ],
                },
              ],
            },

            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },

      { $sort: { 'transactionDetails.updatedAt': -1 } }, // Sort based on updatedAt within the array
      {
        $group: {
          _id: id,
          blockchainDetails: { $push: '$transactionDetails' },
        },
      },
      {
        $project: {
          _id: 1, // Exclude the _id field if needed
          blockchainDetails: 1, // Include only the sorted transactionDetails array
        },
      },
    ]);

    const txnCounts = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                {
                  $eq: [{ $month: '$Count.updatedAt' }, { $month: new Date() }],
                },
                {
                  $eq: [{ $year: '$Count.updatedAt' }, { $year: new Date() }],
                },
              ],
            },

            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: '$Count.typeCount',
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const chartData = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                {
                  $eq: [{ $month: '$Count.updatedAt' }, { $month: new Date() }],
                },
                {
                  $eq: [{ $year: '$Count.updatedAt' }, { $year: new Date() }],
                },
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: {
            typeCount: '$Count.typeCount',
            day: { $dayOfMonth: '$Count.updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.typeCount',
          days: {
            $push: {
              day: '$_id.day',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          typeCount: '$_id',
          days: {
            $sortArray: {
              input: '$days',
              sortBy: { day: 1 },
            },
          },
        },
      },
      {
        $project: {
          typeCount: 1,
          dailyCounts: {
            $arrayToObject: {
              $map: {
                input: '$days',
                as: 'dayCount',
                in: {
                  k: { $toString: '$$dayCount.day' },
                  v: '$$dayCount.count',
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      message: 'all asset data fetched successfully.',
      usersCount,
      registeredBatchCount,
      transactionDetails,
      txnCounts,
      chartData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while fetching all asset data .',
      error: error,
    });
  }
};
export const lastSevenDays = async (req, res) => {
  try {
    const id = req.client._id;

    const Users = await Client.find({ registrarId: id });
    const usersCount = Users.length || 0;
    const lastSevenDays = new Date();
    lastSevenDays.setDate(lastSevenDays.getDate() - 7);
    const registrarBatchCount = await batchModel.aggregate([
      {
        $match: {
          registrarId: id,
        },
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$createdAt', lastSevenDays] }, // Match dates greater than or equal to lastSevenDays
                { $lt: ['$createdAt', new Date()] }, // Match dates less than current date
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
    ]);
    const registeredBatchCount = registrarBatchCount.length || 0;

    const transactionDetails = await batchModel.aggregate([
      {
        $match: {
          creatorId: id,
        },
      },
      { $unwind: '$transactionDetails' },
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$transactionDetails.updatedAt', lastSevenDays] }, // Match dates greater than or equal to lastSevenDays
                { $lt: ['$transactionDetails.updatedAt', new Date()] }, // Match dates less than current date
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      { $sort: { 'transactionDetails.updatedAt': -1 } }, // Sort based on updatedAt within the array
      {
        $group: {
          _id: id,
          blockchainDetails: { $push: '$transactionDetails' },
        },
      },
      {
        $project: {
          _id: 1, // Exclude the _id field if needed
          blockchainDetails: 1, // Include only the sorted transactionDetails array
        },
      },
    ]);
    const txnCounts = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$Count.updatedAt', lastSevenDays] }, // Match dates greater than or equal to lastSevenDays
                { $lt: ['$Count.updatedAt', new Date()] }, // Match dates less than current date
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: '$Count.typeCount',
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const chartData = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $match: {
          creatorId: id,
          'Count.updatedAt': {
            $gte: lastSevenDays,
            $lt: new Date(),
          },
        },
      },
      {
        $group: {
          _id: {
            typeCount: '$Count.typeCount',
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$Count.updatedAt' },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.date': 1,
        },
      },
      {
        $group: {
          _id: '$_id.typeCount',
          days: {
            $push: {
              date: '$_id.date',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          typeCount: '$_id',
          days: 1,
        },
      },
      {
        $project: {
          typeCount: 1,
          dailyCounts: {
            $arrayToObject: {
              $map: {
                input: '$days',
                as: 'dayCount',
                in: {
                  k: {
                    $dateToString: {
                      format: '%d-%m-%Y',
                      date: {
                        $dateFromString: { dateString: '$$dayCount.date' },
                      },
                    },
                  },
                  v: '$$dayCount.count',
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      message: 'all asset data fetched successfully.',
      usersCount,
      registeredBatchCount,
      transactionDetails,
      txnCounts,
      chartData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while fetching all asset data .',
      error: error,
    });
  }
};
export const currentYear = async (req, res) => {
  try {
    const id = req.client._id;
    const currentYear = new Date().getFullYear();
    const Users = await Client.find({ registrarId: id });
    const usersCount = Users.length || 0;
    const registrarBatchCount = await batchModel.aggregate([
      {
        $match: {
          registrarId: id,
        },
      },
      {
        $redact: {
          $cond: [
            {
              $eq: [{ $year: '$createdAt' }, currentYear], // Match documents with Count.updatedAt in the current year
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
    ]);
    const registeredBatchCount = registrarBatchCount.length || 0;

    const transactionDetails = await batchModel.aggregate([
      {
        $match: {
          creatorId: id,
        },
      },
      { $unwind: '$transactionDetails' },
      {
        $redact: {
          $cond: [
            {
              $eq: [{ $year: '$transactionDetails.updatedAt' }, currentYear], // Match documents with Count.updatedAt in the current year
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },

      // Unwind the transactionDetails array
      { $sort: { 'transactionDetails.updatedAt': -1 } }, // Sort based on updatedAt within the array
      {
        $group: {
          _id: id,
          blockchainDetails: { $push: '$transactionDetails' },
        },
      },
      {
        $project: {
          _id: 1, // Exclude the _id field if needed
          blockchainDetails: 1, // Include only the sorted transactionDetails array
        },
      },
    ]);
    const txnCounts = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $eq: [{ $year: '$Count.updatedAt' }, currentYear], // Match documents with Count.updatedAt in the current year
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: '$Count.typeCount',
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const chartData = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $eq: [{ $year: '$Count.updatedAt' }, currentYear], // Match documents with Count.updatedAt in the current year
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: {
            typeCount: '$Count.typeCount',
            month: { $month: '$Count.updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.typeCount',
          months: {
            $push: {
              month: '$_id.month',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          typeCount: '$_id',
          months: {
            $arrayToObject: {
              $map: {
                input: {
                  $sortArray: {
                    input: '$months',
                    sortBy: { month: 1 },
                  },
                },
                as: 'monthCount',
                in: {
                  k: {
                    $arrayElemAt: [
                      [
                        '',
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                      ],
                      '$$monthCount.month',
                    ],
                  },
                  v: '$$monthCount.count',
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      message: 'all asset data fetched successfully.',
      usersCount,
      registeredBatchCount,
      transactionDetails,
      txnCounts,
      chartData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: 'something went wrong while fetching all asset data.',
    });
  }
};
export const customData = async (req, res) => {
  try {
    const id = req.client._id;
    const startDate = new Date(req.params.sDate);
    const endDate = new Date(req.params.eDate);
    // Increment endDate by 1 day to include data until the end of that day
    endDate.setDate(endDate.getDate() + 1);
    const Users = await Client.find({ registrarId: id });
    const usersCount = Users.length || 0;
    // const registrarBatchCount = await batchModel.find({ registrarId: id });
    const registrarBatchCount = await batchModel.aggregate([
      {
        $match: {
          registrarId: id,
        },
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$createdAt', startDate] }, // Match dates greater than or equal to startDate
                { $lt: ['$createdAt', endDate] }, // Match dates less than endDate
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
    ]);

    const registeredBatchCount = registrarBatchCount.length || 0;
    const transactionDetails = await batchModel.aggregate([
      {
        $match: {
          creatorId: id,
        },
      },
      { $unwind: '$transactionDetails' }, // Unwind the transactionDetails array
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$transactionDetails.updatedAt', startDate] }, // Match dates greater than or equal to startDate
                { $lt: ['$transactionDetails.updatedAt', endDate] }, // Match dates less than endDate
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },

      { $sort: { 'transactionDetails.updatedAt': -1 } }, // Sort based on updatedAt within the array
      {
        $group: {
          _id: id,
          blockchainDetails: { $push: '$transactionDetails' },
        },
      },
      {
        $project: {
          _id: 1, // Exclude the _id field if needed
          blockchainDetails: 1, // Include only the sorted transactionDetails array
        },
      },
    ]);

    const txnCounts = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$Count.updatedAt', startDate] }, // Match dates greater than or equal to startDate
                { $lt: ['$Count.updatedAt', endDate] }, // Match dates less than endDate
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: '$Count.typeCount',
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const chartData = await batchModel.aggregate([
      {
        $unwind: '$Count', // Unwind the Count array
      },
      {
        $redact: {
          $cond: [
            {
              $and: [
                { $gte: ['$Count.updatedAt', startDate] }, // Match dates greater than or equal to startDate
                { $lt: ['$Count.updatedAt', endDate] }, // Match dates less than endDate
              ],
            },
            '$$KEEP',
            '$$PRUNE',
          ],
        },
      },
      {
        $match: {
          creatorId: id,
        },
      },
      {
        $group: {
          _id: {
            typeCount: '$Count.typeCount',
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$Count.updatedAt' },
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.date': 1, // Sort by date in ascending order
        },
      },
      {
        $group: {
          _id: '$_id.typeCount',
          dates: {
            $push: {
              date: '$_id.date',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          typeCount: '$_id',
          dateCounts: {
            $arrayToObject: {
              $map: {
                input: '$dates',
                as: 'dateCount',
                in: {
                  k: '$$dateCount.date',
                  v: '$$dateCount.count',
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      message: 'all asset data fetched successfully.',
      usersCount,
      registeredBatchCount,
      transactionDetails,
      txnCounts,
      chartData,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message:
        'something went wrong while fetching all assets data companywise.',
    });
  }
};
