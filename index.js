const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Create the upload folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Endpoint to receive and sign IPA files
app.post('/sign', upload.fields([
  { name: 'ipa', maxCount: 1 },
  { name: 'p12', maxCount: 1 },
  { name: 'mobileprovision', maxCount: 1 }
]), async (req, res) => {
  const ipa = req.files['ipa'][0].path;
  const p12 = req.files['p12'][0].path;
  const mobileprovision = req.files['mobileprovision'][0].path;
  const output = path.join(uploadDir, `signed-${Date.now()}.ipa`);

  // Change password if needed (default is "password")
  const signCmd = `isign -i "${ipa}" -c "${p12}" -p "password" -m "${mobileprovision}" -o "${output}"`;

  exec(signCmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Sign error:', stderr);
      return res.status(500).send('Signing failed');
    }

    // Send the signed IPA file to the client
    res.download(output, () => {
      // Delete temporary files after sending
      [ipa, p12, mobileprovision, output].forEach(f => fs.unlinkSync(f));
    });
  });
});

app.listen(port, () => {
  console.log(`LacVN iSign backend is running on port ${port}`);
});
