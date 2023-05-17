const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "demodb",
  password: "Vinay@sql1",
});

module.exports = db;