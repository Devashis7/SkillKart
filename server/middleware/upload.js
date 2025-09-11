const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillkart', // folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'docx'],
  },
});

const upload = multer({ storage });

module.exports = upload;
