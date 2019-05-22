
const mongoose = require("mongoose");
const express = require("express");
var cors = require('cors');
const bodyParser = require("body-parser");
const logger = require("morgan");
const Data = require("./data");

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();


// this is our MongoDB database
const dbRoute = "mongodb+srv://mc-418:I!mokay418@userlist-zuvin.gcp.mongodb.net/test?retryWrites=true";

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

// this is our get method
// this method fetches all available data in our database
// router.get("/getData", (req, res) => {
//   Data.find((err, data) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true, data: data });
//   });
// });

// this is our get method
// this method fetches user info by id in our database
router.post("/getUser", (req, res) => {
  const { id } = req.body;
  console.log(id);
  Data.findById(id, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  });
});

// this is our update method
// this method overwrites existing data in our database
router.post("/updateData", (req, res) => {
  const { id, firstName, lastName, age, sex } = req.body;
  Data.findById(id, function(err, data) {
    if (err) {
      return res.json({success: false, error: err});
    } else {
      data.firstName = firstName;
      data.lastName = lastName;
      data.sex = sex;
      data.age = age;
      data.save(err => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
      });
    }
  })
});

// this is our delete method
// this method removes existing data in our database
router.delete("/deleteData", (req, res) => {
  const { id } = req.body;
  console.log(req.body);
  Data.deleteMany({_id:id}, (err, data) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true, data: data });
  })
});

// this is our create method
// this method adds new data in our database
router.post("/putData", (req, res) => {
  let data = new Data();
  const { firstName, lastName, sex, age, password } = req.body;
  console.log(req.body);
  if (!firstName) {
    return res.json({
      success: false,
      error: "INVALID INPUTS"
    });
  }
  data.firstName = firstName;
  data.lastName = lastName;
  data.sex = sex;
  data.age = Number(age);
  data.password = password;
  data.save(err => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

// this is our get method
// this method fetches all available data in our database
router.get("/sort", (req, res) => {
  var query = require('url').parse(req.url, true).query;
  var field = query.field;
  var option = query.option;
  console.log(field);
    Data.find({}, null, {sort: {[field]: option}}, function (err, data) {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  // }
});


// search method
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/getData", function(req, res) {
  if (req.query.search) {
     const regex = new RegExp(escapeRegex(req.query.search), 'gi');
     Data.find({$or:[{ "firstName" : regex },
                      {"lastName" : regex},
                      {"sex": regex}, 
                      // {"age" : regex}
                    ]}, function(err, data) {
         if(err) {
             console.log(err);
         } else {
          return res.json({ success: true, data: data });
         }
     }); 
  } else {
    Data.find((err, data) => {
      if (err) return res.json({ success: false, error: err });
      return res.json({ success: true, data: data });
    });
  }
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));