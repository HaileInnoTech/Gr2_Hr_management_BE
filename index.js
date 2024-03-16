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

app.get("/counattendancebyemail", async (req, res) => {
  console.log(req.query.email);
  console.log(req.query.monthfilter);
  doc = await authenticateWithGoogle();
  const data = [];
  const hashMap = {};
  sheet = doc.sheetsByIndex[3];
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const email = rows[i].get("email");
    if (email === req.query.email) {
      if (!req.query.monthfilter || req.query.monthfilter === "") {
        const date = rows[i].get("date");
        const checkin = rows[i].get("checkin");
        const checkout = rows[i].get("checkout");
        data.push({
          email: email,
          date: date,
          checkin: checkin,
          checkout: checkout,
          hourwork: hourwork,
        });
        if (hashMap[email]) {
          hashMap[email]++;
        } else {
          hashMap[email] = 1;
        }
      } else {
        const date = rows[i].get("date");
        const curdate = new Date(date);
        if (curdate.getMonth() + 1 === parseInt(req.query.monthfilter)) {
          const checkin = rows[i].get("checkin");
          const checkout = rows[i].get("checkout");
          data.push({
            email: email,
            date: date,
            checkin: checkin,
            checkout: checkout,
          });
          console.log(data);
          if (hashMap[email]) {
            hashMap[email]++;
          } else {
            hashMap[email] = 1;
          }
        }
      }
    }
  }
  if (!data.length) {
    data.push({ message: "No data found" });
  } else {
    data.push({ total: hashMap[req.query.email] });
  }

  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});

app.get("/employeedatabyemail", async (req, res) => {
  doc = await authenticateWithGoogle();
  const data = [];
  const emaillookup = req.query.email;
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
    if (emaillookup === email && emaillookup !== "") {
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
  }
  if (!data.length) {
    data.push({ message: "No data found" });
  }

  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});

app.get("/employeesalarybyemail", async (req, res) => {
  doc = await authenticateWithGoogle();
  const data = [];
  const emaillookup = req.query.email;
  sheet = doc.sheetsByIndex[4];
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const email = rows[i].get("email");
    if (emaillookup === email) {
      const id = rows[i].get("id");
      const base_salary = rows[i].get("base_salary");
      const total_work_hour = rows[i].get("total_work_hour");
      let bonus = rows[i].get("bonus");
      if (bonus === "") {
        bonus = 0;
      }
      const actual_payment = rows[i].get("actual_pay");
      data.push({
        id: id,
        email: email,
        base_salary: base_salary,
        total_work_hour: total_work_hour,
        bonus: bonus,
        actual_payment: actual_payment,
      });
    }
  }
  if (!data.length) {
    data.push({ message: "No data found" });
  }
  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});

app.post("/updateemployeebonus", async (req, res) => {
  doc = await authenticateWithGoogle();
  const data = [];
  const emaillookup = req.query.email;
  const bonus_update = req.query.bonus;
  sheet = doc.sheetsByIndex[4];
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const email = rows[i].get("email");
    if (emaillookup === email && emaillookup !== "" && bonus_update !== "") {
      await sheet.loadCells("A1:F310");
      const cell = await sheet.getCellByA1(`E${i + 2}`);
      console.log(`E${i + 2}`);
      console.log(cell.value);
      cell.value = Number(bonus_update);
      await sheet.saveUpdatedCells(); // save all updates in one call
    }
  }
  try {
    res.status(200).json("Update bonus successfully");
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});
