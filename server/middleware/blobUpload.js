import  { docHash } from '../utils/utilities.js';

import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';

function sanitizeFilename(filename) {
  // Replace spaces with underscores
  let sanitized = filename.replace(/ /g, '_');

  // Remove any other special characters using a regex
  sanitized = sanitized.replace(/[^A-Za-z0-9_\-\.]/g, '');

  // URL encode the filename to ensure it's safe for URLs
  sanitized = encodeURIComponent(sanitized);

  return sanitized;
}

const azureAuthentication = async () => {
  try {
    const AZURE_STORAGE_CONNECTION_STRING =
      process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!AZURE_STORAGE_CONNECTION_STRING) {
      throw Error('Azure Storage Connection string not found');
    }

    // Create the BlobServiceClient object with connection string
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    return blobServiceClient;
  } catch (error) {
    console.log('Azure Auth Error:', error);
  }
};

export const uploadImageToBlob = async (file) => {
  try {
    const blobServiceClient = await azureAuthentication();
    const { blockBlobURL } = await azureUpload(file, blobServiceClient);
    // console.log(x, 'x');
    return blockBlobURL;
  } catch (error) {
    console.log('Azure Auth Error:', error);
    return error;
  }
};
export const uploadDocsToBlob = async (files) => {
  try {
    // console.log([files], 'files');
    const blobServiceClient = await azureAuthentication();
    const uploadedFiles = [];
    const docDetails = [];
    // Ensure files is always an array
    if (!Array.isArray(files)) {
      files = [files];
    }
    if (files && files.length > 0) {
      for (const file of files) {
        const { blockBlobURL, blobName } = await azureUpload(
          file,
          blobServiceClient
        );
        const string = JSON.stringify(file);
        const hash = docHash(string);
        uploadedFiles.push(blockBlobURL);
        const documents = {
          fileName: blobName,
          url: blockBlobURL,
          docHash: hash,
          docType: file.mimetype.split('/')[1],
        };
        docDetails.push(documents);
      }
    }
    return { uploadedFiles, docDetails };
  } catch (error) {
    console.log('Azure Auth Error:', error);
    return error;
  }
};

const azureUpload = async (file, blobServiceClient) => {
  const containerName = process.env.CONTAINER_NAME;
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const containerURL = containerClient.url;

  const blobName = file.name;
  const sanitizedFilename = sanitizeFilename(blobName);
  const blockBlobClient = containerClient.getBlockBlobClient(sanitizedFilename);
  // Get a BlockBlobURL object that points to the specified blob
  const blockBlobURL = blockBlobClient.url;
  // Upload data to the blob
  const data = file.data;
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length, {
    blobHTTPHeaders: {
      blobContentType: file.mimetype,
    },
  });
  // Generate a SAS token for the blob with read permission and specify the protocol as HTTPS
  const blobSAS = generateBlobSASQueryParameters(
    {
      containerName: containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // Expires in 1 hour
      protocol: SASProtocol.HTTPS,
    },
    new StorageSharedKeyCredential(
      blobServiceClient.accountName,
      blobServiceClient.credential.accountKey
    )
  );

  // Construct the blob URL with SAS token
  const blobURLWithSAS = `${blockBlobURL}?${blobSAS.toString()}`;

  if (blockBlobURL) {
    return { blockBlobURL, blobName };
  } else {
    return false;
  }
};
