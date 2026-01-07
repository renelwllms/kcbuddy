const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

function createS3Client() {
  if (!process.env.S3_REGION || !process.env.S3_ACCESS_KEY_ID) {
    return null;
  }

  return new S3Client({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  });
}

async function createPresignedUpload({ key, contentType }) {
  const client = createS3Client();

  if (!client) {
    throw new Error("S3 is not configured");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  const publicBase = process.env.S3_PUBLIC_BASE_URL;
  const publicUrl = publicBase ? `${publicBase}/${key}` : null;

  return { uploadUrl, publicUrl };
}

module.exports = { createPresignedUpload };