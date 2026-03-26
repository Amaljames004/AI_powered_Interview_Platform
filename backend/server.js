const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

connectDB();

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://your-app.vercel.app',  // replace with your actual Vercel URL
      /\.vercel\.app$/,               // allows all vercel preview URLs
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
  })
);


// Parse JSON bodies
app.use(express.json());

// =========================
// 🔹 Routes
// =========================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/company-profile", require("./routes/companyProfile"));
app.use("/api/jobgroups", require("./routes/jobGroup"));
app.use("/api/recruitment", require("./routes/recruitment"));

// Candidate routes
app.use("/api/candidate", require("./routes/candidate"));
app.use("/api/candidatePool", require("./routes/candidatePool"));
app.use("/api/recruiter", require("./routes/recruiterRoutes"));

// Interview routes — accept singular and plural
app.use(["/api/interview", "/api/interviews"], require("./routes/interview"));
app.use("/api/notifications", require("./routes/notification"));
// Application routes — accept singular and plural
app.use(
  ["/api/application", "/api/applications"],
  require("./routes/application")
);

// Invite routes
app.use("/api/invites", require("./routes/inviteRoutes"));
app.use("/api/interview", require("./routes/interview"));

// Integrity monitoring routes
app.use("/api/integrity", require("./routes/integrity"));

// Root
app.get("/", (req, res) => res.send("✅ SkillHire AI API Running..."));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


