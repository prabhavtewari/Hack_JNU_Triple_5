require('dotenv').config();


var MONGO_URI = process.env.MONGO_URI;
var SECRET = process.env.SECRET;


module.exports = {

    MONGO_URI,
    SECRET
}