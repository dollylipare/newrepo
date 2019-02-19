const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const path = require('path');
let db = new sqlite3.Database('./boot.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the boot database.');
});

const createTable = (req, res) => {
  if (req.method == "POST") {
    db.serialize(function () {
      var query = req.query.query;
      db.run(query, (err) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: err.message
          });
        } else {
          res.status(200).json({
            success: true,
            message: 'Table created successfully!'
          });
        }

      });
    });
  }
};

const operateTable = (req, res) => {
  if (req.method == "POST") {
    db.serialize(function () {
      var query = req.query.query || req.body.query;
      console.log(Object.keys(req.files).length);
      if (Object.keys(req.files).length !== 0) {
        req.body.img = req.files.thumb.data.toString('base64');
      }
      delete req.body['query'];
      db.run(query, Object.values(req.body), (err) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: err.message
          });
        } else {
          res.status(200).json({
            success: true,
            message: 'Operation successful'
          });
        }

      });
    });
  }
};


const query = (req, res) => {
  try {
    const query = req.query.query;
    let stmt = db.prepare(query);
    const arr = [];
    console.log(Object.values(req.body));
    db.each(query, [], function (err, data) {
      console.log(err);
      if (err) {
        res.status(500).json({
          success: false,
          message: err.message
        });
      } else {
        arr.push(data);
      }
    }, (err) => {
      console.log(err);
      res.status(200).json({
        success: true,
        data: arr
      });
    });

  } catch (err) {
    console.log('111' + err);
    res.status(500).json({
      success: false,
      data: err
    });
  }

};
var app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use("/createTable", createTable);
app.use("/fetch", query);
app.use("/operate", operateTable);
app.listen(4000, () =>
  console.log("Express Sqlite Server Now Running On localhost:4000")
);