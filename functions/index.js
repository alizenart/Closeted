const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();

exports.uploadImage = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).send('Unauthorized');
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;

      // Get request data
      const { base64Data, contentType, path } = req.body;

      if (!base64Data || !contentType || !path) {
        res.status(400).send('Missing required fields');
        return;
      }

      // Convert base64 to buffer
      const imageBuffer = Buffer.from(base64Data, 'base64');

      // Upload to Firebase Storage
      const bucket = admin.storage().bucket();
      const file = bucket.file(path);

      await file.save(imageBuffer, {
        metadata: {
          contentType,
          metadata: {
            uploadedBy: uid,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      res.status(200).send('Upload successful');
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).send(error.message);
    }
  });
});