
//用户数据发布

module.exports = function(fw){
    fw.publish('user', 'pub_user', function(callback){
    	var collection = this;
    	collection.find({} ,{}, function(err,items){
    		callback(items)
    	});
    });
}