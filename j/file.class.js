var File=new Class({
	getText:function(varname){
		var el=new Element('span',{
			'class':varname+' file_'+varname+'_'+this.id
		});
		el.appendText($pick(this[varname],''));
		return el;
	},
	initialize:function(id){
		this.id=id;
		x_kfm_getFileDetails(id,function(el){
			var id=parseInt(el.id);
			el=$H(el);
			var F=File_getInstance(id);
			el.each(function(varvalue,varname){
				F[varname]=varvalue;
				$ES('.file_'+varname+'_'+id).each(function(t){
					t.empty();
					t.appendText(varvalue);
				});
			});
		});
	},
	setThumbnailBackground:function(el,reset){
		if(this.icon_loaded && !reset)el.setStyle('background-image','url("'+this.icon_url+'")');
		else{
			var url='get.php?id='+this.id+'&width=64&height=64&get_params='+kfm_vars.get_params+'&r'+Math.random();
			var img=new Element('img',{
				src:url,
				styles:{
					width:1,
					height:1
				}
			});
			var id=this.id;
			img.addEvent('load',function(){
				var p=this.parentNode;
				p.setStyle('background-image','url("'+url+'")');
				var F=File_getInstance(id);
				F.icon_loaded=1;
				F.icon_url=url;
				this.remove();
			});
			kfm.addEl(el,img);
		}
	}
});
var File_Instances=[];
function File_getInstance(id){
	id=parseInt(id);
	if(!File_Instances[id])File_Instances[id]=new File(id);
	return File_Instances[id];
}
