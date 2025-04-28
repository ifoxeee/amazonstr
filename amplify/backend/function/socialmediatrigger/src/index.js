const AWS = require('aws-sdk');
const axios = require('axios');

exports.handler = async (event) => {
  const s3 = new AWS.S3();
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  
  // Only trigger for new images in /social-media-uploads/
  if (key.startsWith('social-media-uploads/')) {
    const presignedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: 3600
    });

    // Post to Instagram
    await axios.post('https://graph.facebook.com/v18.0/17841400000000000/media', {
      image_url: presignedUrl,
      caption: `New product! Shop now: ${process.env.AMPLIFY_APP_URL}`,
      access_token: process.env.INSTAGRAM_TOKEN
    });

    // Add similar blocks for TikTok & YouTube APIs
  }
  return { status: 'Processed' };
};
