const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const forgotPasswordCon = require("../controllers/forgetPassword");
const {protectRoute} = require("../middleware");


router
    .route("/")
    .get(wrapAsync(forgotPasswordCon.getForgotPassPage))
    .post(wrapAsync(forgotPasswordCon.postForgotPassPage)
);

router
    .route("/reset")
    .get(protectRoute, wrapAsync(forgotPasswordCon.getNewPassword))
    .post(protectRoute, wrapAsync(forgotPasswordCon.postNewPassword)
);






module.exports = router;



