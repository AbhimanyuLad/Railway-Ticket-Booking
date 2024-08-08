const { required, ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    username:{
        type:String,
        required: true
    },
    mobileNum:{
        type: Number,
        required: true,
    },
    personalEmailId:{
        type: String,
        required: true
    },
    addressone:{
        type: String,
        required: true
    },
    addresstwo:{
        type: String,
        required: true
    },
    pin:{
        type: Number,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    token: {
        type: String,
        default: "",
    },
    ticket:[
        {
            type: Schema.Types.ObjectId,
            ref: "Ticket",
        }
    ],
    roles: { 
        type: String, 
        default: 'user',
    }
});


module.exports = mongoose.model("User", userSchema);


