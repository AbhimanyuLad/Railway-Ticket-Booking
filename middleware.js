if(process.env.NODE_ENV != "production") {
  require('dotenv').config();
}
const TrainDetails = require('./models/trainDetails.js');
const User = require("./models/user.js");
const {accountValidation, trainEdit, bookingSchema} = require("./models/validate/schemaValidation.js");
const ExpressError = require("./utils/ExpressError.js");
const jwt = require("jsonwebtoken");





module.exports.validateAccount = (req, res, next) => {
    let {error} = accountValidation.validate(req.body);
   
    console.log(error); 
    if(error) {
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
};

module.exports.trainEdit = (req, res, next) => {
  let {error2} = trainEdit.validate(req.body);
  if(error2) {
    let errMsg = error2.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}

module.exports.bookingSchema = (req, res, next) => {
  let {error2} = bookingSchema.validate(req.body);
  if(error2) {
    let errMsg = error2.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}


module.exports.isLoggedIn = (req, res, next) => {
  const token = req.cookies.token;
  try {
    const user = jwt.verify(token, process.env.SECRET);
    req.user = user;
    req.token = token;
    //req.userRoles = user.roles;
    res.locals.userRoles = user.roles;
    res.locals.currUser = "true";
    next();
  } catch (err) {
    res.redirect("/account/login");
  }
};

module.exports.protectRoute = (req, res, next) => {
  const token = req.cookies.formSubmitted;
  console.log("------------------")
  console.log(token);
  req.formToken = token;
  console.log("------------------")
  if(token === 'true'){
    next();
  } else  {
     next(new ExpressError(401, "No permission to visit that page"));
  }
}



module.exports.reLogin = async(req, res, next) => {
  const token = req.cookies.token;
  req.token = token;
  const user = jwt.verify(token, process.env.SECRET);

  if(!user){
    throw new ExpressError(401, "Already you are loggedin. Please Logout for another User");
  }
  next();
}

module.exports.isAdmin = async(req, res, next) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.SECRET); // replace 'your_secret_key' with your actual secret key
  const roles = decoded.roles;
  if(roles === "admin"){
    console.log(roles)
     req.userRoles = roles;
    res.locals.userRoles = roles;
    next();
  } else {
    throw new ExpressError(401, "Not allowed for public");
  }
};










