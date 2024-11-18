require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const pg = require("pg");
const { Pool } = pg;
const cors = require("cors");
const bcrypt = require("bcrypt");

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

const pgStore = new pgSession({
  pool: pool,
  tableName: "session",
});

//Middlewares
app.use(cors());

app.use(express.json());
app.use(
  session({
    store: pgStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
    },
  })
);

//Routes
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO "user" (username,email,password) VALUES ($1,$2,$3) RETURNING *`,
      [username, email, hashedPassword]
    );
    res.status(201).json({ message: "User Registered" });
  } catch (err) {
    err.code === "23505"
      ? res.status(401).json({ message: "Username already exists." })
      : res.status(500).json({ message: err });
  }
});

app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const {
      rows: [user],
    } = await pool.query(`SELECT * FROM "user" WHERE email = $1`, [email]);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    console.log("Session Data: ", req.session);
    res.status(200).json({ message: "Logged in successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log("Server started at port 3000.");
});
