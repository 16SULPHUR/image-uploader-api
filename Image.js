const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  image: {
    url: {
      type: String,
      required: true,
    },
    metaData: {
      type: Object,
    },
  },
});

module.exports = mongoose.model("Image", ImageSchema);