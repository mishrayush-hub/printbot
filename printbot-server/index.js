const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const multer = require("multer");
const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");
const cors = require('cors');
require('dotenv').config(); // Make sure to create a .env file

const app = express();
const PORT = process.env.PORT || 5000;

// app.use(cors());
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "temp_uploads/" });

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,         // e.g., 'sql123.hostinger.com'
  user: process.env.DB_USER,         // your DB user
  password: process.env.DB_PASS, // your DB password
  database: process.env.DB_NAME      // your DB name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('MySQL connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { loginEmail, loginPassword } = req.body;
  console.log('Login request:', req.body);

  if (!loginEmail || !loginPassword) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = 'SELECT id, name, email, phone_number, password FROM users WHERE email = ?';

  db.query(query, [loginEmail], async (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length !== 1) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(loginPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Login successful
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        phone: user.phone_number,
      }
    });
  });
});

// SIGNUP ENDPOINT
app.post("/api/signup", async (req, res) => {
  const { signupName, signupMobile, signupEmail, signupPassword, confirmPassword } = req.body;

  if (!signupName || !signupMobile || !signupEmail || !signupPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (signupPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(signupPassword, 10);

    // Insert into DB
    const query = `INSERT INTO users (name, email, phone_number, password) VALUES (?, ?, ?, ?)`;
    db.query(query, [signupName, signupEmail, signupMobile, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }

      return res.status(201).json({ message: "User registered successfully" });
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

//upload file
app.post('/api/upload', upload.single("file"), async (req, res) => {
  const { user_id, page_count } = req.body;
  const file = req.file;
  const fileName = file.originalname;

  if( !file ) {
    return res.status(400).json({ error: "No file uplaoded" });
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  const remotePath = `/${user_id}/`;
  const remoteFileName = `${user_id}_${file.originalname}`;
  const localFilePath = file.path;

  try {
    await client.access({
      host : "193.203.185.23",
      user: "u605263236.printbotapp",
      password: "Rjk*miegD#J566u",
      secure: false,
    });

    await client.ensureDir(remotePath);
    await client.uploadFrom(localFilePath, remotePath + remoteFileName);

    fs.unlinkSync(localFilePath);

    const query = `INSERT INTO uploaded_files (user_id, file_name, file_path, page_count, payment_success) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [user_id, fileName, `uploads/${user_id}/${remoteFileName}`, page_count, 0 ], (err, result) => {
      if(err) {
        console.error("Error inserting file info:", err);
        return res.status(500).json({ error: "Database error" });
      }

      console.log("File info inserted successfully");

    });
    return res.status(200).json({
      status: "success",
      file_url: `https://navstream.in/public_html/printbot/uploads/${user_id}/${remoteFileName}`,
    });
  } catch (err) {
    console.error("FTP error:", err);
    return res.status(500).json({ error: "FTP upload failed" });
  } finally {
    client.close();
  }
});

// past data
app.get('/api/past-data', (req, res) => {
  const { user_id } = req.query;
  console.log('Fetching past data for user:', user_id);

  const query = `SELECT * FROM uploaded_files WHERE user_id = ?`;
  db.query(query, [user_id], (err, results) => {
    if(err) {
      console.error("Error fetching past data:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if(results.length === 0) {
      return res.status(404).json({ message: "No past data found" });
    }
    const formattedResults = results.map(result => ({
      id: result.id,
      file_name: result.file_name,
      file_path: result.file_path,
      page_count: result.page_count,
      printed: result.printed,
    }));
    console.log("Past data fetched successfully:", formattedResults);
    return res.status(200).json({
      message: "Past data fetched successfully",
      data: formattedResults,
  });
});
});

app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
