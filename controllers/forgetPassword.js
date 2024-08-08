if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}


const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");
const nodeMailer = require("nodemailer");
const randomString = require("randomstring");
const bcrypt = require("bcryptjs");


const resetPasswordMail = async(name, email, token) => {
    try{
        const transporter = nodeMailer.createTransport({
            // host: "smtp.gmail.com",
            // port: 9000,
            // secure: false,
            // requireTLS: true,
            service: 'gmail',
            auth:{
                user: process.env.EMAILUSER,
                pass: process.env.EMAILPASSWORD
            }
        });

        const mailOption = {
            from: process.env.EMAILUSER,
            to: email,
            subject: "For Reset Password", // Corrected from 'sub' to 'subject'
            html: `<p>${name}, please click the link and <a href="http://localhost:9000/forgetPassword/reset?token=${token}">reset your password</a></p>`
        }


        transporter.sendMail(mailOption, function(error, info){
            if(error){
                console.log(error);
            } else {
                console.log("Mail has been sent:- ", info.response);
            }
        })

    } catch (err){
        throw new ExpressError(400, err);
    }
}



module.exports.getForgotPassPage = (req, res) => {
    res.render("forgotPass/forgot.ejs");
}

module.exports.postForgotPassPage = async(req, res) => {
    try{
        const {email} = req.body;
        console.log(email);

        const userData = await User.findOne({personalEmailId: email});

        if(userData){
            const randomStr = randomString.generate();
            console.log(randomStr);
            const data = await User.findOneAndUpdate({personalEmailId: email}, {$set:{token:randomStr}})
            const updatedUserData = await User.findOne({ personalEmailId: email });
            console.log(updatedUserData.token);
            resetPasswordMail(updatedUserData.firstname, updatedUserData.personalEmailId, updatedUserData.token);
            res.cookie('formSubmitted', 'true', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.status(200).send({ success: true, msg: "Please check your inbox" });
        } else {
            throw new ExpressError(200, "This Email does not exists");
        }


    } catch(err) {
        throw new ExpressError(400, err);
    }
}


module.exports.getNewPassword = (req, res) => {
    res.render("forgotPass/newPassPage.ejs")
}



module.exports.postNewPassword = async (req, res, next) => {
  try {
    const { password, token } = req.body;
    console.log(password, token);

    const user = await User.findOne({ token: token });
    if (!user) {
      throw new ExpressError(401, 'Invalid token.');
    }

    if (user.token !== token) {
      throw new ExpressError(401, 'Token mismatch.');
    }

    console.log(user);
    const salting = await bcrypt.genSalt(10);
    const bycPassword = await bcrypt.hash(password, salting);
    await User.findOneAndUpdate({ token: token }, { password: bycPassword });

    console.log('Password changed successfully.');

    // Invalidate the token
    user.token = undefined;
    await user.save();

    // Clear the formSubmitted cookie
    res.clearCookie('formSubmitted');

    // Redirect the user to the login page
    const redirectUrl = '/account/login';
    res.json({ redirectUrl });
  } catch (error) {
    next(error);
  }
};






