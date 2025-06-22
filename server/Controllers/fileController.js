
const File = require("../models/File")
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { log } = require("console");

const s3 = require('../utils/s3Client');
const BUCKET = process.env.S3_BUCKET_NAME;

const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand , GetObjectCommand} = require('@aws-sdk/client-s3');

const uploadFile = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) {
      return res.status(400).send({ message: "No file has been uploaded" });
    }

    const filePath = req.file.path; // הנתיב בדיסק
    const fileStream = fs.createReadStream(filePath);
    const result = await s3.upload({
      Bucket: BUCKET,
      Key: Date.now() + '-' + req.file.originalname,
      Body: fileStream,
      ContentType: req.file.mimetype,
    }).promise();
    await fs.promises.unlink(filePath);


    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.Key}`;

    const newFile = await File.create({
      name: req.file.originalname,
      url: fileUrl,
      s3Key: result.Key,
      size: Number((req.file.size / 1024).toFixed(2)),
      title,
    });
    if (!newFile) {
      return res.status(500).send({ message: "Error creating file record in database" });
    }

    res.status(201).send(newFile);
  } catch (err) {
    res.status(500).send({ message: "Error uploading File", error: err.message });
  }
};

const getFilesByTitle = async (req, res) => {
  try {
    const { titleId } = req.params;
    const files = await File.find({ title: titleId }).populate("title").exec();

    if (!files || files.length === 0) {
      return res.status(204).send([]);
    }

    res.status(200).send(files);
  } catch (err) {
    res.status(500).send({
      message: "Error fetching files by title",
      error: err.message,
    });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const files = await File.find().populate("title").exec();
    res.status(200).send(files);
  } catch (err) {
    res.status(500).send({ message: "Error fetching files ", error: err.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send({ message: "No file found" });
    }
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: file.s3Key,
      ResponseContentDisposition: `attachment; filename="${file.name}"`,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    res.redirect(url);
  } catch (err) {
    res.status(500).send({
      message: "Error downloading file",
      error: err.message,
    });
  }
};

const deleteFileFunction = async (fileId) => {
  const file = await File.findById(fileId);
  if (!file) throw new Error("File not found");
  try {
    await s3.deleteObject({
      Bucket: BUCKET,
      Key: file.s3Key,
    }).promise();
  } catch (err) {
    console.error("S3 delete error:", err.message);
  }
  await File.deleteOne({ _id: fileId });
};

const deleteFile = async (req, res) => {
  const { fileId } = req.params;
  try {
    await deleteFileFunction(fileId);
    res.status(200).send({ message: "File deleted successfuly" });
  } catch (err) {
    console.error("Error in deleting file: ", err.message);
    res.status(500).send({
      message: "Error in deleting file",
      error: err.message,
    });
  }
};

const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const existingFile = await File.findById(fileId);
    if (!existingFile) {
      return res.status(404).send({ message: "File not found" });
    }
    if (!req.file) {
      return res.status(400).send({ message: "No file has been chosen for update" });
    }
    await s3.deleteObject({
      Bucket: BUCKET,
      Key: existingFile.s3Key,
    }).promise();

    const filePath = req.file.path; // הנתיב בדיסק
    const fileStream = fs.createReadStream(filePath);
    const result = await s3.upload({
      Bucket: BUCKET,
      Key: Date.now() + '-' + req.file.originalname,
      Body: fileStream,
      ContentType: req.file.mimetype,
    }).promise();
    await fs.promises.unlink(filePath);

    const newUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${result.Key}`;

    // עדכון במסד
    existingFile.name = req.file.originalname;
    existingFile.s3Key = result.Key;
    existingFile.url = newUrl;
    existingFile.size = Number((req.file.size / 1024).toFixed(2));
    await existingFile.save();

    res.status(200).send(existingFile);

  } catch (err) {
    console.error("Error in update file:", err);
    res.status(500).send({ message: "Error in update file", error: err.message });
  }
};

const viewFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: file.s3Key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });


    // res.redirect(url);
    res.status(200).json({
      url,
      name: file.name,
      contentType: mime.lookup(file.name) || 'application/octet-stream'
    });
  } catch (err) {
    res.status(500).send({
      message: "Error viewing file content",
      error: err.message,
    });
  }
};

/* */

const getPresignedUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    if (!fileName || !fileType) {
      return res.status(400).json({ message: "File name and type are required" });
    }
    const key = `${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType
    });
    if (!command) {
      return res.status(500).json({ message: "Error creating S3 command" });
    }
    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 דקות
    if (!url) {
      return res.status(500).json({ message: "Error generating presigned URL" });
    }
    res.status(200).json({ url, key });
  } catch (err) {
    console.error("Presigned URL error:", err); // חשוב מאוד להוסיף את זה
    res.status(500).json({
      message: "Error generating presigned URL",
      error: err.message
    });
  }
};

const saveFileMetadata = async (req, res) => {
  try {
    const { name, customName, s3Key, url, title, size } = req.body;
    if (!name || !s3Key || !url || !title || size === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const file = await File.create({
      name,
      customName: customName || null,
      s3Key,
      url,
      title,
      size,
    });

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ message: "Error saving file metadata", error: err.message });
  }
};

module.exports = {
  uploadFile,
  getFilesByTitle,
  getAllFiles,
  downloadFile,
  deleteFileFunction,
  deleteFile,
  updateFile,
  viewFileContent,
  getPresignedUrl,
  saveFileMetadata
};