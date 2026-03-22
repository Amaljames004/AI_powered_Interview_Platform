const fs = require("fs");
const csvParser = require("csv-parser");
const crypto = require("crypto");
const Invite = require("../models/invite");
const sendEmail = require("../utils/sendEmail"); // your custom sendEmail

// Generate random token
const generateToken = () => crypto.randomBytes(8).toString("hex");

// In-memory progress store
// Structure: { jobGroupId: { total, processed, sent, failed, done } }
const uploadProgress = {};

// Upload CSV and process emails
const processEmails = async (emails, jobGroupId, filePath = null) => {
  uploadProgress[jobGroupId].total = emails.length;
  console.log(`📊 Total emails to process: ${emails.length}`);

  for (const email of emails) {
    try {
      const token = generateToken();
      console.log(`🛠 Creating DB entry for: ${email}, token: ${token}`);

      const invite = await Invite.create({
        token,
        jobGroupId,
        email,
        status: "Invited",
        used: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      console.log("💾 Saved to DB:", invite._id);

      await sendEmail(email, token);
      uploadProgress[jobGroupId].sent += 1;
    } catch (err) {
      console.error("❌ Failed for email:", email, err.message);
      uploadProgress[jobGroupId].failed += 1;
    } finally {
      uploadProgress[jobGroupId].processed += 1;
      console.log(
        `📊 Progress: ${uploadProgress[jobGroupId].processed}/${uploadProgress[jobGroupId].total}`
      );
    }
  }

  // Mark done & delete CSV file if exists
  uploadProgress[jobGroupId].done = true;
  if (filePath) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("❌ Error deleting file:", err);
      else console.log("🗑 CSV file deleted after processing");
    });
  }

  console.log(`✅ Completed processing for jobGroupId: ${jobGroupId}`);
};

const uploadAndProcess = async (req, res) => {
  try {
    const { jobGroupId, manualEmails } = req.body;
    const file = req.files ? req.files.find(f => f.fieldname === "file") : null;
    const filePath = file ? file.path : null;

    let emails = [];

    if (manualEmails) {
      // Manual emails provided
      try {
        emails = JSON.parse(manualEmails);
        console.log(`🚀 Processing manual emails for jobGroupId: ${jobGroupId}, count: ${emails.length}`);
      } catch (err) {
        console.error("❌ Invalid manualEmails JSON");
        return res.status(400).json({ error: "Invalid manual emails format" });
      }
    } else if (filePath) {
      // CSV file provided
      console.log(`🚀 Starting CSV processing for jobGroupId: ${jobGroupId}`);
    } else {
      console.error("❌ No file uploaded and no manual emails");
      return res.status(400).json({ error: "No file uploaded or manual emails provided" });
    }

    uploadProgress[jobGroupId] = {
      total: 0,
      processed: 0,
      sent: 0,
      failed: 0,
      done: false,
    };

    // Respond immediately to frontend
    res.json({ message: "Processing started", jobGroupId });

    if (filePath) {
      // Parse CSV
      fs.createReadStream(filePath)
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
          })
        )
        .on("data", (row) => {
          const email = row.email?.trim();
          if (email) {
            emails.push(email);
            console.log("✅ Found email in CSV:", email);
          } else {
            console.warn("⚠️ Skipping row with missing/invalid email:", row);
          }
        })
        .on("end", async () => {
          processEmails(emails, jobGroupId, filePath);
        });
    } else {
      // Process manual emails
      processEmails(emails, jobGroupId);
    }
  } catch (err) {
    console.error("🔥 Unexpected error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// Endpoint to get progress
const getUploadProgress = (req, res) => {
  const { jobGroupId } = req.params;
  const progress = uploadProgress[jobGroupId];

  if (!progress) {
    return res.status(404).json({ error: "No upload found" });
  }

  res.json(progress);
};

module.exports = { uploadAndProcess, getUploadProgress };
