console.log("Hello World from index.js!");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./googleAuth.json");
const SHEET_ID = "1GmiG4xcd8hEPdBsPtqIgwW6e8b25C83FKpUN_9lG6eE";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({ origin: true }));
app.use(express.json());

const port = 3000;
