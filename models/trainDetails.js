const { required, ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const trainDetails = new Schema({
    trainNum:{
        type: Number,
        required: true,
    },
    trainName:{
        type: String,
        required: true,
    },
    from:{
        type: String,
        required: true,
    },
    to:{
        type: String,
        required: true,
    },
    departureTime: {
        type: String,
        required: true,
    },
    arrivalTime: {
        type: String,
        required: true,
    },
    totalSeats:{
        type: Number,
        required: true,
    },
    haltingStations: [
        {
          station: {
            type: String,
            required: true
          },
          time: {
            type: String,
            required: true
          }
        }
      ],
});


module.exports = mongoose.model("TrainDetails", trainDetails);

