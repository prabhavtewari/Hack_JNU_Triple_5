const jwt = require('jsonwebtoken');
const User = require('../models/patient');
const Doctor = require('../models/doctor');
const env = require("../environment.js");
const requireAuth = (req, res, next) => {
  const token = req.cookies.user;

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, env.SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect('/userlogin');
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect('/userlogin');
  }
};

const requireDoc = (req, res, next) => {
    const token = req.cookies.doc;
  
    // check json web token exists & is verified
    if (token) {
      jwt.verify(token, env.SECRET, (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.redirect('/doctorlogin');
        } else {
          console.log(decodedToken);
          next();
        }
      });
    } else {
      res.redirect('/doctorlogin');
    }
  };

// check current user
const checkUser = (req, res, next) => {
  const token = req.cookies.user;
  if (token) {
    jwt.verify(token, env.SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.userl = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        res.locals.userl = user;
        next();
      }
    });
  } else {
    res.locals.userl = null;
    next();
  }
};

const checkDoc = (req, res, next) => {
    const token = req.cookies.doc;
    if (token) {
      jwt.verify(token, env.SECRET, async (err, decodedToken) => {
        if (err) {
          res.locals.docl = null;
          next();
        } else {
          let doc = await Doctor.findById(decodedToken.id);
          res.locals.docl = doc;
          next();
        }
      });
    } else {
      res.locals.docl = null;
      next();
    }
  };


module.exports = { requireAuth, checkUser ,requireDoc,checkDoc};