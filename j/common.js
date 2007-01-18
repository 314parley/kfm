// see license.txt for licensing
function $(){
	var x=arguments,i,e,a=[];
	for(i=0;i<x.length;++i){
		e=x[i];
		if(typeof e=='string')e=document.getElementById(e);
		if(x.length==1)return e;
		a.push(e);
	}
	return a;
}
if(browser.isIE){
	window.addEvent=function addEvent(o,t,f){
		o['e'+t+f]=f;
		o[t+f]=function(){o['e'+t+f](window.event)}
		o.attachEvent('on'+t,o[t+f]);
	};
}
else{
	window.addEvent=function addEvent(o,t,f) {
		o.addEventListener(t,f,false);
	};
}
function clearSelections(){
	window.getSelection().removeAllRanges();
}
function delEl(o){
	var i;
	if(isArray(o))for(i in o)delEl(o[i]);
	else{
		o=$(o);
		if(o&&o.parentNode)o.parentNode.removeChild(o);
	}
}
function getEls(i,p){
	return p?p.getElementsByTagName(i):document.getElementsByTagName(i);
}
function getElsWithClass(c,t,p){
	var r=[],els=getEls(t,p),i;
	for(i in els)if(els[i].hasClass&&els[i].hasClass(c))r.push(els[i]);
	return r;
}
function getEvent(e){
	return e?e:(window.event?window.event:"");
}
function getEventTarget(e){
	return getEvent(e).currentTarget;
}
function getMouseAt(e){
	e=getEvent(e);
	var m=getWindowScrollAt();
	m.x+=e.clientX;
	m.y+=e.clientY;
	return m;
}
function getOffset(el,s) {
	var n=parseInt(el['offset'+s]),p=el.offsetParent;
	if(p)n+=getOffset(p,s);
	return n;
}
function getWindowScrollAt(){
	return {x:window.pageXOffset,y:window.pageYOffset};
}
function getWindowSize(){
	return {x:window.innerWidth,y:window.innerHeight};
}
function isArray(o){
	return o instanceof Array||typeof o=='array';
}
function kaejax_create_functions(url,f){
	kaejax_is_loaded=1;
	for(i in f){
		eval('window.x_'+f[i]+'=function(){kaejax_do_call("'+f[i]+'",arguments)}');
		function_urls[f[i]]=url;
	}
}
function kaejax_do_call(func_name,args){
	var uri=function_urls[func_name];
	if(!window.kaejax_timeouts[uri])window.kaejax_timeouts[uri]={t:setTimeout('kaejax_sendRequests("'+uri+'")',1),c:[]};
	var l=window.kaejax_timeouts[uri].c.length,v2=[];
	for(var i=0;i<args.length-1;++i)v2[v2.length]=args[i]
	window.kaejax_timeouts[uri].c[l]={f:func_name,c:args[args.length-1],v:v2};
}
function kaejax_sendRequests(uri){
	var t=window.kaejax_timeouts[uri];
	window.kaejax_timeouts[uri]=null;
	var x=new XMLHttpRequest(),post_data="kaejax="+escape(json.s.object(t)).replace(/%([89A-F][A-Z0-9])/g,'%u00$1');
	post_data=kfm_sanitise_ajax(post_data);
	x.open('POST',uri,true);
	x.setRequestHeader("Method","POST "+uri+" HTTP/1.1");
	x.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	x.onreadystatechange=function(){
		if(x.readyState!=4)return;
		var r=x.responseText;
		if(r.substring(0,5)=='error')return alert(r);
		var v=eval('('+unescape(r)+')');
		for(var i=0;i<t.c.length;++i){
			var f=t.c[i].c,p=[];
			if(isArray(f)){
				p=f;
				f=f[0];
			}
			f(v[i],p);
		}
	}
	x.send(post_data);
}
function loadJS(url){
	var i;
	for(i in loadedScripts)if(loadedScripts[i]==url)return 0;
	loadedScripts.push(url);
	var el=newEl('script');
	el.type="text/javascript";
	if(kaejax_is_loaded&&/\.php/.test(url))url+=(/\?/.test(url)?'&':'?')+'kaejax_is_loaded';
	el.src=url;
	getEls('head')[0].appendChild(el);
	return 1;
}
function newEl(t,id,cn,chld){
	var el=document.createElement(t);
	if(t=='iframe')el.src='/i/blank.gif';
	if(id){
		el.id=id;
		el.name=id;
	}
	kfm_addMethods(el);
	el.addEl(chld);
	el.setClass(cn);
	return el;
}
function newForm(action,method,enctype,target){
	var el=newEl('form');
	el.action=action;
	el.method=method;
	el.enctype=enctype;
	el.target=target;
	return el;
}
function newImg(a){
	var b=newEl('img');
	b.src=a;
	return b;
}
function newInput(n,t,v,cl){
	var b;
	if(!t)t='text';
	switch(t){
		case 'checkbox':{
			b=newEl('input',n);
			b.type='checkbox';
			b.style.width='auto';
			break;
		}
		case 'textarea':{
			b=newEl('textarea',n);
			break;
		}
		default:{
			b=newEl('input',n);
			b.type=t;
		}
	}
	if(v){
		if(t=='checkbox'){
			b.checked='checked';
			b.defaultChecked='checked';
		}
		else if(t!='datetime')b.value=v;
	}
	b.setClass(cl);
	return b;
}
function newLink(h,t,id,c,title){
	if(!title)title='';
	var a=newEl('a',id,c,t);
	X(a,{href:h,title:title});
	return a;
}
function newSelectbox(name,keys,vals,s,f){
	var el2=newEl('select',name),el3,s2=0,i;
	if(!s)s=0;
	if(!vals)vals=keys;
	for(i in vals){
		var v1=vals[i].toString();
		var v2=v1.length>20?v1.substr(0,27)+'...':v1;
		el3=X(newEl('option',0,0,v2),{value:keys[i],title:v1});
		if(keys[i]==s)s2=i;
		el2.addEl(el3);
	}
	el2.selectedIndex=s2;
	if(f)el2.onchange=f;
	return el2;
}
function newText(a){
	return document.createTextNode(a);
}
function removeEvent(o,t,f){
	if(o&&o.removeEventListener)o.removeEventListener(t,f,false);
}
function setFloat(e,f){
	e.style.cssFloat=f;
}
function setOpacity(e,o){
	e.style.opacity=o;
}
function X(d,s){
	for(var p in s)d[p]=s[p];
	return d;
}
if(browser.isIE){
	function XMLHttpRequest(){
		var l=(ScriptEngineMajorVersion()>=5)?"Msxml2":"Microsoft";
		return new ActiveXObject(l+".XMLHTTP")
	}
	loadJS('j/browser-specific.ie.js');
}
if(browser.isKonqueror)loadJS('j/browser-specific.konqueror.js');
var json={
	m:{
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	},
	s:{
		array: function (x) {
			var a = ['['], b, f, i, l = x.length, v;
			for (i = 0; i < l; i += 1) {
				v = x[i];
				f = json.s[typeof v];
				if (f) {
					v = f(v);
					if (typeof v == 'string') {
						if (b) {
							a[a.length] = ',';
						}
						a[a.length] = v;
						b = true;
					}
				}
			}
			a[a.length] = ']';
			return a.join('');
		},
		'boolean': function (x) {
			return String(x);
		},
		'null': function (x) {
			return "null";
		},
		number: function (x) {
			return isFinite(x) ? String(x) : 'null';
		},
		object: function (x) {
			if (x&&!x.tagName) {
				if(x instanceof Array)return json.s.array(x);
				var a = ['{'], b, f, i, v;
				for (i in x) {
					v = x[i];
					f = json.s[typeof v];
					if (f) {
						v = f(v);
						if (typeof v == 'string') {
							if (b) {
								a[a.length] = ',';
							}
							a.push(json.s.string(i), ':', v);
							b = true;
						}
					}
				}
				a[a.length] = '}';
				return a.join('');
			}
			return 'null';
		},
		string: function (x) {
			if (/["\\\x00-\x1f]/.test(x)) {
				x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
					var c = json.m[b];
					if (c) {
						return c;
					}
					c = b.charCodeAt();
					return '\\u00' +
					Math.floor(c / 16).toString(16) + (c % 16).toString(16);
				});
			}
			return '"' + x + '"';
		}
	}
};
