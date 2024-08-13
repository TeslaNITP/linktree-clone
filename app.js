require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

// initialized express app
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// sdssf
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const password = process.env.DB_PASSWORD;
const mongoUsername = process.env.DB_USER;
mongoose.connect('mongodb+srv://'+ mongoUsername +':'+ password +'@cluster0.dssa4.mongodb.net/mflix?retryWrites=true&w=majority', () => {
  console.log("Databse connected!!");
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  imgUrl: String,
  title: String,
  description: String,
  link1Name: String,
  link1Url: String,
  link2Name: String,
  link2Url: String,
  link3Name: String,
  link3Url: String,
  link4Name: String,
  link4Url: String,
  link5Name: String,
  link5Url: String,
  link6Name: String,
  link6Url: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      // console.log(err);
      res.render("login",{errmsg:err});
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/create");
      });
    }
  });
});

app.get("/register", (req, res) => {
  res.render("signup");
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username , title: req.body.title},
    req.body.password,
    (err, user) => {
      if (err) {
        // console.log(err);
        res.render("signup",{errmsg:err});
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/create");
        });
      }
    }
  );
});

app.get("/create", (req, res) => {
  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      res.render("login");
    } else {
      if (foundUser) {
        // console.log(req.user.id);
        res.render("create", {foundUser:foundUser});
      }
    }
  });
});

app.post("/create", (req, res) => {
  const imgUrl = req.body.imgUrl;
  const title = req.body.title;
  const description = req.body.description;
  const title1 = req.body.link1Name;
  const url1 = req.body.link1;
  const title2 = req.body.link2Name;
  const url2 = req.body.link2;
  const title3 = req.body.link3Name;
  const url3 = req.body.link3;
  const title4 = req.body.link4Name;
  const url4 = req.body.link4;
  const title5 = req.body.link5Name;
  const url5 = req.body.link5;
  const title6 = req.body.link6Name;
  const url6 = req.body.link6;

  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.title = title;
        foundUser.description = description;
        foundUser.imgUrl = imgUrl;
        foundUser.imgUrl = imgUrl;
        foundUser.link1Name = title1;
        foundUser.link1Url= url1;
        foundUser.link2Name = title2;
        foundUser.link2Url= url2;
        foundUser.link3Name = title3;
        foundUser.link3Url= url3;
        foundUser.link4Name = title4;
        foundUser.link4Url= url4;
        foundUser.link5Name = title5;
        foundUser.link5Url= url5;
        foundUser.link6Name = title6;
        foundUser.link6Url= url6;
        foundUser.save(() => {
          res.redirect("/view");
        });
      }
    }
  });
});

app.get("/view", (req, res) => {
  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        res.render("view", {foundUser:foundUser});
      }
    }
  });
});

app.get("/:organization", (req, res) => {
  // console.log(req.params.organization);
  User.findOne({ title: req.params.organization }, function (err, foundUser) {
    if (!err) {
      if (!foundUser) {
        res.render("error");
      } else {
        res.render("viewgen", {foundUser:foundUser});
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000.");
});
