if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const ExpressError = require("../utils/ExpressError");
const cron = require("node-cron");
const Admin = require("../models/admin");
const TrainDetails = require("../models/trainDetails");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Station = require("../models/stations");
const User = require("../models/user");
const ScheduledTrain = require("../models/schedule");
const UserTicket = require("../models/userTickets");




module.exports.getloginPage = (req, res) => {
    res.render("admin/login.ejs");
}


module.exports.postloginPage = async(req, res) => {
    const {id, username, password} = req.body;
    const user = await Admin.findOne({ username: username });
    console.log(user);

    if(id !== "abc123"){
        throw new ExpressError(404, "False ID");
    }

    if (!user) {
        throw new ExpressError(404, "user not found");
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
        throw new ExpressError(400, "incorrect password");
    }
    console.log(user.roles);
    const token = jwt.sign(
        {id: user._id, roles: user.roles},
        process.env.SECRET,
        {
            expiresIn: "2h"
        }
    );

    const update = await Admin.updateOne(
        {username: username},
        { $set: { token:  token}}
    );

    res.cookie("token", token, {
        httpOnly: true,
    });

   res.redirect("/admin/controller");
  
};

module.exports.getController = (req, res) => {
    res.render("admin/home.ejs");
}


module.exports.getCreateAdmin = (req, res) => {
    res.render("admin/create.ejs");
}

module.exports.postCreateAdmin = async(req, res) => {
    const {id, username,password} = req.body;
    if(id !== "abc123"){
        throw new ExpressError(401, "False ID");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);
    const cred = new Admin({
        username, password: hash
    });
    console.log(username);
    console.log(hash);

    const alreadyHaveUser = await Admin.findOne({username});
    if(alreadyHaveUser){
        throw new ExpressError(401, "User email or username is already taken");
    }


    const token = jwt.sign(
        {id: cred._id, username},
        process.env.SECRET,
        {
            expiresIn: "3h"
        }
    );

    cred.token = token;
    await cred.save();
    res.render("admin/login.ejs");
}


module.exports.getCreateTrainListing = async(req, res) => {
    const stations = await Station.find({});
    res.render("admin/newTrainListing.ejs", {stations});
}


module.exports.postCreateTrainListing = async(req, res) => {
    const trainDetails = req.body;
    console.log(trainDetails);
    console.log(trainDetails.trainName, trainDetails.trainNum, trainDetails.from, trainDetails.to,trainDetails.arrivalTime,trainDetails.departureTime,trainDetails.selectedOptions, trainDetails.trainSeats);
    console.log(trainDetails.timer)

    let timeArray = [];
    for(let i = 0; i < trainDetails.timer.length; i++){
        timeArray.push(trainDetails.timer[i].hours+":"+trainDetails.timer[i].minutes);
    }

    console.log(timeArray);
    let arr = parseFloat(trainDetails.at); let dep = parseFloat(trainDetails.dt);

    if(trainDetails.from === undefined || trainDetails.to === undefined){
        throw new ExpressError(401, "Please select correct options")
    } else if(trainDetails.from === trainDetails.to){
        throw new ExpressError(401, "Source and Destination Can't be Same");
    } else if(arr > dep || trainDetails.arrivalTime === undefined || trainDetails.departureTime === undefined ){
        throw new ExpressError(401, "Arrival time should should be greater than depatrure time");
    }

    const save = await TrainDetails.findOne({trainNum: trainDetails.trainNum});
    console.log("Hello")
    if(!save) {
        console.log("Hello")
        const haltingStationsData = trainDetails.selectedOptions.map((station, index) => ({
            station: station,
            time: timeArray[index],
        }));


        const trainCred = new TrainDetails({
            trainNum: trainDetails.trainNum,
            trainName: trainDetails.trainName,
            totalSeats: trainDetails.trainSeats,
            from: trainDetails.from,
            to: trainDetails.to,
            arrivalTime: trainDetails.arrivalTime,
            departureTime: trainDetails.departureTime,
            haltingStations: haltingStationsData,
        });

        await trainCred.save();
        console.log("success");
        res.json("success");
    } else {
        throw new ExpressError(401, "Train number already exists");
    }
}



