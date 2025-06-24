const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/File');
const Title = require('../models/Title');
const { s3, PutObjectCommand, GetObjectCommand, getSignedS3Url } = require('../utils/s3Client');

exports.downloadTitleAsZip = async (req, res) => {
  const { titleId } = req.params;

  try {
    const files = await File.find({ title: titleId });
    const title = await Title.findById(titleId);
    if (!files.length || !title) return res.status(404).json({ message: 'No files found' });

    const folderName = title.name.replace(/\s+/g, '_');
    const zipId = uuidv4();
    const zipPath = path.join(__dirname, `../tmp/${zipId}.zip`);

    await fs.ensureDir(path.dirname(zipPath));

    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(output);

    const { Readable } = require('stream');
    for (const file of files) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: file.s3Key,
      });
      const s3Response = await s3.send(command);
      const stream = s3Response.Body;
      archive.append(stream, { name: `${folderName}/${file.name}` });
    }

    await archive.finalize();
    await new Promise((resolve) => output.on('close', resolve));

    const zipStream = fs.createReadStream(zipPath);
    const zipKey = `zips/${zipId}.zip`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: zipKey,
      Body: zipStream,
      ContentType: 'application/zip',
    }));

    await fs.remove(zipPath);

    const signedUrl = await getSignedS3Url(zipKey);
    res.json({ downloadUrl: signedUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'error in oreoering file to download' });
  }
};