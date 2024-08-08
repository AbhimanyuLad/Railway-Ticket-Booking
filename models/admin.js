const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const admin = new Schema({
    username:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    roles: { 
        type: String, 
        default: "admin",
    }
});


module.exports = mongoose.model("Admin", admin);
