var mongoose = require("mongoose");

var PersonSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
    email: {type: String},
    avatar: String,
    time: {type: Date, default: Date.now()}
});

// ´´½¨Model
var PersonModel = mongoose.model("users", PersonSchema);

module.exports = PersonModel;