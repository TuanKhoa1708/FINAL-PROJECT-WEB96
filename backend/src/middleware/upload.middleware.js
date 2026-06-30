const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directories exist
const uploadDir = path.join(__dirname, "../../uploads");
const materialsDir = path.join(uploadDir, "materials");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(materialsDir)) {
  fs.mkdirSync(materialsDir);
}

// Storage for Materials (Disk Storage)
const materialStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, materialsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Storage for Students (Memory Storage) - We just parse it and don't need to save the file permanently
const excelStorage = multer.memoryStorage();

const uploadMaterial = multer({ storage: materialStorage });
const uploadExcel = multer({ storage: excelStorage });

module.exports = {
  uploadMaterial,
  uploadExcel,
};
