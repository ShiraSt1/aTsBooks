
const File = require("../models/File")
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { log } = require("console");

const s3 = require('../utils/s3Client');
const BUCKET = process.env.S3_BUCKET_NAME;

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
    const url = s3.getSignedUrl('getObject', {
      Bucket: BUCKET,
      Key: file.s3Key,
      Expires: 60,
      ResponseContentDisposition: `attachment; filename="${file.name}"`,
    });

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
    
    const url = s3.getSignedUrl('getObject', {
      Bucket: BUCKET,
      Key: file.s3Key,
      Expires: 60
    });

    res.redirect(url);
  } catch (err) {
    res.status(500).send({
      message: "Error viewing file content",
      error: err.message,
    });
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
};