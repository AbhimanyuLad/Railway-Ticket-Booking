const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const stationList = Schema({
    previousSt: {
        type: String,
        required: true,
    },
    currentSt:{
        type: String,
        required: true,
    },
    nextSt:{
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("StationList", stationList);










