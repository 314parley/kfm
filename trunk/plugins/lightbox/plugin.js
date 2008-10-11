function plugin_lightbox(){
	this.name='lightbox';
	this.title='view slideshow';
	this.category='view';
	this.defaultOpener=1;
	this.extensions=['jpg','png','gif','svg'];
	this.mode=1;//multiple files
	this.writable=2;//all
	this.doFunction=function(files){
		kfm_img_startLightbox(files);
	}
}
kfm_addHook(new plugin_lightbox());
kfm_addHook(new plugin_lightbox(),{mode:0,title:kfm.lang.ViewImage});
function kfm_img_startLightbox(id){
	window.lightbox_oldCM=$('documents_body').contentMode;
	$('documents_body').contentMode='lightbox';
	window.title_before_lightbox=document.title;
	if(id&&$type(id)=='array'){
		if(id.length>1){
			window.kfm_slideshow={ids:id,at:0};
			id=0;
		}else{
			id=id[0];
		}
	}
	if(!id){
		window.kfm_slideshow.at++;
		if(window.kfm_slideshow.at>window.kfm_slideshow.ids.length)window.kfm_slideshow.at-=kfm_slideshow.ids.length;
		document.title='KFM Slideshow: '+window.kfm_slideshow.at;
		id=window.kfm_slideshow.ids[window.kfm_slideshow.at%window.kfm_slideshow.ids.length];
	}
	var el,data=File_getInstance(id),oldEl=$('kfm_lightboxImage'),wrapper=$('kfm_lightboxWrapper'),ws,win;
	win=$j(window);
	ws={x:win.width(),y:win.height()};
	if(!wrapper){
		wrapper=document.createElement('div');
		wrapper.id='kfm_lightboxWrapper';
		wrapper.style.position='absolute';
		wrapper.style.left=0;
		wrapper.style.zIndex=1;
		wrapper.style.top=0;
		wrapper.style.width=ws.x+'px';
		wrapper.style.height=ws.y+'px';
		$j.event.add(wrapper,'click',kfm_img_stopLightbox);
		document.body.appendChild(wrapper);
		wrapper.focus();
	}
	wrapper.style.backgroundImage='url("themes/'+kfm_theme+'/large_loader.gif")';
	if(!$('kfm_lightboxShader')){
		el=document.createElement('div');
		el.id='kfm_lightboxShader';
		el.style.width=ws.x+'px';
		el.style.height=ws.y+'px';
		el.style.background='#000';
		$j(el).css('opacity',0.7);
		wrapper.appendChild(el);
	}
	if(oldEl)$j(oldEl).remove();
	var w=data.width,h=data.height,url='get.php?id='+id,r=0;
	if(!w||!h){
		kfm_log(kfm.lang.NotAnImageOrImageDimensionsNotReported);
		return kfm_img_stopLightbox();
	}
	if(w>ws.x*.9||h>ws.y*.9){
		if(w>ws.x*.9){
			r=.9*ws.x/w;
			w*=r;
			h*=r;
		}
		if(h>ws.y*0.9){
			r=.9*ws.y/h;
			w*=r;
			h*=r;
		}
		url+='&width='+parseInt(w)+'&height='+parseInt(h);
	}
	el=document.createElement('img');
	el.id='kfm_lightboxImage';
	el.src=url;
	$j.event.add(el,'load',function(){
		wrapper.style.backgroundImage='url()';
	});
	el.style.position='absolute';
	el.style.left=(+((ws.x-w)/2))+'px';
	el.style.top=(+((ws.y-h)/2))+'px';
	el.style.zIndex=2;
	if(window.kfm_slideshow&&!window.kfm_slideshow_stopped){
		$j.event.add(el,'load',function(){
			window.lightbox_slideshowTimer=setTimeout('kfm_img_startLightbox()',lightbox_slideshow_delay);
		});
	}
	wrapper.appendChild(el);
	kfm_resizeHandler_add('kfm_lightboxShader');
	kfm_resizeHandler_add('kfm_lightboxWrapper');
}
function kfm_img_stopLightbox(e){
	e=new Event(e);
	if(e.rightClick)return;
	$j("#kfm_lightboxWrapper").remove();
	window.kfm_slideshow=window.kfm_slideshow_stopped=null;
	if(window.lightbox_slideshowTimer)clearTimeout(window.lightbox_slideshowTimer);
	document.title=window.title_before_lightbox;
	$('documents_body').contentMode=window.lightbox_oldCM;
	kfm_resizeHandler_remove('kfm_lightboxShader');
	kfm_resizeHandler_remove('kfm_lightboxWrapper');
}
