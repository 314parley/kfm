var MooTools = {
version: '1.11'
};
function $merge(){
var mix = {};
for (var i = 0; i < arguments.length; i++){
for (var property in arguments[i]){
var ap = arguments[i][property];
var mp = mix[property];
if (mp && $type(ap) == 'object' && $type(mp) == 'object') mix[property] = $merge(mp, ap);
else mix[property] = ap;
}
}
return mix;
};
var $extend = function(){
var args = arguments;
if (!args[1]) args = [this, args[0]];
for (var property in args[1]) args[0][property] = args[1][property];
return args[0];
};
var $native = function(){
for (var i = 0, l = arguments.length; i < l; i++){
arguments[i].extend = function(props){
for (var prop in props){
if (!this.prototype[prop]) this.prototype[prop] = props[prop];
if (!this[prop]) this[prop] = $native.generic(prop);
}
};
}
};
$native.generic = function(prop){
return function(bind){
return this.prototype[prop].apply(bind, Array.prototype.slice.call(arguments, 1));
};
};
$native(Function, Array, String, Number);
function $chk(obj){
return !!(obj || obj === 0);
};
var Abstract = function(obj){
obj = obj || {};
obj.extend = $extend;
return obj;
};
var Window = new Abstract(window);
var Document = new Abstract(document);
window.xpath = !!(document.evaluate);
if (window.ActiveXObject) window.ie = window[window.XMLHttpRequest ? 'ie7' : 'ie6'] = true;
else if (document.childNodes && !document.all && !navigator.taintEnabled) window.webkit = window[window.xpath ? 'webkit420' : 'webkit419'] = true;
else if (document.getBoxObjectFor != null) window.gecko = true;
window.khtml = window.webkit;
Object.extend = $extend;
if (typeof HTMLElement == 'undefined'){
var HTMLElement = function(){};
if (window.webkit) document.createElement("iframe"); //fixes safari
HTMLElement.prototype = (window.webkit) ? window["[[DOMElement.prototype]]"] : {};
}
HTMLElement.prototype.htmlElement = function(){};
if (window.ie6) try {document.execCommand("BackgroundImageCache", false, true);} catch(e){};
var Class = function(properties){
var klass = function(){
return (arguments[0] !== null && this.initialize && $type(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
};
$extend(klass, this);
klass.prototype = properties;
klass.constructor = Class;
return klass;
};
Class.prototype = {
extend: function(properties){
var proto = new this(null);
for (var property in properties){
var pp = proto[property];
proto[property] = Class.Merge(pp, properties[property]);
}
return new Class(proto);
}
};
Class.Merge = function(previous, current){
if (previous && previous != current){
var type = $type(current);
if (type != $type(previous)) return current;
switch(type){
case 'function':
var merged = function(){
this.parent = arguments.callee.parent;
return current.apply(this, arguments);
};
merged.parent = previous;
return merged;
case 'object': return $merge(previous, current);
}
}
return current;
};
var Events = new Class({
fireEvent: function(type, args, delay){
if (this.$events && this.$events[type]){
this.$events[type].each(function(fn){
fn.create({'bind': this, 'delay': delay, 'arguments': args})();
}, this);
}
return this;
}
});
Array.extend({
forEach: function(fn, bind){
for (var i = 0, j = this.length; i < j; i++) fn.call(bind, this[i], i, this);
},
filter: function(fn, bind){
var results = [];
for (var i = 0, j = this.length; i < j; i++){
if (fn.call(bind, this[i], i, this)) results.push(this[i]);
}
return results;
},
map: function(fn, bind){
var results = [];
for (var i = 0, j = this.length; i < j; i++) results[i] = fn.call(bind, this[i], i, this);
return results;
},
every: function(fn, bind){
for (var i = 0, j = this.length; i < j; i++){
if (!fn.call(bind, this[i], i, this)) return false;
}
return true;
},
indexOf: function(item, from){
var len = this.length;
for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
if (this[i] === item) return i;
}
return -1;
},
copy: function(start, length){
start = start || 0;
if (start < 0) start = this.length + start;
length = length || (this.length - start);
var newArray = [];
for (var i = 0; i < length; i++) newArray[i] = this[start++];
return newArray;
},
contains: function(item, from){
return this.indexOf(item, from) != -1;
},
extend: function(array){
for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
return this;
},
merge: function(array){
for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
return this;
},
include: function(item){
if (!this.contains(item)) this.push(item);
return this;
}
});
Array.prototype.each = Array.prototype.forEach;
Array.each = Array.forEach;
function $A(array){
return Array.copy(array);
};
function $each(iterable, fn, bind){
if (iterable && typeof iterable.length == 'number' && $type(iterable) != 'object'){
Array.forEach(iterable, fn, bind);
} else {
for (var name in iterable) fn.call(bind || iterable, iterable[name], name);
}
};
Array.prototype.test = Array.prototype.contains;
String.extend({
test: function(regex, params){
return (($type(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
},
camelCase: function(){
return this.replace(/-\D/g, function(match){
return match.charAt(1).toUpperCase();
});
},
hyphenate: function(){
return this.replace(/\w[A-Z]/g, function(match){
return (match.charAt(0) + '-' + match.charAt(1).toLowerCase());
});
},
capitalize: function(){
return this.replace(/\b[a-z]/g, function(match){
return match.toUpperCase();
});
},
rgbToHex: function(array){
var rgb = this.match(/\d{1,3}/g);
return (rgb) ? rgb.rgbToHex(array) : false;
},
contains: function(string, s){
return (s) ? (s + this + s).indexOf(s + string + s) > -1 : this.indexOf(string) > -1;
}
});
Array.extend({
rgbToHex: function(array){
if (this.length < 3) return false;
if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
var hex = [];
for (var i = 0; i < 3; i++){
var bit = (this[i] - 0).toString(16);
hex.push((bit.length == 1) ? '0' + bit : bit);
}
return array ? hex : '#' + hex.join('');
}
});
Function.extend({
create: function(options){
var fn = this;
options = $merge({
'bind': fn,
'event': false,
'arguments': null,
'delay': false,
'periodical': false
}, options);
if ($chk(options.arguments) && $type(options.arguments) != 'array') options.arguments = [options.arguments];
return function(event){
var args;
if (options.event){
event = event || window.event;
args = [(options.event === true) ? event : new options.event(event)];
if (options.arguments) args.extend(options.arguments);
}
else args = options.arguments || arguments;
var returns = function(){
return fn.apply($pick(options.bind, fn), args);
};
if (options.delay) return setTimeout(returns, options.delay);
if (options.periodical) return setInterval(returns, options.periodical);
return returns();
};
},
bind: function(bind, args){
return this.create({'bind': bind, 'arguments': args});
},
bindAsEventListener: function(bind, args){
return this.create({'bind': bind, 'event': true, 'arguments': args});
}
});
var Element = new Class({
initialize: function(el, props){
if ($type(el) == 'string'){
if (window.ie && props && (props.name || props.type)){
var name = (props.name) ? ' name="' + props.name + '"' : '';
var type = (props.type) ? ' type="' + props.type + '"' : '';
delete props.name;
delete props.type;
el = '<' + el + name + type + '>';
}
el = document.createElement(el);
}
el = $(el);
return (!props || !el) ? el : el.set(props);
}
});
var Elements = new Class({
initialize: function(elements){
return (elements) ? $extend(elements, this) : this;
}
});
Elements.extend = function(props){
for (var prop in props){
this.prototype[prop] = props[prop];
this[prop] = $native.generic(prop);
}
};
function $(el){
if (!el) return null;
if (el.htmlElement) return Garbage.collect(el);
if ([window, document].contains(el)) return el;
var type = $type(el);
if (type == 'string'){
el = document.getElementById(el);
type = (el) ? 'element' : false;
}
if (type != 'element') return null;
if (el.htmlElement) return Garbage.collect(el);
if (['object', 'embed'].contains(el.tagName.toLowerCase())) return el;
$extend(el, Element.prototype);
el.htmlElement = function(){};
return Garbage.collect(el);
};
function $$(){
var elements = [];
for (var i = 0, j = arguments.length; i < j; i++){
var selector = arguments[i];
switch($type(selector)){
case 'element': elements.push(selector);
case 'boolean': break;
case false: break;
case 'string': selector = document.getElementsByTagName(selector, true);
default: elements.extend(selector);
}
}
return $$.unique(elements);
};
$$.unique = function(array){
var elements = [];
for (var i = 0, l = array.length; i < l; i++){
if (array[i].$included) continue;
var element = $(array[i]);
if (element && !element.$included){
element.$included = true;
elements.push(element);
}
}
for (var n = 0, d = elements.length; n < d; n++) elements[n].$included = null;
return new Elements(elements);
};
Elements.Multi = function(property){
return function(){
var args = arguments;
var items = [];
var elements = true;
for (var i = 0, j = this.length, returns; i < j; i++){
returns = this[i][property].apply(this[i], args);
if ($type(returns) != 'element') elements = false;
items.push(returns);
};
return (elements) ? $$.unique(items) : items;
};
};
Element.extend = function(properties){
for (var property in properties){
HTMLElement.prototype[property] = properties[property];
Element.prototype[property] = properties[property];
Element[property] = $native.generic(property);
var elementsProperty = (Array.prototype[property]) ? property + 'Elements' : property;
Elements.prototype[elementsProperty] = Elements.Multi(property);
}
};
Element.extend({
set: function(props){
for (var prop in props){
var val = props[prop];
switch(prop){
case 'styles': this.setStyles(val); break;
case 'properties': Element.setMany(this, 'setProperty', val); break;
default: this.setProperty(prop, val);
}
}
return this;
},
setStyle: function(property, value){
switch(property){
case 'opacity': return this.setOpacity(parseFloat(value));
case 'float': property = (window.ie) ? 'styleFloat' : 'cssFloat';
}
property = property.camelCase();
switch($type(value)){
case 'number': if (!['zIndex', 'zoom'].contains(property)) value += 'px'; break;
case 'array': value = 'rgb(' + value.join(',') + ')';
}
this.style[property] = value;
return this;
},
setStyles: function(source){
switch($type(source)){
case 'object': Element.setMany(this, 'setStyle', source); break;
case 'string': this.style.cssText = source;
}
return this;
},
setOpacity: function(opacity){
if (opacity == 0){
if (this.style.visibility != "hidden") this.style.visibility = "hidden";
} else {
if (this.style.visibility != "visible") this.style.visibility = "visible";
}
if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
if (window.ie) this.style.filter = (opacity == 1) ? '' : "alpha(opacity=" + opacity * 100 + ")";
this.style.opacity = this.$tmp.opacity = opacity;
return this;
},
getStyle: function(property){
property = property.camelCase();
var result = this.style[property];
if (!$chk(result)){
if (property == 'opacity') return this.$tmp.opacity;
result = [];
for (var style in Element.Styles){
if (property == style){
Element.Styles[style].each(function(s){
var style = this.getStyle(s);
result.push(parseInt(style) ? style : '0px');
}, this);
if (property == 'border'){
var every = result.every(function(bit){
return (bit == result[0]);
});
return (every) ? result[0] : false;
}
return result.join(' ');
}
}
if (property.contains('border')){
if (Element.Styles.border.contains(property)){
return ['Width', 'Style', 'Color'].map(function(p){
return this.getStyle(property + p);
}, this).join(' ');
} else if (Element.borderShort.contains(property)){
return ['Top', 'Right', 'Bottom', 'Left'].map(function(p){
return this.getStyle('border' + p + property.replace('border', ''));
}, this).join(' ');
}
}
if (document.defaultView) result = document.defaultView.getComputedStyle(this, null).getPropertyValue(property.hyphenate());
else if (this.currentStyle) result = this.currentStyle[property];
}
if (window.ie) result = Element.fixStyle(property, result, this);
if (result && property.test(/color/i) && result.contains('rgb')){
return result.split('rgb').splice(1,4).map(function(color){
return color.rgbToHex();
}).join(' ');
}
return result;
},
setProperty: function(property, value){
var index = Element.Properties[property];
if (index) this[index] = value;
else this.setAttribute(property, value);
return this;
}
});
Element.fixStyle = function(property, result, element){
if ($chk(parseInt(result))) return result;
if (['height', 'width'].contains(property)){
var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'];
var size = 0;
values.each(function(value){
size += parseInt(element.getStyle('border-' + value + '-width'),10) + parseInt(element.getStyle('padding-' + value),10);
});
return element['offset' + property.capitalize()] - size + 'px';
} else if (property.test(/border(.+)Width|margin|padding/)){
return '0px';
}
return result;
};
Element.Styles = {'border': [], 'padding': [], 'margin': []};
['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
for (var style in Element.Styles) Element.Styles[style].push(style + direction);
});
Element.borderShort = ['borderWidth', 'borderStyle', 'borderColor'];
Element.setMany = function(el, method, pairs){
for (var key in pairs) el[method](key, pairs[key]);
return el;
};
Element.Properties = new Abstract({
'class': 'className', 'for': 'htmlFor', 'colspan': 'colSpan', 'rowspan': 'rowSpan',
'accesskey': 'accessKey', 'tabindex': 'tabIndex', 'maxlength': 'maxLength',
'readonly': 'readOnly', 'frameborder': 'frameBorder', 'value': 'value',
'disabled': 'disabled', 'checked': 'checked', 'multiple': 'multiple', 'selected': 'selected'
});
Element.PropertiesIFlag = {
'href': 2, 'src': 2
};
var Garbage = {
elements: [],
collect: function(el){
if (!el.$tmp){
Garbage.elements.push(el);
el.$tmp = {'opacity': 1};
}
return el;
},
trash: function(elements){
for (var i = 0, j = elements.length, el; i < j; i++){
if (!(el = elements[i]) || !el.$tmp) continue;
for (var p in el.$tmp) el.$tmp[p] = null;
for (var d in Element.prototype) el[d] = null;
Garbage.elements[Garbage.elements.indexOf(el)] = null;
el.htmlElement = el.$tmp = el = null;
}
}
};
var Event = new Class({
initialize: function(event){
if (event && event.$extended) return event;
this.$extended = true;
event = event || window.event;
this.event = event;
this.type = event.type;
this.target = event.target || event.srcElement;
if (this.target.nodeType == 3) this.target = this.target.parentNode;
this.shift = event.shiftKey;
this.control = event.ctrlKey;
this.alt = event.altKey;
this.meta = event.metaKey;
if (['DOMMouseScroll'].contains(this.type)){
this.wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
} else if (this.type.contains('key')){
this.code = event.which || event.keyCode;
for (var name in Event.keys){
if (Event.keys[name] == this.code){
this.key = name;
break;
}
}
if (this.type == 'keydown'){
var fKey = this.code - 111;
if (fKey > 0 && fKey < 13) this.key = 'f' + fKey;
}
this.key = this.key || String.fromCharCode(this.code).toLowerCase();
} else if (this.type.test(/(click|mouse|menu)/)){
this.page = {
'x': event.pageX || event.clientX + document.documentElement.scrollLeft,
'y': event.pageY || event.clientY + document.documentElement.scrollTop
};
this.client = {
'x': event.pageX ? event.pageX - window.pageXOffset : event.clientX,
'y': event.pageY ? event.pageY - window.pageYOffset : event.clientY
};
this.rightClick = (event.which == 3) || (event.button == 2);
switch(this.type){
case 'mouseover': this.relatedTarget = event.relatedTarget || event.fromElement; break;
case 'mouseout': this.relatedTarget = event.relatedTarget || event.toElement;
}
if(window.gecko)Event.fix.relatedTargetGecko();
else            Event.fix.relatedTarget();
}
return this;
},
stop: function(){
return this.stopPropagation().preventDefault();
},
stopPropagation: function(){
if (this.event.stopPropagation) this.event.stopPropagation();
else this.event.cancelBubble = true;
return this;
},
preventDefault: function(){
if (this.event.preventDefault) this.event.preventDefault();
else this.event.returnValue = false;
return this;
}
});
Event.fix = {
relatedTarget: function(){
if (this.relatedTarget && this.relatedTarget.nodeType == 3) this.relatedTarget = this.relatedTarget.parentNode;
},
relatedTargetGecko: function(){
try {Event.fix.relatedTarget.call(this);} catch(e){this.relatedTarget = this.target;}
}
};
