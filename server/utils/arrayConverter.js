export const convertObjectToArray = (array) =>
  array.map((obj) => [obj.key, obj.value]);

export const convertArrayToObject = (array) =>
  array.map((arr) => ({ key: arr[0], value: arr[1] }));

// module.exports = { convertArrayToObject, convertObjectToArray };
