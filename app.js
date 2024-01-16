const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

const PORT = 3001;

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.array("files[]"), async (req, res) => {
  console.log("req.files::::::::::::");
  console.log(req.body)
  const cdnUrls = await uploadFiles(req.files);
  res.json(cdnUrls);
});

async function uploadFiles(files) {
  console.log("UploadFiles::::::::::");

  let cdnUrls = [];

  files.forEach(async (file) => {
    let cdnUrl = await uploadToCloudStorage(file.buffer, file.originalname);
    cdnUrls.push(cdnUrl)
  });

  return cdnUrls;
}

async function uploadToCloudStorage(fileBuffer, fileName) {
  const { uploadFile } = await import("@uploadcare/upload-client");
  const file = await uploadFile(fileBuffer, {
    publicKey: "80754a04d338b9eb4178",
    fileName: fileName,
    contentType: "image/jpeg", // Adjust the content type based on your file type
  });

  console.log(file.cdnUrl);
  return file.cdnUrl;
}

app.listen(PORT, () => {
  console.log(`Running on http://127.0.0.1:${PORT}`);
});
