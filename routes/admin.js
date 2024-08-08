const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const adminLogin = require("../controllers/admin");
const {isLoggedIn, reLogin, isAdmin, trainEdit} = require("../middleware");




router
    .route("/")
    .get(wrapAsync(adminLogin.getloginPage))
    .post(wrapAsync(adminLogin.postloginPage)
);

router
    .route("/controller")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getController)
);


router
    .route("/create")
    .get(wrapAsync(adminLogin.getCreateAdmin))
    .post(wrapAsync(adminLogin.postCreateAdmin)
);

router
    .route("/controller/list")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getCreateList)
);


router.delete("/controller/list/:id", isAdmin, adminLogin.deleteTrain);


router
    .route("/controller/editlisting")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getCreateTrainListing))
    .post(isLoggedIn, isAdmin, trainEdit, wrapAsync(adminLogin.postCreateTrainListing)
);

router
    .route("/controller/stationEdit")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getStationEdit))
    .post(isLoggedIn, isAdmin, wrapAsync(adminLogin.postStationEdit)
);

router
    .route("/controller/checkOut")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getCheckOutPage)
);

router
    .route("/controller/deleteAcc")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getUserAccDetails))
    .delete(isLoggedIn, isAdmin, wrapAsync(adminLogin.deleteUserAcc)
);

router
    .route("/controller/deleteTrainSchedule")
    .get(isLoggedIn, isAdmin, wrapAsync(adminLogin.getTrainScheduleDelete))
    .post(isLoggedIn, isAdmin, wrapAsync(adminLogin.postDeleteTrainSchedule)
);







module.exports = router;






















module.exports = router;