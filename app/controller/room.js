
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
        render('rooms/room',['push','left']);
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
                    session.room.update({'admin': Library.cookie.getCookie('username')},{'smr_id':room_id});
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
        render('rooms/create',['push','left']);
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
});