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

const port = 4000;
let newuser = [];

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

app.get("/employeedata", verifyAdminToken, async (req, res) => {
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

app.get("/employeepayrolldata", async (req, res) => {
  doc = await authenticateWithGoogle();
  const data = [];
  sheet = doc.sheetsByIndex[4];
  const rows = await sheet.getRows();
  for (let i = 0; i < rows.length; i++) {
    const id = rows[i].get("id");
    const email = rows[i].get("email");
    const base_salary = rows[i].get("base_salary");
    const total_work_hour = rows[i].get("total_work_hour");
    let bonus = rows[i].get("bonus");
    const actual_pay = rows[i].get("actual_pay");
    data.push({
      id: id,
      email: email,
      base_salary: base_salary,
      total_work_hour: total_work_hour,
      bonus: bonus,
      actual_pay: actual_pay,
    });
  }
  try {
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send("Cannot get data");
  }
});

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(4);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (err) {
    console.log(err);
  }
};

const postNewUser = async (data, doc) => {
  let sheet = doc.sheetsByIndex[2];

  const newUser = await sheet.addRow({
    id: data.id,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    gender: data.gender,
    phone: data.phone,
    address: data.address,
    department: data.department,
    position: data.position,
  });
  sheet = doc.sheetsByIndex[1];
  const newAccount = await sheet.addRow({
    id: data.id,
    email: data.email,
    password: data.password,
    role: data.role,
  });
};

app.post("/user/login", async (req, res) => {
  try {
    const doc = await authenticateWithGoogle();
    const data = {
      email: req.body.email,
      password: req.body.password,
    };
    const isUser = await verifyUser(data.email, data.password, doc);
    if (isUser) {
      //generate token
      const accessToken = await jwt.sign(
        isUser,
        process.env.ACCESS_TOKEN_SECRET,
        {
          // expiresIn: "30m",
        }
      );

      res.status(200).json({
        accessToken: accessToken,
        email: isUser.email,
        role: isUser.role,
        message: "User verified",
      });
    } else {
      res.status(400).json("User not verified");
    }
  } catch (err) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

const verifyUser = async (email, password, doc) => {
  const sheet = doc.sheetsByIndex[1];
  const rows = await sheet.getRows();

  for (let i = 0; i < rows.length; i++) {
    const curemail = rows[i].get("email");
    const curpassword = rows[i].get("password");
    const curRole = rows[i].get("role");
    try {
      const passwordMatch = await bcrypt.compare(password, curpassword);

      if (curemail === email && passwordMatch) {
        const data = { role: curRole, email: curemail };
        return data;
      }
    } catch (err) {
      console.log(err);
      return false; // Handle the error according to your needs
    }
  }

  return false; // If no matching user is found
};

app.post("/user/signup", verifyAdminToken, async (req, res) => {
  newuser = [];
  const doc = await authenticateWithGoogle();
  const data = {
    id: req.body.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    gender: req.body.gender,
    phone: req.body.phone,
    address: req.body.address,
    department: req.body.department,
    position: req.body.position,
    password: req.body.password,
    role: req.body.role,
  };

  const hashedPassword = await hashPassword(data.password);
  data.password = hashedPassword;
  newuser.push(data);
  console.log(newuser);
  try {
    postNewUser(data, doc);
    res.status(201).json("New user added");
  } catch (err) {
    console.log(err);
  }
});

//Verify token
function verifyAdminToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) return res.status(401).json("Unauthorized");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const userRole = user.role;
    if (userRole !== "admin") {
      return res.status(403).json("Forbidden. Only admin users allowed.");
    }
    req.user = user;
    next();
  });
}
function verifyUserToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (token == null) return res.status(401).json("Unauthorized");

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
