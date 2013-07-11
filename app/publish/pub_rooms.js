
//房间数据发布

module.exports = function(fw){
    fw.publish('room', 'pub_room', function(callback){
    	var collection = this;
    	collection.find({}, {}, function(err,items){
    		callback(items)
    	});
    });
}