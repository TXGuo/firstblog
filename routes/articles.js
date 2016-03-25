var express = require('express');
var articleModel = require('../model/articleModel');
var router = express.Router();
var multer = require('multer');
var markdown = require('markdown').markdown;

//指定文件元素的存储方式
var storage = multer.diskStorage({
    //保存文件的路径
    destination: function (req, file, cb) {
        cb(null, '../public/images')
    },
    //指定保存的文件名
    filename: function (req, file, cb) {
        console.error(file);
        cb(null, Date.now() + '.' + file.mimetype.slice(file.mimetype.indexOf('/') + 1))
    }
})

var upload = multer({storage: storage})

router.get('/add', function (req, res) {
    res.render('articles/add', {article: {}});
});

router.post('/add', upload.single('img'), function (req, res) {
    var article = req.body;
    console.log('请求体啊：', article);
    var _id = article._id;
    if (_id) {//有值是表示修改
        //set要更新字段
        var set = {title: article.title, content: article.content};
        if (req.file) {//如果新上传了文件，那么更新img字段
            set.img = '/images/' + req.file.filename;
        }
        articleModel.update({_id: _id}, {$set: set}, function (err, article) {
            if (err) {
                req.flash('error', '更新文章失败');
                return res.redirect('back');
            } else {
                req.flash('success', '更新文章成功');
                return res.redirect('/');
            }
        });
    } else {
        if (req.file) {//如果新上传了文件，那么更新img字段
            article.img = '/images/' + req.file.filename;
        }
        var user = req.session.user;
        article.user = user;//user是个对象，但保存进数据库里的是个ID字符串
        console.log(article);
        articleModel.create(article, function (err, article) {
            console.log('出错了啊 --  ' + err);
            if (err) {
                req.flash('error', '发表文章失败');
                return res.redirect('back');
            } else {
                req.flash('success', '发表文章成功');
                return res.redirect('/');
            }
        });
    }
});

router.get('/details/:id', function (req, res) {
    articleModel.findById(req.params.id, function (err, doc) {
        if (doc.user == req.session.user._id) {
            doc.editable = true;
        }
        res.render('articles/details', {article: doc});
    })
})

router.get('/update/:id', function (req, res) {
    articleModel.findById(req.params.id, function (err, doc) {
        res.render('articles/add', {article: doc});
    })
})

router.get('/delete/:id', function (req, res) {
    articleModel.remove({_id: req.params.id}, function (err) {
        if (err) {
            req.flash('error', "删除失败");
            res.redirect('back');
        } else {
            req.flash('success', "删除成功");
            res.redirect('/');
        }
    })
})

router.post('/search', function (req, res) {
    var title = req.body.title;
    req.session.user.keyValue = title;
    articleModel.find({title: new RegExp(title)}).populate('user').exec(function (err, articles) {
        if (err || !articles) {
            req.flash('error', '暂无相关内容');
            return res.redirect('/');
        }

        articles.forEach(function (article) {
            article.content = markdown.toHTML(article.content);
        });
        res.render('index', {articles: articles});
    });
});
module.exports = router;
