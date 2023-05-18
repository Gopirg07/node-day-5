var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
const { randomStringModel } = require("../schemas/forgetPasswordSchema");
const { UserModel } = require("../schemas/usersSchema");
const jwt = require("jsonwebtoken");
const { SendResetEmail } = require("./mailSender");
const secretKey = "dhbdkjbdlajvnblajnbd";

mongoose.connect(dbUrl);

//POST Create User
router.post("/createUser", async (req, res, next) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      let user = await UserModel.create(req.body);
      res.status(200).send({ message: "User Created Successfully", user });
    } else {
      res.status(401).send({ message: "User Already Exists" });
    }
  } catch (error) {
    res.status(500).send({ message: "Server Side Problem", error });
  }
});

//GET All Users
router.get("/getAllUsers", async (req, res, next) => {
  try {
    let users = await UserModel.find();
    res
      .status(200)
      .send({ message: "Successfully Fetched All Strings", users });
  } catch (error) {
    res.status(500).send({ message: "Server Side Error", error });
  }
});

//----------------------------------------------------------------------------------------------------------------------------------------------

//GET All RandomStrings
router.get("/getAllRandomStrings", async (req, res, next) => {
  try {
    let strings = await randomStringModel.find();
    res
      .status(200)
      .send({ message: "Successfully Fetched All Strings", strings });
  } catch (error) {
    res.status(500).send({ message: "Server Side Error", error });
  }
});

//POST NewRandomString
router.post("/newRandomString", async (req, res, next) => {
  try {
    //To Check Is There Valid User.
    let user = await UserModel.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      //create Token
      let payload = { name: user.name, email: user.email };
      let randomString = await jwt.sign(payload, secretKey, {
        expiresIn: "2m",
      });
      console.log(randomString);

      //Sending Mail
      const email = user.email;
      const name = user.name;
      const url = `https://peppy-llama-421e78.netlify.app/reset-password/${randomString}`;
      const text = "Reset Your Password";
      SendResetEmail(email, url, text, name);

      let randomS = await randomStringModel.create({
        randomString: randomString,
      });
      res.status(200).send({
        message: "Recovery Mail Sent And Random String Stored Successfully",
        randomS,
      });
    } else {
      res.status(401).send({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).send({ message: "Server Side Problem", error });
  }
});

//Reset Password check
router.get("/resetPasswordCheck", async (req, res) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      console.log(token);
      let string = await randomStringModel.findOne({ randomString: token });
      console.log(string);
      if (string) {
        res.status(200).send({ message: "Valid User" });
      } else {
        res.status(401).send({ message: "Invalid user" });
      }
    } else {
      res.status(401).send({ message: "Invalid Credentials" });
    }
  } catch (error) {
    res.status(500).send({ message: "Server Side Problem", error });
  }
});

//resetPassword
router.post("/resetPassword", async (req, res) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      console.log(token); 
      let string=await randomStringModel.findOne({randomString:token})
      if (string) {
        let data = await jwt.decode(token); 
       
        let user = await UserModel.findOneAndUpdate({email: data.email},{password:req.body.password});

        let strng=await randomStringModel.findOneAndDelete({randomString:string.randomString})
        console.log(strng)
        res.status(200).send({ message: "Password Changed Successfully" }); 
      }
      else {
        res.status(401).send({ message: "token is invalid" });
      }
    } else {
      res.status(401).send({ message: "token is missing" });
    }
  } catch (error) {
    res.status(500).send({ message: "Server Side Problem", error });
  }
});

module.exports = router;
