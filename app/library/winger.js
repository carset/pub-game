Handlebars.registerHelper("winger", function(winger) {
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