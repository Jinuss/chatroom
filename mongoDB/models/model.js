var mongoose = require("mongoose");
var msgRecord=new mongoose.Schema({
    name:{
     type:String,
     index:true,
    },
    roomName:{
      type:String
    },
    msg:{
      type:String,
    },
    saytime:{
      type:String,
    }     
});
var UserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true
  },
  password:{
    type: String,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  updated: {
    type: Date, default: Date.now
  },
  status: {
    type: Boolean,
    default: false
  },
  h_imgPath: {
    type: String,
    default:"/img/1.jpg"
  },
  personalizedSign:{
    type:String,
    default:"Write something will well`"
  }
});

var User = mongoose.model('User', UserSchema);
var Msg=mongoose.model('Msg',msgRecord);
module.exports = {
  User:User,
  Msg:Msg
};