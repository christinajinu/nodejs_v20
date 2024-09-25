const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { docHash } = require('../utils/utilities');

// Function to upload files to S3 and return their URLs
async function uploadFilesToS3(files, bucketName, bucketRegion) {
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: bucketRegion,
  });

  const uploadedFiles = [];
  const docDetails = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const encodedFileName = encodeURIComponent(file.originalname);
      const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: encodedFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentEncoding: 'base64',
        ACL: 'public-read',
      };
      const command = new PutObjectCommand(uploadParams);

      try {
        await s3Client.send(command);
        const objectUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${encodedFileName}`;
        //  the file is stringified and hash is taken for that string.
        const string = JSON.stringify(file);
        const hash = docHash(string);
        uploadedFiles.push({ objectUrl }); // Add objectUrl to the file object
        const documents = {
          fileName: encodedFileName,
          url: objectUrl,
          docHash: hash,
          docType: file.mimetype.split('/')[1],
        };
        docDetails.push(documents);
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
      }
    }
  }
  return { uploadedFiles, docDetails };
}
async function uploadImageToS3(files, bucketName, bucketRegion) {
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: bucketRegion,
  });

  const uploadedImage = [];

  if (files && files.length > 0) {
    for (const file of files) {
      const encodedFileName = encodeURIComponent(file.originalname);
      const uploadParams = {
        Bucket: process.env.BUCKET_NAME,
        Key: encodedFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentEncoding: 'base64',
        ACL: 'public-read',
      };
      const command = new PutObjectCommand(uploadParams);

      try {
        await s3Client.send(command);
        const objectUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${encodedFileName}`;
        //  the file is stringified and hash is taken for that string.
        uploadedImage.push({ objectUrl }); // Add objectUrl to the file object
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
      }
    }
  }
  return uploadedImage;
}
module.exports = {
  uploadFilesToS3,
  uploadImageToS3,
};
