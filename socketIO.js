var users = {};
var QueryUser = require('./mongoDB/models/model').User;
var Msg = require('./mongoDB/models/model').Msg;
//获取实时时间
function gettime() {
  var time = new Date();
  var timepartone = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ';
  var timemid = time.getHours(), s;
  if (timemid < 6) {
    s = "凌晨 " + timemid;
  } else if (timemid < 12) {
    s = "上午 " + timemid;
  } else if (timemid < 18) {
    s = "下午 " + '0' + (timemid - 12);
  } else {
    s = "晚上 " + (timemid - 12);
  }
  var timeparttwo = s + ":" + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes());
  return timepartone + timeparttwo;
}
/*创建三个房间：Square、The Legend of Qin、Naruto*/
var rooms = { 'Square': [], 'The Legend of Qin': [], 'Naruto': [] };
var user = '';
module.exports = function (app, io) {
  io.on('connection', function (socket) {
    socket.on('join', function (roomName, userName) {
      user = userName;
      users[socket.id] = userName;
      for (var i in rooms) {
        if (roomName != i) {
          var index = rooms[i].indexOf(user);
          if (index !== -1) {
            console.log("删除前" + rooms[i]);
            rooms[i].splice(index, 1);
            io.to(i).emit('sysLeft', user + "退出了房间" + roomName);
            socket.leave(i);
            console.log(userName + '离开了房间' + i + ':这个房间里还有' + rooms[i]);
          }
        }
      }
      var flag = true;
      for (var j = 0; j < rooms[roomName].length; j++) {
        if (rooms[roomName][j] == user) {
          flag = false;
        }
      }
      if (flag) {
        rooms[roomName].push(user);
        socket.join(roomName);
      }
      io.sockets.in(roomName).emit('sysJoin', user + '加入了房间' + roomName);
      total();
      console.log(user + '加入了' + roomName);
    });
    socket.on('chat message', function (msg, img, roomOf) {
      var name = '';
      name = users[socket.id];
      var newMsg = new Msg({ name: name, msg: msg, saytime: gettime(),roomName:roomOf });
      newMsg.save();
      if (rooms[roomOf].indexOf(name) === -1) {
        return false;
      }
      console.log(roomOf + ":" + msg);
      io.sockets.in(roomOf).emit('chat message', name, msg, img);
    });
    socket.on('disconnect', function () {
      var msg = '', name = '', time = '';
      time = gettime();;
      name = users[socket.id];
      for (var i in rooms) {
          var index = rooms[i].indexOf(name);
          if (index !== -1) {
            console.log("删除前" + rooms[i]);
            rooms[i].splice(index, 1);
            io.to(i).emit('sysLeft', name + "退出了房间" + i);
            socket.leave(i);
            console.log(name + '离开了房间' + i + ':这个房间里还有' + rooms[i]);
        }
      }
      msg = name + '离开群聊  ' + time;
      io.emit('disconnect', name, msg);
      var timeTotal = total();
    });
    //获取总用户
    function total() {
      QueryUser.find({}, function (err, doc) {
        io.emit('allUser', doc);
      });
      QueryUser.find({ status: false }, function (err, doc) {
        io.emit('outlineUser', doc);
      });
      QueryUser.find({ status: true }, function (err, doc) {
        io.emit('onlineUser', doc);
      });
      //查询房间里成员的信息
      /*三个房间：Square、The Legend of Qin、Naruto*/
      var F_RMInfo = [], S_RMInfo = [], T_RMInfo = [];
      for (var k = 0; k < rooms["Square"].length; k++) {
        QueryUser.findOne({ name: rooms["Square"][k] }, function (err, doc) {
          F_RMInfo.push(doc);
          io.sockets.in("Square").emit('SquareRoom', F_RMInfo);
          console.log(F_RMInfo);
        });
      }
      for (var i = 0; i < rooms["The Legend of Qin"].length; i++) {
        QueryUser.findOne({ name: rooms["The Legend of Qin"][i] }, function (err, doc) {
          S_RMInfo.push(doc);
          io.sockets.in("The Legend of Qin").emit('QinRoom', S_RMInfo);
          console.log(S_RMInfo);
        });
      }
      for (var j = 0; j < rooms["Naruto"].length; j++) {
        QueryUser.findOne({ name: rooms["Naruto"][j] }, function (err, doc) {
          T_RMInfo.push(doc);
          io.sockets.in("Naruto").emit('NarutoRoom', T_RMInfo);
          console.log(T_RMInfo);
        });
      }
    }
  });

};