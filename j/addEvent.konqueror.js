function addEvent(o,e,f){
	switch(e){
		case 'click':{
			f=(function(f){return function(e){if(e.button==1)f(e)}})(f);
			break;
		}
		case 'contextmenu':{
			e='mousedown';
			f=(function(f){
				return function(e){
					if(e.button==2){
						e.preventDefault();
						f(e);
					}
				}
			})(f);
			break;
		}
	}
	o.addEventListener(e,f,false);
}