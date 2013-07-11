
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
});