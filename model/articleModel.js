var mongoose = require('mongoose');

var articleSchema = new mongoose.Schema({
    title: String,
    content: String,
    img: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    createAt: {type: Date, default: Date.now()}
})
var articleModel = mongoose.model('article', articleSchema);

module.exports = articleModel;