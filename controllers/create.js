if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const User = require("../models/user");
const ScheduledTrain = require("../models/schedule");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ExpressError = require("../utils/ExpressError");
const TrainDetails = require("../models/trainDetails");
const Station = require("../models/stations");
const UserTicket = require("../models/userTickets");




module.exports.createAccount = (req, res) => {
    res.render("login/index.ejs");
};


module.exports.saveCredentials = async (req, res)  => {
    const { account } = req.body;
    const { firstname, surname, username, mobileNum, personalEmailId, alternateEmail, state, country, addressone, addresstwo,  password, pin } = account;
    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new ExpressError(401, "User already exists with this email");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);
    const cred = new User({
        firstname,surname,username,mobileNum,personalEmailId,alternateEmail,state,country,addressone,addresstwo,pin,password: hash
    });

    const alreadyHaveUser = await User.findOne({username, personalEmailId});
    if(alreadyHaveUser){
        throw new ExpressError(401, "User email or username is already taken");
    }


    const token = jwt.sign(
        {id: cred._id, username, roles: cred.roles},
        process.env.SECRET,
        {
            expiresIn: "2h"
        }
    );


    cred.token = token;
    await cred.save();
    res.render("login/login.ejs");
};


module.exports.renderLoginPage = (req, res) => {
    res.render("login/login.ejs");
};


module.exports.evaluationOfCredentials = async (req, res) => {
    const {username, password} = req.body;
        const user = await User.findOne({ username: username });

        if (!user) {
            throw new ExpressError(404, "user not found");
        }
    
        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            throw new ExpressError(400, "incorrect password");
        }
        const token = jwt.sign(
            {id: user._id, roles: user.roles},
            process.env.SECRET,
            {
                expiresIn: "2h"
            }
        );

        const update = await User.updateOne(
            {username: username},
            { $set: { token:  token}}
        );

        res.cookie("token", token, {
            httpOnly: true,
        });


       res.redirect("/account/login/list");
    };

 module.exports.getTrainListing = async(req, res) => {
    res.clearCookie("formSubmitted");
    const listings = await TrainDetails.find({});
    const results = await Station.find().select('currentSt -_id');
    // Extract the currentSt values from the results
    const currentStations = results.map(result => result.currentSt);
    console.log(currentStations);
    let userRoles = req.userRoles;
    let status = req.query.status;
    console.log(status);

    return res.render("main/list.ejs", {listings, currentStations, userRoles, status});

 }


module.exports.postBookingOfTrain = async(req, res) => {
    const {id, date} = req.body;
    console.log(id);
    console.log(date);
    
    try{
        let findTrainOnDate = await ScheduledTrain.findOne({
            date: date,
            trainDetails: id,
        })
        console.log(findTrainOnDate);

        if(!findTrainOnDate){
            console.log("hello");
            findTrainOnDate = await ScheduledTrain.create({
                date: date,
                trainDetails: id,
            });
            await findTrainOnDate.save();
            console.log(findTrainOnDate);
        }

        let array = [];
        const getHaltingStations = await TrainDetails.findById(id);
        for(let i = 0; i < getHaltingStations.haltingStations.length; i++){
            console.log(getHaltingStations.haltingStations[i].station)
            console.log(getHaltingStations.haltingStations[i].time);
            array.push(getHaltingStations.haltingStations[i].station + "- Time: " + getHaltingStations.haltingStations[i].time);
        }
        
        console.log(array);

        let seats =  findTrainOnDate.availability;
        console.log(seats, id);
        const data = {
            id: id,
            seats: seats,
            array: array,
        }

        res.json(data);

    } catch(err){
        console.log(err);
    }
}


module.exports.getBookingStatus = (req, res) => {
    console.log("Hello");
    res.render("main/booking.ejs");
}

module.exports.postConfirmationOfTicket = async(req, res) => {
    const data = req.body;
    console.log("Booking Data:", data);
    // Instead of redirecting, send a JSON response
    

    const train = await ScheduledTrain.findOne({trainDetails: data.trainId, date: data.date});
    if(train.availability.length !== 0){
        let curr = [data.f, data.t];
        let array = [];
        for(let i = 0; i < train.availability.length; i++){
            array.push([train.availability[i].fromIndex, train.availability[i].toIndex]);
        }

        array.sort((a, b) => a[a.length - 1] - b[b.length - 1]);

        let overlap = 0;
        for(let i = 0; i < array.length; i++) {
            if(array[i][1] > curr[0]){
                overlap++;
                console.log(curr[0])
            } else {
                console.log("Not overlapping");
            }
        }

    
        const s = await TrainDetails.findById(data.trainId);
        let trainSeats = s.totalSeats;
        let userFrom = data.from;
        let userTo = data.to;
        console.log(userFrom, " ", userTo)
        let seats = trainSeats - overlap;
        res.cookie('formSubmitted', 'true', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true,  redirectUrl: `/account/login/list/bookingPage?data=${encodeURIComponent(JSON.stringify(data))}&seats=${seats}`});

    } else {
        const s = await TrainDetails.findById(data.trainId);
        let trainSeats = s.totalSeats;
        console.log(trainSeats)
        let userFrom = data.from;
        let userTo = data.to;
        console.log(userFrom, " ", userTo)
        res.cookie('formSubmitted', 'true', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true,  redirectUrl: `/account/login/list/bookingPage?data=${encodeURIComponent(JSON.stringify(data))}&seats=${trainSeats}`});
    }
}

