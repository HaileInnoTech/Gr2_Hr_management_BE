console.log("Hello World from index.js!");
require("dotenv").config();
const jwt = require("jsonwebtoken");
var bodyParser = require("body-parser");

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

const port = 4000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const authenticateWithGoogle = async () => {
  // Authenticate with Google
  const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
  });

  // Load Google Sheets
  const doc = new GoogleSpreadsheet(SHEET_ID, jwt);

  // Load document properties and worksheets
  await doc.loadInfo();

  return doc;
};

app.get("/employeedata", async (req, res) => {
  doc = await authenticateWithGoogle();
  const data = [];
  sheet = doc.sheetsByIndex[2];
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const id = rows[i].get("id");
    const firstName = rows[i].get("first_name");
    const lastName = rows[i].get("last_name");
    const email = rows[i].get("email");
    const gender = rows[i].get("gender");
    const phone = rows[i].get("phone");
    const address = rows[i].get("address");
    const derpartment = rows[i].get("department");
    const position = rows[i].get("position");
    data.push({
      id: id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: gender,
      phone: phone,
      address: address,
      derpartment: derpartment,
      position: position,
    });
  }
  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});

app.get("/countattendance", async (req, res) => {
  doc = await authenticateWithGoogle();
  const hashMap = {};
  sheet = doc.sheetsByIndex[3];
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const id = rows[i].get("id");
    if (hashMap[id]) {
      hashMap[id]++;
    } else {
      hashMap[id] = 1;
    }
  }
  const keysArray = Object.keys(hashMap);
  const valuesArray = Object.values(hashMap);
  const data = keysArray.map((key, index) => ({
    key: key,
    value: valuesArray[index],
  }));

  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});

// app.get("/counattendancebyemail", async (req, res) => {
//   console.log(req.query.email);
//   console.log(req.query.monthfilter);
//   doc = await authenticateWithGoogle();
//   const data = [];
//   const hashMap = {};
//   sheet = doc.sheetsByIndex[3];
//   const rows = await sheet.getRows();
//   for (let i = 0; i < rows.length; i++) {
//     const email = rows[i].get("email");
//     if (email === req.query.email) {
//       if (!req.query.monthfilter || req.query.monthfilter === "") {
//         const date = rows[i].get("date");
//         const checkin = rows[i].get("checkin");
//         const checkout = rows[i].get("checkout");
//         data.push({
//           email: email,
//           date: date,
//           checkin: checkin,
//           checkout: checkout,
//         });
//         if (hashMap[email]) {
//           hashMap[email]++;
//         } else {
//           hashMap[email] = 1;
//         }
//       } else {
//         const date = rows[i].get("date");
//         const curdate = new Date(date);
//         if (curdate.getMonth() + 1 === parseInt(req.query.monthfilter)) {
//           const checkin = rows[i].get("checkin");
//           const checkout = rows[i].get("checkout");
//           data.push({
//             email: email,
//             date: date,
//             checkin: checkin,
//             checkout: checkout,
//           });
//           console.log(data);
//           if (hashMap[email]) {
//             hashMap[email]++;
//           } else {
//             hashMap[email] = 1;
//           }
//         }
//       }
//     }
//   }

//   data.push({ total: hashMap[req.query.email] });

//   try {
//     res.status(200).json(data);
//   } catch (err) {
//     res.status(400).send("Cannot get data");
//   }
// });
