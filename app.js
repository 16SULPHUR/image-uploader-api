const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const Image = require("./Image");

const PORT = 3001;

const app = express();
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const DB =
  "mongodb+srv://akpatil51340:%40Ankit2005@cluster0.rwylpqs.mongodb.net/PhotoHub?retryWrites=true&w=majority";

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(DB);
  console.log("connected to db");
}

app.get("/", (req, res) => {
  res.send(`Api For <a href="https://photohub.vercel.app">PhotoHub</a>`);
});

app.get("/images", async (req,res)=>{
  const body = req.query;

  console.log(body)

  if(body.userId){
    const allImages = await Image.find({userId: body.userId})
    console.log(allImages)
    res.json(allImages)
  }
  else{
    res.status(500).json({message: "userId not defined"})
  }
})

app.post("/upload", upload.array("files[]"), async (req, res) => {
  console.log("req.files::::::::::::");
  console.log(req.body);
  const cdnUrls = await uploadFiles(req.files);
  console.log("GOT URLs");

  if (req.body.userId) {
    try {
      const uploadPromises = await uploadToDB(req.body.userId, cdnUrls);

      await Promise.all(uploadPromises);

      // If all uploads to the DB are successful, send CDN URLs in the response
      res.json(cdnUrls);
    } catch (error) {
      console.error("Error uploading to DB:", error);
      res.status(500).json({ error: "Cannot upload images to the database" });
    }
  } else {
    // If userId is not defined, send a 400 Bad Request status
    res.status(400).json({ error: "User ID not defined" });
  }
});


async function uploadToDB(userId, cdnUrls) {
  // Use map to create an array of promises
  const promises = cdnUrls.map(async (url) => {
    const newImage = new Image({
      userId: userId,
      image: {
        url: url,
      },
    });

    // Use await to wait for the save operation to complete
    await newImage.save();
    return true;
  });

  // Use Promise.all to wait for all promises to resolve
  return Promise.all(promises);
}


async function uploadFiles(files) {
  console.log("UploadFiles::::::::::");

  try {
    // Use Promise.all to wait for all uploads to finish
    const uploadPromises = files.map(async (file) => {
      return uploadToCloudStorage(file.buffer, file.originalname);
    });

    const cdnUrls = await Promise.all(uploadPromises);

    return cdnUrls;
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
}

async function uploadToCloudStorage(fileBuffer, fileName) {
  try {
    const { uploadFile } = await import("@uploadcare/upload-client");
    const file = await uploadFile(fileBuffer, {
      publicKey: "80754a04d338b9eb4178",
      fileName: fileName,
      contentType: "image/jpeg", // Adjust the content type based on your file type
    });

    console.log(file.cdnUrl);
    return file.cdnUrl;
  } catch (error) {
    console.error("Error uploading to cloud storage:", error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Running on http://127.0.0.1:${PORT}`);
});
