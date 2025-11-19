// backend/services/csvParser.js
const csv = require("csv-parser");
const fs = require("fs");

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", data => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", err => reject(err));
  });
}

module.exports = { parseCSV };
