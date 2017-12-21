var express = require('express'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  http = require('http'),
  path = require('path'),
  io = require('socket.io'),
  mongoose = require('mongoose'),
  app = express(),
  db,
  userRoutes,
  socketIO;

/* 数据库连接 */
mongoose.connect('mongodb://localhost:27017/chatroom');
db = mongoose.connection;
db.on('error', console.error.bind(console, '数据库连接失败!'));
db.once('open', function callback() {
  console.log('数据库连接成功！');
});

/*Express 配置*/
app.use(cookieParser());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


http=http.createServer(app,function(req,res){
  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
});
io = io(http);

indexRoutes = require('./routes/index')(app);
userRoutes = require('./routes/users')(app);

/*绑定io到服务器上*/
socketIO = require('./socketIO')(app, io);

http.listen(3000, function () {
  console.log('listening on *:3000');
});