const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointSchema = new Schema({
    date: String,
    slot: String,
    patid: String,
    docid: String,
    patname: String,
    docname: String,
    tests:{
        type:String,
        default: ""
    },
    meds:{
        type:String,
        default: ""
    },
    url: {
        type:String,
        default: "/call"
    },
    status: {
        type:String,
        default: "wait"
    }
},{timestamps:true});

const Appoint = mongoose.model('Appoint',appointSchema);

module.exports = Appoint;