module.exports.postBookingStatus = async(req, res) => {
    const token = req.cookies.formSubmitted;
    if(token === undefined) {
        throw new ExpressError(401, "No permission to visit that page");
    }
    const {passengers, data} = req.body;
    const cred = JSON.parse(data);

    let arrTime = cred.from.split("-");
    let depTime = cred.to.split("-");
    let user = req.user.id;

    let calculation = parseInt(passengers.adult) + Math.floor(parseInt(passengers.child) / 2);
    const trainCred = await TrainDetails.findById(cred.trainId);
    let total = trainCred.totalSeats - calculation;

    const train = await ScheduledTrain.findOneAndUpdate(
        { trainDetails: cred.trainId, date: cred.date },
        {
            $push: {
                availability: {
                    passangersDetails: user,
                    fromIndex: cred.f,
                    toIndex: cred.t
                },
                passangersDetails: user.id
            },
            $set: {
                perSeats: total,
            }
        },
        { new: true }
    );

    //-------------------------
    const updatedTrain = await ScheduledTrain.findOne(
        { trainDetails: cred.trainId, date: cred.date }
    );

    // Find the newly added availability object
    const newAvailability = updatedTrain.availability.find(avail => 
        avail.passangersDetails.toString() === user.toString() &&
        avail.fromIndex === cred.f &&
        avail.toIndex === cred.t
    );


    console.log(newAvailability._id);
//-------------------------------

    const userTicket = new UserTicket({
        userId: user,
        trainDetails: cred.trainId,
        scheduleTrainId: newAvailability._id,
        date: cred.date,
        from: arrTime[0],
        to: depTime[0],
        arrTime: arrTime[1],
        deparTime:depTime[1],
        passangers: calculation,
    });

    const savedTicket = await userTicket.save();
    const populatedTicket = await UserTicket.findById(savedTicket._id)
        .populate("trainDetails")
        .exec();
    console.log(populatedTicket);
    const userData = await User.findByIdAndUpdate(user,
        {
            $push:{
                ticket: savedTicket,
            }
        }
    );
    console.log("saved successfully");
    console.log(userData);
    res.clearCookie("formSubmitted");
    res.json(
        {
            success: true,
            redirectUrl: "/account/login/list",
        }
    );
}

module.exports.getTicket = async(req, res) => {
    let user = req.user.id;
    const userOne = await User.findById(user)
        .populate({
            path: "ticket",
            populate: {
              path: "trainDetails"  // Populate trainDetails within each ticket
            }
          });
    res.render("main/showTicket.ejs", {userOne});
}

module.exports.postCancelationOfTicket = async(req, res) => {
    const ticketCred = req.body;
    const user = req.user.id;
    
    console.log(ticketCred);

    const ticket = await UserTicket.findById(ticketCred.ticketId).populate("trainDetails");
    const trainId = ticket.trainDetails._id;
    const scheduleTId = ticket.scheduleTrainId;
    console.log(ticket.trainDetails._id);

    const searchForDelete = await ScheduledTrain.findOne({date: ticketCred.date, trainDetails: trainId});
    let temp = searchForDelete.availability.find(item => item._id.toString() === scheduleTId.toString());
    console.log("-----------------")
    console.log(temp);
    await ScheduledTrain.updateOne(
        { _id: searchForDelete._id },
        { $pull: { availability: { _id: temp._id } } }
    );

    const us = await User.findById(user).populate("ticket");
    console.log(us);
    const tickId = us.ticket.find(item => item._id.toString() === ticketCred.ticketId.toString());
    console.log(tickId);
    await User.updateOne(
        { _id: user },
        { $pull: { ticket: tickId._id } }
    );

    await UserTicket.findByIdAndDelete(tickId);
    console.log("Deleted successfully");
    const redirectUrl = "/account/login/showTicket";
    res.json({redirectUrl});
}


module.exports.postSearchTrain = async(req, res) => {
    const {searchF, searchT} = req.body;
    console.log(searchF, searchT);
    console.log(searchF, searchT);
    const trains = await TrainDetails.find({
        $and: [
            { haltingStations: { $elemMatch: { station: searchF } } },
            { haltingStations: { $elemMatch: { station: searchT } } }
        ]
    });
    const filteredTrains = trains.filter(train => {
        const sourceIndex = train.haltingStations.findIndex(station => station.station === searchF);
        const destinationIndex = train.haltingStations.findIndex(station => station.station === searchT);
        return sourceIndex < destinationIndex;
    });

    
    console.log(filteredTrains);
    res.json(filteredTrains);

}


module.exports.logout = async(req, res) => {
    const token = req.cookies.token;
    res.clearCookie("token");
    res.locals.currUser = "false";
    res.render("login/login.ejs");
}



