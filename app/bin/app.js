;//server side config
var socketPort = 
    (typeof process !== 'undefined' && 
     typeof process.BAE !== 'undefined') ?
    80 : 8082;
var clientSocketServer = typeof location !== 'undefined' ? 
        location.hostname + ':' + socketPort + '/socket/' : '';
        //location.hostname + '/socket/' : '';

clientSocketServer = clientSocketServer.replace('.duapp.com', '.sx.duapp.com'); 

//clientSocketServer = '72.16.22.189'

sumeru.config({
	httpServerPort: 8080,
	sumeruPath: '/../sumeru',
	soketPort: socketPort,
	clientSocketServer : clientSocketServer
});
;
//Router
sumeru.router.add(
    {
        pattern :'/hall',
        action: 'App.hall'
    }
);

sumeru.router.setDefault('App.hall');

//大厅
App.hall = sumeru.controller.create(function(env,session){

	var hallInfo = function(){
	    env.subscribe('pub_room', function(collection){
	        session.bind('room_list', {
	            data    :   collection.find(),
	        });              
	    });
    };
	//加载
	env.onload = function(){
        return [hallInfo]
    }

    //渲染
    env.onrender = function(render) {
        render('hall',['push','left']);
    }

    //完成
    env.onready = function(){
        session.event('room_list', function(){
            var rooms = document.getElementsByName('enter');//链接信息
            for(var i=0;i<rooms.length;i++){
                rooms[i].addEventListener('click', enter_room);
            }
        });

        session.event('room_contro', function(){
        	var create = document.getElementById("create");
        	create.addEventListener('click', function(e){
        		//跳转到创建房间
        		env.redirect('/room/create')
        	});
        });
    }
    var enter_room = function(event){
        var element = event.target;
        var roomId = element.getAttribute('refid');
        //判断用户是否注册
        if(Library.cookie.getCookie('user_id')) {
            env.redirect('/room/main', {'rid':roomId}, true);
        }else{
            env.redirect('/user/create', {'rid':roomId}, true);
        }
    }
});;
//Router
sumeru.router.add(
    {
        pattern :'/room/main',
        action: 'App.room'
    },
    {
        pattern :'/room/create',
        action: 'App.create_room'
    }
);

//房间
App.room = sumeru.controller.create(function(env,session,param){
    var rooms = function(){ 
        session.room = env.subscribe('pub_room', function(collection){
            session.bind('room_info', { //房间信息
                room    :   collection.find({'smr_id':param.rid})[0],
            }); 
        });
        session.users = env.subscribe('pub_user', function(collection){
            session.bind('users_list', { //房间中的用户
                users    :   collection.find({'room_id': param.rid}),
            });           
        });
    };
    //加载
    env.onload = function(){
        return [rooms];
    }

     //渲染
    env.onrender = function(render) {
        render('room',['push','left']);
    }

    var update_user = function(){
        //判断用户状态
        var user_id = Library.cookie.getCookie('user_id');
        if(! user_id) { //如果用户没有信息，跳到创建用户页
            env.redirect('/user/create', {'rid': param.rid}, true);
            return;
        }
        if (Library.cookie.getCookie('room_id') != param.rid){ // change room
            setTimeout(function(){
                session.users.update({'room_id': param.rid}, {'smr_id':user_id});
                session.users.save();
                //更新用户COOKIE信息
                Library.cookie.addCookie('room_id', param.rid);
            },1500); //fix 
        }
    }

    var wagers = function(number){
        var seed=new Array;
        for (var i=0;i<number;i++) seed[i]=i;
        seed.sort(function(){ return 0.5 - Math.random();});
        return seed;
    };
    env.onready = function(){
        update_user();
        session.event('user_action', function(){
            var back = document.getElementById('back');
            back.addEventListener('click', function(){
                env.redirect('/hall');
            });
            var destory = document.getElementById('destory');
            destory.addEventListener('click', function(){
                var user_id = Library.cookie.getCookie('user_id');
                session.users.destroy({'smr_id':user_id});
                
                Library.cookie.deleteCookie('username');
                Library.cookie.deleteCookie('user_id');
                Library.cookie.deleteCookie('room_id');

                env.redirect('/hall')
            });

            var start = document.getElementById('start');
            start.addEventListener('click', function(){
                //设定赌注;延迟500秒执行
                setTimeout(function(){
                    var may = 3;//最大3种可能。
                    //当前房间所有人
                    var room_id = Library.cookie.getCookie('room_id');
                    var users = session.users.find({'room_id': room_id})
                    var wager = wagers(may)
                    for(var i=0; i<users.length;i++){
                        session.users.update({'wager': wager[i % may]},{'smr_id':users[i].smr_id});
                    }
                    session.users.save();//保存用户信息
                    session.room.update({'admin': unescape(Library.cookie.getCookie('username'))},{'smr_id':room_id});
                    session.room.save();//保存出牌信息
                },500);
            });
        });
    }
});

