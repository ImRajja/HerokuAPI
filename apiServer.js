require("dotenv").config({ path: "./config.env" });

const PORT = process.env.API_PORT;

var express = require("express");
var cors = require("cors");

var app = express();

app.set("json spaces", 4);

// app.use(express.json());
// app.use(express.urlencoded({ extended: false })); // support form-encoded bodies (for bearer tokens)

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false })); // support form-encoded bodies (for bearer tokens)
app.use(bodyParser.json());

app.use(cors());

// Global error handling
app.use(function (err, _req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!").end();
});

var resource = {
  name: "Protected Resource",
  description: "This data has been protected by OAuth 2.0",
};

// get MongoDB driver connection
const dbo = require("./db");

// app.options("/resource", cors());
// // app.options("/api/:userid/:collection", cors());

// --------------------GET-----------------------------

app.get("/api/:userid/:collection", cors(), async function (req, res) {
  const dbConnect = dbo.getDb();

  console.log(
    `-------${req.params.collection} Collection -------${req.params.userid} userId--------`
  );
  dbConnect
    .collection(req.params.collection)
    .find({ email: req.params.userid })
    .limit(50)
    .toArray(function (err, result) {
      if (err) {
        res.status(400).send("Error fetching listings!");
      } else {
        res.json(result);
      }
    });
});

// ----------------POST---------------------------------

app.post("/api/:userid/:collection", async function (req, res) {
  if (!req.params.id) {
    const dbConnect = dbo.getDb();
    console.log("------>Insert new record<-------");
    console.log("req.body");
    console.log(req.body);
    console.log("------><-------");

    req.body.email = req.params.userid;

    dbConnect
      .collection(req.params.collection)
      .insertOne(req.body, function (err, result) {
        if (err) {
          res.status(400).send("Error inserting matches!");
        } else {
          console.log(`Added a new item with id ${result.insertedId}`);
          res.status(204).send();
        }
      });
  }
});

// ------------------UPDATE-------------------------------

app.put("/api/:userid/:collection/:id", async function (req, res) {
  console.log("********Update request********");

  const dbConnect = dbo.getDb();
  var ObjectId = require("mongodb").ObjectId;

  console.log(req.body);
  dbConnect
    .collection(req.params.collection)
    .updateOne(
      { _id: ObjectId(req.params.id) },
      { $set: req.body },
      function (err, _result) {
        if (err) {
          res
            .status(400)
            .send(`Error updating likes on listing with id ${req.params.id}!`);
        } else {
          console.log("1 document updated");
          res.status(204).send("1 document updated");
        }
      }
    );
});

// -----------------DELETE--------------------------------

app.delete("/api/:userid/:collection/:id", async function (req, res) {
  console.log("_-_-_-_-_-Delete request_-_-_-_-_-");

  const dbConnect = dbo.getDb();
  var ObjectId = require("mongodb").ObjectId;

  dbConnect.collection(req.params.collection).deleteOne(
    // { _id: ObjectId(req.params.id), userId: intUserId },
    { _id: ObjectId(req.params.id) },
    function (err, _result) {
      if (err) {
        res
          .status(400)
          .send(`Error deleting listing with id ${listingQuery.listing_id}!`);
      } else {
        console.log("1 document deleted");
      }
    }
  );
});

// -------------------------------------------------7

// perform a database connection when the server starts
dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  // start the Express server
  app.listen(PORT, () => {
    console.log(`!!##!!  API Server Server is running on port: ${PORT} !!##!!`);
  });
});
