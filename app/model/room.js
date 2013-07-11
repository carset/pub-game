
//房间模型

Model.room = function(exports){  
    exports.config = {      
        fields : [
            {name : 'name', type: 'text'}, //房间名称
            {name : 'smr_id', type: 'text'}, //房间ID
            {name : 'admin', type: 'text'} //当前决定人ID
        ]
    };
};