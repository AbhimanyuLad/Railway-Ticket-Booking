const express = require("express");
const router = express.Router();
const loginAccount = require("../controllers/create");
const wrapAsync = require("../utils/wrapAsync");
const {validateAccount, isLoggedIn, protectRoute, bookingSchema} = require("../middleware");



router
    .route("/create")
    .get(wrapAsync(loginAccount.createAccount))
    .post( validateAccount, wrapAsync(loginAccount.saveCredentials)
);

router
    .route("/login")
    .get( wrapAsync(loginAccount.renderLoginPage))
    .post( wrapAsync(loginAccount.evaluationOfCredentials)
);

router
    .route("/login/list")
    .get(isLoggedIn, wrapAsync(loginAccount.getTrainListing))



router
    .route("/logout")
    .post(isLoggedIn, wrapAsync(loginAccount.logout)
);

router
    .route("/list/reservation")
    .post(isLoggedIn, wrapAsync(loginAccount.postBookingOfTrain)
);

router
    .route("/list/reservation/confirmbooking")
    .post(isLoggedIn, wrapAsync(loginAccount.postConfirmationOfTicket)
);

router
    .route("/login/list/bookingPage")
    .get(isLoggedIn, protectRoute, wrapAsync(loginAccount.getBookingStatus))
    .post(isLoggedIn, protectRoute, bookingSchema, wrapAsync(loginAccount.postBookingStatus)
);

router
    .route("/login/showTicket")
    .get(isLoggedIn, wrapAsync(loginAccount.getTicket))
    .post(isLoggedIn, wrapAsync(loginAccount.postCancelationOfTicket)
);

router
    .route("/login/list/search")
    .post(isLoggedIn, wrapAsync(loginAccount.postSearchTrain)
);





module.exports = router;