module.exports.getStationEdit = (req, res) => {
    res.render("admin/stationEdit.ejs");
}


module.exports.postStationEdit = async(req, res) => {
    const data = req.body; // This should be an array of arrays
    console.log(data);

    console.log(checkNoArrays(data));
    let flag = checkNoArrays(data);
    
    if(flag === true){
        const inser = await Station.create({previousSt: data.previousSt, currentSt: data.station, nextSt: data.nextSt});
    } else{
            let newObj = data;
            if (newObj instanceof Object) {
                newObj = Array.from(data.station).map((_, index) => {
                    return {
                        previousSt: data.previousSt[index],
                        station: data.station[index],
                        nextSt: data.nextSt[index],
                    }
                })
            }

            console.log(newObj);
            const arrayOfArrays = newObj.map(obj => [obj.previousSt, obj.station, obj.nextSt]);

            for(i = 0; i < arrayOfArrays.length; i++) {
                let inser = await Station.create({previousSt: arrayOfArrays[i][0],currentSt: arrayOfArrays[i][1], nextSt: arrayOfArrays[i][2]})
            }
        }
        res.json("Stored Successfully");
        
        function checkNoArrays(obj) {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (Array.isArray(obj[key])) {
                        return false; // Found an array, return false
                    }
                }
            }
            return true; // No arrays found
        }
    }
    
    module.exports.getCreateList = async(req, res) => {
        const listings = await TrainDetails.find({});
        const stations = await Station.find({});
        let userRoles = req.userRoles;
        console.log(userRoles);
        const currentStations = stations.map(result => result.currentSt);
        let status = req.query.status = "false";
        console.log(status);
        res.render("main/list.ejs", {listings, currentStations, userRoles, status});
    }

    module.exports.deleteTrain =  async (req, res) => {
        try {
          await TrainDetails.findByIdAndDelete(req.params.id);
          res.redirect("/admin/controller/list");
        } catch (error) {
          res.redirect(500).json({ error: 'Failed to delete train' });
        }
    };


module.exports.getCheckOutPage = async(req, res) => {
    res.render("main/booking.ejs");
}



module.exports.getUserAccDetails = async(req, res) => {
    const userAccDetails = await User.find();
    res.render("admin/userAccDetails.ejs", {userAccDetails});
}

module.exports.deleteUserAcc = async(req, res) => {
    const {deleteAcc} = req.body;
    console.log(deleteAcc);
    const deleteAccount = await User.findOneAndDelete(deleteAcc);
    await OtherModel.deleteMany({ userId: deleteAccount._id });
    res.redirect("/admin/controller");
}


module.exports.getTrainScheduleDelete = async(req, res) => {
    const scheduledTrain = await ScheduledTrain.find({})
        .populate('trainDetails')  // Populate trainDetails
    .exec();

    console.log(scheduledTrain);
    res.render("admin/deletescheduleTrain.ejs", {scheduledTrain});
}

module.exports.postDeleteTrainSchedule = async(req, res) => {
   const {deleteAcc} = req.body;
   console.log(deleteAcc);

    const deleteTSchedule = await ScheduledTrain.findByIdAndDelete({_id: deleteAcc});

    res.redirect("/admin/controller/deleteTrainSchedule");
}



    const deleteOldData = async () => {
        try {
            const currentDate = new Date();
            const previousDate = new Date(currentDate);
            previousDate.setDate(currentDate.getDate() - 2);
            const result = await ScheduledTrain.deleteMany({ date: { $lt: previousDate } });
            const result2 = await UserTicket.deleteMany({ date: { $lt: previousDate } });
            const ticket = await Ticket.deleteMany({date: {$lt: previousDate}});
            console.log(`${result.deletedCount} documents were deleted.`);
            console.log(`${result2.deletedCount} documents were deleted.`);
        } catch (error) {
          console.error('Error deleting old data:', error);
        }
      };

    cron.schedule('0 0 * * *', () => {
        deleteOldData();
        console.log('Scheduled task executed at', new Date());
    });

    



