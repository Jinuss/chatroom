var User = require('./../mongoDB/models/model').User,
    Msg = require('./../mongoDB/models/model').Msg,
    newUser;
module.exports = function (app) {
  //登录
  app.post('/login', function (req, res) {
    if (!req.body) return res.sendStatus(400);
    User.findOne({ name: req.body.name, password: req.body.password }, function (err, doc) {
      if (err) res.end('Error');
      if (!doc) {
        res.json({ 'value': 'N', 'msg': 'Username doesn\'t exist or Username and password doesn\'t match!' });
      }
      if (doc) {
        User.findOne({ name: req.body.name, status: false }, function (err, docs) {
          if (docs) {
            User.update({ name: req.body.name }, { $set: { status: true } }, function (err) {
              if (!err) {
                res.cookie("userInfo", docs);
                res.json({ 'value': 'Y', 'msg': 'Login Success!' });
              }
            });
          } else {
            res.json({ 'value': 'N', 'msg': 'User have Logined!' });
          }
        });
      }
    });
  });
  //注册
  app.post('/signup', function (req, res, next) {
    if (!req.body) return res.sendStatus(400);
    User.findOne({ name: req.body.name }, function (err, doc) {
      if (doc) {
        res.json({ 'value': 'N', 'msg': 'Username have existed!' });
      } else {
        newUser = new User({ name: req.body.name, password: req.body.password });
        newUser.save(function (err, doc) {
          if (err) res.end('Error');
          if (!doc) res.end('Not found');
          if (doc) res.json({ 'value': 'Y', 'msg': 'Sign success,login at once!' });
        });
      }
    });
  });
  //退出修改用户的状态status
  app.post('/layout', function (req, res) {
    User.update({ name: req.body.name }, { $set: { status: false } }, function (err) {
      if (!err) {
        res.json({ 'value': 'Y', 'msg': 'layout success!' });
      }
    });
  });

  //更改个性签名
  app.post('/updateSign', function (req, res) {
    User.update({ name: req.body.name }, { $set: { personalizedSign: req.body.newSign } }, function (err) {
      if (!err) {
        User.findOne({ name: req.body.name }, function (err, docs) {
          if (docs) {
            res.json({ 'value': 'Y', 'msg': 'Update sign success' });
          }
        });
      }
    });
  });

  //更改用户密码
  app.post('/changepass', function (req, res) {
    User.findOne({ name: req.body.name, password: req.body.oldpass }, function (err, docs) {
      if (docs) {
        User.update({ name: req.body.name }, { $set: { password: req.body.newpass } }, function (err) {
          if (!err) {
            User.findOne({ name: req.body.name, password: req.body.newpass }, function (err, docs) {
              res.json({ 'value': 'Y', 'msg': 'Update success,please relogin!' });
            })
          }
        })
      } else {
        res.json({ 'value': 'N', 'msg': 'Old Password is error,please resure' });
      }
    });
  });

  //更换头像
  app.post('/updateImg', function (req, res) {
    User.update({ name: req.body.name }, { $set: { h_imgPath: '/img/' + req.body.imgIndex + '.jpg' } }, function (err) {
      if (!err) {
        User.findOne({ h_imgPath: '/img/' + req.body.imgIndex + '.jpg' }, function (err, docs) {
          if (docs) {
            res.json({ 'value': 'Y', 'msg': 'Update success!' });
          }
        });
      }
    });
  });
  //查询聊天记录
  app.post('/queryChatMsg',function(req,res){
    Msg.find({roomName:req.body.roomName},function(err,doc){
      if(doc){
         res.json({'value': 'Y','msg':doc});
        console.log(doc);
      }
    })
  });
 //删除聊天记录
 app.post('/deleteMsg',function(req,res){
   Msg.remove({roomName:req.body.roomName},function(err){
      if(!err)
          res.json({'value': 'Y','msg':"The history has been cleared!"});
   });
 });

};
