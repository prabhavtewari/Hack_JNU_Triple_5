const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const appointSchema = new Schema({
    slot: String,
    patid: String,
    docid: String,
    patname: String,
    docname: String,
    status: String
},{timestamps:true});

const Appoint = mongoose.model('Appoint',appointSchema);

module.exports = Appoint;
