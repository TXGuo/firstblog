var express = require('express');
var router = express.Router();
var articleModel = require('../model/articleModel');
var markdown = require('markdown').markdown;

/* GET home page. */
router.get('/', function(req, res, next) {
  articleModel.find().populate('user').exec(function(err,articles){
    if(err){
      req.flash('error',error);
      return res.redirect('/');
    }
    articles.forEach(function(article){
      article.content =markdown.toHTML(article.content);
    });
    res.render('index', {articles:articles});
  });
});

module.exports = router;
