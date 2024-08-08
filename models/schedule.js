const { date, number, required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const trainSchedule = new Schema({
       date:{
          type: String,
          required: true,
       },
       perSeats: {
         type: Number,
         // default: 50,
       },
       availability: [
         {
            passangersDetails:{
               type: Schema.Types.ObjectId,
               ref: "User",
            },
            fromIndex:{
               type: Number
            },
            toIndex: {
               type: Number
            },
         }
       ],
       trainDetails:{
          type: Schema.Types.ObjectId,
          ref: "TrainDetails",
          required: true,
      },

});


module.exports = mongoose.model("ScheduledTrain", trainSchedule);
