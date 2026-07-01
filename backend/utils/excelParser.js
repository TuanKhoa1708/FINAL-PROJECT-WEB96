const xlsx = require("xlsx");

/**
 * Parse an Excel file buffer and return JSON data
 * @param {Buffer} buffer - File buffer from multer
 * @returns {Array} - Array of objects representing the rows
 */
const parseExcel = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  return data;
};

module.exports = {
  parseExcel
};
