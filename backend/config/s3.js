const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Detect storage mode based on whether AWS credentials are present
const storageMode =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? 's3'
    : 'local';

let s3Client = null;

if (storageMode === 's3') {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log('☁️  Storage mode: AWS S3');
} else {
  console.log('💾  Storage mode: Local disk (uploads/ folder)');
}

/**
 * Generate a presigned URL to directly read an S3 object.
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiry in seconds (default 3600)
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  if (!s3Client) throw new Error('S3 not configured');
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
};

module.exports = { s3Client, storageMode, getPresignedUrl };
