const express = require("express");
const router = express.Router();
const Article = require("../models/article");
const UserAuth = require("../models/userAuth");

router.get("/login", async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    res.status(400).send(err);
  }
});


router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username.substring(0, 5) === "admin") {
        const result = await UserAuth.findOne({ username: username });
        if (result) {
          if (result.password === password) {
            req.session.admin = result;
            res.redirect("/admin-portal");
          } else {
            res.send({ data: "Invalid Password" });
          }
        } else {
          res.status(404).send({ data: "User Not Found.." });
        }
    } else {
      const result = await UserAuth.findOne({ username: username });
      if (result) {
        if (result.password === password) {
          req.session.user = result;
          res.redirect("/home");
        } else {
          res.send({ data: "Invalid Password" });
        }
      } else {
        res.status(404).send({ data: "User Not Found.." });
      }
    }
  } 
  catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

router.get("/signup", (req, res) => {
  try {
    res.render("signup");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const user = new UserAuth({ name, username, password });
    const result = await user.save();
    res.redirect("/auth/login");
  } catch (err) {
    res.status(400).redirect("/signup");
  }
});

module.exports = router;
