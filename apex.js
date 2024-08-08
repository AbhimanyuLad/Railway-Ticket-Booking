if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");
const createLoginAccountRouter =  require("./routes/create.js");
const adminLogin = require("./routes/admin.js");
const forgotPassword = require("./routes/forgetPassword.js");
const methodOverride = require("method-override");




//------------------------------------------------------------------
const atlasUrl = process.env.ATLASDB_URL;
main()
.then(() => {console.log("connected to DB");})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(atlasUrl);
}
//------------------------------------------------------------------



app.use((req, res, next) => {

  if(res.locals.currUser !== "true"){
    res.locals.currUser = "false";
  }
  next();
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser()); 
app.use(methodOverride('_method'));



//--------------------------------------------------------------------------------------------


//  Route
app.use("/account", createLoginAccountRouter);
app.use("/admin", adminLogin);
app.use("/forgetPassword", forgotPassword);






//-------------------------------------------------------------------------


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode = 500, message= "Something went wrong!"} = err;
    res.status(statusCode).render("login/error.ejs", {message});
});

app.listen(9000, () => {
    console.log("listining to port");
});