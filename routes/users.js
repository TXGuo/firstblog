var express = require('express');
var userModel = require('../model/userModel');
var checkStatus = require('../middleware/index');
var router = express.Router();

//md5加密
function md5(val) {
    return require('crypto').createHash('md5').update(val).digest('hex');
}

//注册页面
router.get('/reg', checkStatus.checkNotLogin, function (req, res) {
    res.render('user/reg');
});
//注册
router.post('/reg', checkStatus.checkNotLogin, function (req, res) {
    var user = req.body;
    user.avatar = 'https://secure.gravatar.com/avatar/' + md5(user.email);
    user.password = md5(user.password);

    userModel.create(user, function (err, doc) {
        if (err) {
            res.redirect('back');//返回到上一个页面
        } else {
            req.session.user = doc;
            //增加一个成功的提示
            req.flash('success','注册成功');
            res.redirect('/');
        }
    });
});
//登录页面
router.get('/login', checkStatus.checkNotLogin, function (req, res) {
    res.render('user/login');
});
//登录
router.post('/login', checkStatus.checkNotLogin, function (req, res) {
    var username = req.body.username;
    var pwd = req.body.password;
    userModel.findOne({username: username, password: md5(pwd)}, function (err, doc) {
        if (!err && doc) {
            req.session.user = doc;
            req.flash('success', '登录成功！')
            res.redirect('/');
        } else {
            req.flash('error', '登录失败！')
            res.redirect('back');
        }
    })
});
//退出登录
router.get('/logout', checkStatus.checkLogin, function (req, res) {
    req.session.user = null;//清空session
    res.redirect('/');
});

module.exports = router;
