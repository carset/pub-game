
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
        render('user/create',['push','left']);
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