//创建Room
App.create_room = sumeru.controller.create(function(env,session){

	var rooms = function(){
	    session.rooms = env.subscribe('pub_room', function(collection){            
	    });
    };
	//加载
	env.onload = function(){
        return [rooms]
    }

    //渲染
    env.onrender = function(render) {
        render('room_create',['push','left']);
    }

    //完成
    env.onready = function(){
        session.event('create_room', function(){
            var submit = document.getElementById('submit');
            var cancle = document.getElementById('cancle');
            var title = document.getElementById('title');

            submit.addEventListener('click',function(){ //创建房间
                var name = title.value.trim();
                //...若干判断逻辑
                var room = sumeru.model.create('Model.room');
                room.name = name;
                session.rooms.add(room);
                session.rooms.save();
                env.redirect('/hall');
            });

            cancle.addEventListener('click', function(){ //back
                env.redirect('/hall');
            }); 

        });
    }
});;
//Router
sumeru.router.add(
    {
        pattern :'/user/create',
        action: 'App.user_create'
    }
);

//创建用户
App.user_create = sumeru.controller.create(function(env,session,param){
	var userInfo = function(){
	    session.user = env.subscribe('pub_user', function(collection){             
	    });
    };
	//加载
	env.onload = function(){
        return [userInfo]
    }

    //渲染
    env.onrender = function(render) {
        render('user_create',['push','left']);
    }

    //完成
    env.onready = function(){
        session.event('create_user', function(){
            var submit = document.getElementById('submit');//创建用户
            submit.addEventListener('click',function(){
            	var username = document.getElementById('username').value.trim();
            	var model = sumeru.model.create('Model.user');
            	model.name = username;
                model.room_id = param.rid || Library.cookie.getCookie('room_id'); //切换用户到房间
                //model.status = '0';//设置用户状态
                if(Library.cookie.getCookie('user_id')) {
                    model.smr_id = Library.cookie.getCookie('user_id'); //复用数据
                }
            	session.user.add(model);
            	session.user.save();
            	//保存用户信息
            	Library.cookie.addCookie('username', username);
            	Library.cookie.addCookie('user_id', model.getId());
            	//转到房间中
            	env.redirect('/room/main', {'rid':param.rid});
            });
            var cancle = document.getElementById('cancle');
            cancle.addEventListener('click',function(){
            	env.redirect('/hall')
            });
        });
    }
});
;
//房间模型

Model.room = function(exports){  
    exports.config = {      
        fields : [
            {name : 'name', type: 'text'}, //房间名称
            {name : 'smr_id', type: 'text'}, //房间ID
            {name : 'admin', type: 'text'} //当前决定人ID
        ]
    };
};;
//用户模型

Model.user = function(exports){  
    exports.config = {      
        fields : [
            {name : 'name', type : 'text'}, //用户名称
            {name : 'smr_id', type : 'text'}, //用户ID
            {name : 'room_id', type :'text'}, //房间
            {name : 'wager', type	: 'text'}, //赌注
        ]
    };
};;Handlebars.registerHelper("winger", function(winger) {
	var ret = '';
 	switch(parseInt(winger)){
 		case 0:
 		  ret =  '喝';
 		 break;
 		 case 1:
 		  ret =  '不喝';
 		 break;
 		 case 2:
 		  ret =  '陪喝';
 		 break;
 		 default:
 		  ret = '作弊';
 		  break;
 	}
 	return  ret;
});