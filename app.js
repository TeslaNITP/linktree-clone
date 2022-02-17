require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

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

mongoose.connect("mongodb://localhost:27017/linktreeUserDB", () => {
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
  res.render("home");
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
      console.log(err);
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
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
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
        console.log(req.user.id);
        res.render("create");
      }
    }
  });
});

app.post("/create", (req, res) => {
  const imgUrl = req.body.imgUrl;
  const title = req.body.title;
  const description = req.body.description;
  console.log(req.user.id);

  User.findById(req.user.id, (err, foundUser) => {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.title = title;
        foundUser.description = description;
        foundUser.imgUrl = imgUrl;
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
        res.render("view", {
          title: foundUser.title,
          description: foundUser.description,
          imgUrl: foundUser.imgUrl,
        });
      }
    }
  });
});

app.get("/:organization", (req, res) => {
  console.log(req.params.organization);
  User.findOne({ title: req.params.organization }, function (err, foundOrg) {
    if (!err) {
      if (!foundOrg) {
        res.render("error");
      } else {
        res.render("view", {
          title: foundOrg.title,
          description: foundOrg.description,
          imgUrl: foundOrg.imgUrl,
        });
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
