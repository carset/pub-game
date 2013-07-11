
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
};