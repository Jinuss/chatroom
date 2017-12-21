$(function () {
  var CookieObj = {}, socket = io(), headInfo = "群聊  (";;
  window.onbeforeunload = function (e) {
    if (document.cookie) return false;
  }
  render();
  /*
  *登录
  */
  var onLogin = function (e) {
    var xhr;
    if (!$('#username').val() || !$('#userpassword').val()) return;
    xhr = $.ajax({
      url: '/login',
      type: 'POST',
      dataType: 'json',
      data: {
        name: $('#username').val(),
        password: $('#userpassword').val()
      }
    })
      .done(function (data, textStatus, jqXHR) {
        if (data.value === 'Y') {
          render();
        } else {
          $('#SignInErr').html(data.msg);
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        $('#SignInErr').html('Error occured! Please try again.');
      });
  };
  /*
  *注册
  */
  var onSignup = function (e) {
    var xhr;
    if (!$('#upName').val() || !$('#upPassword').val()) return;
    xhr = $.ajax({
      url: '/signup',
      type: 'POST',
      dataType: 'json',
      data: {
        name: $('#upName').val(),
        password: $('#upPassword').val()
      }
    })
      .done(function (data, textStatus, jqXHR) {
        if (data.value === 'Y') {
          $('#SignUpErr').html(data.msg || 'Login now with these credentials.');
        } else {
          $('#SignUpErr').html(data.msg || 'Invalid username');
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        $('#SignUpErr').html('Error occured! Please try again.');
      });
  };

  var onMsgSubmit = function () {
    var str = $("#msg").val();
    var sendMsg = replace_em(str);
    if (!sendMsg || sendMsg.length > 1261) {
      alert("err:内容为空或者内容长度超出限制！")
      $('#msg').val('');
      return;
    }
    var roomOf = $("#headmessages strong").html();
    socket.emit('chat message', sendMsg, CookieObj.h_imgPath, roomOf);
    $('#msg').val('');
    return false;
  };

  socket.on('sysJoin', function (msg) {
    var joinInfo = "";
    joinInfo = '<li class="markInfo">' + msg + '</li>';
    $(joinInfo).appendTo($("#messages")).animate({ "opacity": 0.5 }, 2000, function () {
      $(this).animate({ "opacity": 1 }, 1500, function () {
        $(this).animate({ "opacity": 0.3 }, 1000);
      });
    });
    scroll();
  });

  socket.on('chat message', function (name, msg, img) {
    var str = '';
    if (name == CookieObj.name) {
      str = '<li class="Liright"><p>' + msg + '</p><img class="msgImg" src="' + CookieObj.h_imgPath + '"/>' + '</li>';
    } else {
      str = '<li class="Lileft"><img class="msgImg" src="' + img + '"/><p>' + msg + '</p></li>';
    }
    $('#messages').append(str);
    scroll();
  });

  /*房间选择*/
  //默认是进广场，从其他房间执行如下函数
  $("#selectmenu li").eq(0).on("click", function (e) {
    e.stopPropagation();
    $("#selectRoom").hide();
    $("#headmessages strong").html("Square");
    socket.emit('join', 'Square', $("#gloableName").html());
    $("#messages").empty();
  });
  $("#selectmenu li").eq(1).on("click", function (e) {
    e.stopPropagation();
    $("#selectRoom").show();
  });
  //选择秦时明月或火影忍者房间
  $("#selectRoom li").on("click", function () {
    var roomName = $(this).children("span").html();
    var userName = $("#gloableName").html();
    $("#headmessages strong").html(roomName);
    socket.emit('join', roomName, userName);
    $("#messages").empty();
  });



  /*
  *接收所有已注册用户的信息
  */
  socket.on('onlineUser', function (online) {
    var onlineStr = '';
    for (var i = 0; i < online.length; i++) {
      var item = online[i];
      onlineStr += '<li><img src="' + item.h_imgPath + '"/><strong>' + item.name + '</strong><em>[Online]</em></li>';
    }
    $("#AllOnline").empty();
    $("#oncount").html(online.length);
    $("#AllOnline").append(onlineStr);
  });
  socket.on('outlineUser', function (outline) {
    var outlineStr = '';
    for (var i = 0; i < outline.length; i++) {
      var item = outline[i];
      outlineStr += '<li><img src="' + item.h_imgPath + '"/><strong>' + item.name + '</strong><em>[Outline]</em></li>';
    }
    $("#AllOutline").empty();
    $("#AllOutline").append(outlineStr);
  });
  socket.on('allUser', function (doc) {
    $('#allcount').html(doc.length);
  });
  socket.on('disconnect', function (name, msg) {
    var leftInfo = "";
    leftInfo = '<li class="markInfo leave">' + msg + '</li>';
    $(leftInfo).appendTo($("#messages")).animate({ "opacity": 0.3 }, 2000, function () {
      $(this).animate({ "opacity": 1 }, 1500, function () {
        $(this).animate({ "opacity": 0.3 }, 1000);
      });
      return this;
    });
    scroll();
  });

  /*当前房间人员信息*/
  var Lastr, r1, r2, r3;
  socket.on('SquareRoom', function (roomInfo) {
    r1 = roomInfo;
    UpdateRoom();
  });
  socket.on('QinRoom', function (roomInfo) {
    r2 = roomInfo;
    UpdateRoom();
  });
  socket.on('NarutoRoom', function (roomInfo) {
    r3 = roomInfo;
    UpdateRoom();
  });
  function UpdateRoom() {
    var $Nowroom = $("#headmessages strong").html(), roomCount, roomStr = '';
    switch ($Nowroom) {
      case "Square": Lastr = r1; break;
      case "The Legend of Qin": Lastr = r2; break;
      case "Naruto": Lastr = r3; break;
      default: Lastr = r1;
    }
    roomCount = Lastr.length;
    for (var i = 0; i < roomCount; i++) {
      var item = Lastr[i];
      roomStr += '<li><img src="' + item.h_imgPath + '"/><strong>' + item.name + '</strong><em>[Online]</em></li>';
    }
    $("#roomCount").html(roomCount);
    $("#Roommembers ul").empty();
    $("#Roommembers ul").append(roomStr);
  }
  /*
  *切换/退出账号
  */
  $("#changeUser").on('click', function () {
    var res = confirm("Are you sure you want to quit and switch to another account??");
    if (res) {
      UL();
    } else {
      $("#control").hide();
      $("#setContent").hide();
      $("#stateSelect").hide();
    }
  });
  $("#layout").on('click', UL);
  function UL() {
    if (document.cookie) {
      $('#loginDiv').addClass('hidden');
      $('#main').removeClass('hidden');
      var uname = getCookie("userInfo");
      CookieObj = JSON.parse(uname.substr(2));
      $.ajax({
        url: '/layout',
        type: 'POST',
        dataType: 'json',
        data: {
          name: CookieObj.name
        }
      })
        .done(function (data, textStatus, jqXHR) {
          if (data.value === 'Y') {
            clearCookie();
            window.location.reload();
          }
        });
    };
  }

  $('#signinForm #loginBtn').click(onLogin);
  $('#signupForm #signupBtn').click(onSignup);
  $('#chatMsgForm #send').click(onMsgSubmit);

  $("#clear").on("click", function () {
    $('#messages').empty();
  });

  /*
  *监听滚动条事件
  */
  $('#messages').get(0).onscroll = function () {
    $("#messages .Liright").css("margin-right", 1);
  }

  /*
  *屏蔽回车键
  */
  $(document).keydown(function (event) {
    switch (event.keyCode) {
      case 13: return false;
    }
  });
  /*
  *用户信息
  */
  $(".headImg").eq(0).on('click', function (e) {
    e.stopPropagation();
    if ($("#control").get(0).style.display == "none") {
      $("#control").show();
    } else {
      $("#control").hide();
      $("#setContent").hide();
      $("#stateSelect").hide();
    }
  });

  /*更改资料*/
  $("#set").on("click", function () {
    $("#setContent").show();
    $("#stateSelect").hide();
  });
  /*构造头像选择内容*/
  var imgStr = '';
  for (var i = 1; i <= 18; i++) {
    imgStr += '<li><img data-in="' + i + '" src="./img/' + i + '.jpg"/></li>';
    if (i % 6 == 0) {
      imgStr += "<br/>";
    }
  }
  $("#setThree #imgContent ul").eq(0).append(imgStr);
  $("#setThree #imgContent li img").on("click", function (e) {
    e.stopPropagation();
    var $index = $(this).attr("data-in");
    $("#setThree #imgContent img").removeClass("imgSelected");
    $("#setThree #imgContent img").eq(($index - 1)).addClass("imgSelected");
  });
  /*人物头像模态框*/
  $("#setThree").dialog({
    autoOpen: false,
    title: "Changing Avatar",
    modal: true,
    width: 578,
    resizable: false,
    buttons: {
      "Ok": function () {
        var selectedImg = $(".imgSelected").attr("data-in");
        //  alert(selectedImg);
        $.ajax({
          url: "/updateImg",
          type: "POST",
          data: {
            name: $('#control div span').eq(0).html(),
            imgIndex: selectedImg
          }
        }).done(function (data) {
          if (data.value === 'Y') {
            $("#setThree").dialog("close");
            $('.headImg').eq(0).attr('src', '/img/' + selectedImg + '.jpg');
            $('#setContent').hide();
            $('#control').hide();
            // alert(data.msg);
          }
        });
        ;
      }
    }
  });
  /*个性签名模态框*/
  $("#setTwo").dialog({
    autoOpen: false,
    title: "Personalized signature setting",
    modal: true,
    resizable: false,
    buttons: {
      "OK": function () {
        var $newSign = $("#setTwo input[type='text']").eq(0).val();
        if ($newSign != '') {
          $.ajax({
            url: '/updateSign',
            type: 'POST',
            data: {
              name: $('#control div span').eq(0).html(),
              newSign: $newSign
            }
          }).done(function (data) {
            if (data.value === 'Y') {
              $("#setTwo p").eq(0).html(data.msg);
              setTimeout(function () {
                $('#control div em').eq(0).html($newSign);
                $("#setTwo").dialog('close');
                $("#setTwo p").eq(0).html('');
              }, 1000);
            }
          });
        }
      },
      "Cancel": function () {
        $(this).dialog('close');
      }
    }
  });
  /*密码模态框*/
  $("#setOne").dialog({
    autoOpen: false,
    title: "Changeing User password",
    modal: true,
    resizable: false,
    buttons: {
      "Ok": function () {
        var $oldpass = $("#setOne #oldpass").val(), $newpass = $("#setOne #newpass").val();
        if ($oldpass != '' && $newpass != '') {
          $.ajax({
            url: '/changepass',
            type: 'POST',
            data: {
              name: $('#control div span').eq(0).html(),
              oldpass: $oldpass,
              newpass: $newpass
            }
          }).done(function (data, textStatus, jqXHR) {
            if (data.value === 'Y') {
              $("#setOne p").eq(0).html(data.msg);
              setTimeout(function () {
                clearCookie();
                $("#setOne p").eq(0).html('');
                window.location.reload();
              }, 1000);
            } else if (data.value === 'N') {
              $("#setOne p").eq(0).html(data.msg);
              $("#setOne #oldpass").val('');
              $("#setOne #newpass").val('');
            }
          });
        }
      },
      "Cancel": function () {
        $(this).dialog('close');
      }
    }
  });
  $("#setContent li").eq(0).click(function (e) {
    e.stopPropagation();
    $("#setOne").dialog("open");
  });
  $("#setContent li").eq(1).click(function (e) {
    e.stopPropagation();
    $("#setTwo").dialog("open");
  });
  $("#setContent li").eq(2).click(function (e) {
    e.stopPropagation();
    $("#setThree").dialog("open");
  });

  /*
  *成员信息面板控制:包括所有成员和具体房间成员的状态
  */
  $("#rightSide #Roommembers ul").hide();
  $("#Allmembers div").css({ 'backgroundColor': "rgb(70,130,180)", "color": "white" });
  $("#Allmembers div i").addClass("glyphicon glyphicon-triangle-bottom");
  $("#Roommembers div i").addClass("glyphicon glyphicon-triangle-right");
  $("#rightSide div >div").click(function (e) {
    var $title = $(this), $anotherTitle = $(this).parent().siblings("div");
    if ($title.next('ul').is(":visible")) {
      $title.siblings('ul').hide();
      $title.children("i").removeClass("glyphicon glyphicon-triangle-bottom").addClass("glyphicon glyphicon-triangle-right");
      $title.css({ 'backgroundColor': "", "color": "" });
    } else {
      $anotherTitle.children('ul').hide();
      $anotherTitle.children('div').css({ 'backgroundColor': "", "color": "" });
      $anotherTitle.children("div").children("i").removeClass("glyphicon glyphicon-triangle-bottom").addClass("glyphicon glyphicon-triangle-right");
      $title.css({ 'backgroundColor': "rgb(70,130,180)", "color": "white" });
      $title.siblings('ul').slideToggle(500).show();
      $title.children("i").removeClass("glyphicon glyphicon-triangle-right").addClass("glyphicon glyphicon-triangle-bottom");
    }
  });

  /*函数集*/

  /*
  *保证scroll始终在最底端
  */
  function scroll() {
    $('#messages,#oldMsg ul').animate({
      scrollTop: 999999999
    }, 0);
  }

  /*
  *删除cookie
  */
  function clearCookie() {
    var keys = document.cookie.match(/[^=;]+(?=\=)/g);
    if (keys) {
      var i = keys.length;
      while (i--) {
        document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString();
      }
    }
  }

  /*
  *获取cookie
  */
  function getCookie(sname) {
    var aCoookie = document.cookie.split(";");
    for (var i = 0; i < aCoookie.length; i++) {
      var aCrumb = aCoookie[i].split("=");
      if (sname == aCrumb[0])
        return decodeURIComponent(aCrumb[1]);
    }
    return null;
  }

  /*
   *界面render
  */
  function render() {
    if (document.cookie) {
      $('.container').addClass('hidden');
      $('#main').removeClass('hidden');
      var uname = getCookie("userInfo");
      CookieObj = JSON.parse(uname.substr(2));
      socket.emit('join', $("#headmessages strong").html(), CookieObj.name);
      $('.headImg').eq(0).attr('src', CookieObj.h_imgPath);
      $('#control div span').eq(0).html(CookieObj.name);
      $('#control div em').eq(0).html(CookieObj.personalizedSign);
    };
  }
  $('.emotion').qqFace({
    id: 'facebox',
    assign: 'msg',
    path: 'img/'	//表情存放的路径
  });
  function replace_em(str) {
    str = str.replace(/\</g, '&lt;');
    str = str.replace(/\>/g, '&gt;');
    str = str.replace(/\n/g, '<br/>');
    str = str.replace(/\[em_([0-9]*)\]/g, '<img src="img/$1.gif" border="0" />');
    return str;
  }
  /*查询聊天记录*/
  $("#chatRecord").on('click', function () {
    $.ajax({
      url: "/queryChatMsg",
      type: "POST",
      data: {
        roomName: $("#headmessages strong").html()
      }
    }).done(function (data) {
      var Msg = data.msg;
      var msgStr = '',
        $name = $('#control div span').eq(0).html();
      for (var i = 0; i < Msg.length; i++) {
        var item = Msg[i];
        if (item.name == $name) {
          msgStr += '<li><span class="blue">' + item.name + '</span>&nbsp;&nbsp;<em class="blue">' + item.saytime + '</em><br/><span>' + item.msg + '</span></li>';
        } else {
          msgStr += '<li><span class="green">' + item.name + '</span>&nbsp;&nbsp;<em class="green">' + item.saytime + '</em><br/><span>' + item.msg + '</span></li>';
        }
      }
      $("#oldMsg ul").empty();
      $("#oldMsg ul").css({ "background-img": 'url("/img/loading.gif")' });
      $("#rightSide").hide();
      $("#oldMsg").show();
      setTimeout(function () {
        $("#oldMsg ul").append(msgStr);
        scroll();
      }, 2000);
    });
  });

  /*关闭历史记录窗口*/
  $("#oldMsgHead i").on('click', function () {
    $("#oldMsg ul").empty();
    $("#oldMsg").hide();
    $("#rightSide").show();
  });
  /*清空聊天历史消息*/
  $("#clearoldMsg i").on('click', function () {
    var result = confirm("This action will delete the chat record on the database. Do you want to continue?");
    if (result) {
      $.ajax({
        url: '/deleteMsg',
        type: 'POST',
        data: {
          roomName: $("#headmessages strong").html()
        }
      }).done(function (data) {
        if (data.value === 'Y') {
          alert(data.msg);
          $("#oldMsg ul").empty();
          $("#oldMsg").hide();
          $("#rightSide").show();
        }
      });
    }
  });
  //多行文本输入框自动聚焦
  $("#msg").focus();
  //获取当前城市以及城市天气
  function findWeather() {
    var cityUrl = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js';
    $.getScript(cityUrl, function (script, textStatus, jqXHR) {
      var citytq = remote_ip_info.city;// 获取城市
      var url = "http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&city=" + citytq + "&day=0&dfc=3";
      $.ajax({
        url: url,
        dataType: "script",
        scriptCharset: "gbk",
        success: function (data) {
          var _w = window.SWther.w[citytq][0];
          var _f = _w.f1 + "_0.png";
          if (new Date().getHours() > 17) {
            _f = _w.f2 + "_1.png";
          }
          var img = "<img width='25px' height='25px' src='http://i2.sinaimg.cn/dy/main/weather/weatherplugin/wthIco/20_20/" + _f
            + "' />";
          // var tq = citytq + " " + img + " " + _w.s1 + " " + _w.t1 + "℃～" + _w.t2 + "℃ " + _w.d1 + _w.p1 + "级";
          var tq = img + _w.s1 + ' ' + citytq + "<br/><span>&nbsp" + _w.t2 + "℃～" + (_w.t1 || 25) + "℃ " + "</span>";
          $('#weather').html(tq);
        }
      });
    });
  }

  findWeather();
});