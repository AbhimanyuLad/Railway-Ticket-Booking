const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const ticket = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    trainDetails:{
        type: Schema.Types.ObjectId,
        ref: "TrainDetails",
    },
    scheduleTrainId:{
        type: Schema.Types.ObjectId,
        ref: "ScheduledTrain"
    },
    date:{
        type: String,
    },
    from:{
        type: String,
    },
    to: {
        type: String,
    },
    arrTime:{
        type: String
    },
    deparTime:{
        type: String,
    },
    passangers:{
        type: Number,
    }
});


module.exports = mongoose.model("Ticket", ticket);








