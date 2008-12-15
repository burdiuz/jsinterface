//---------------------------------------------------------------------------------------------------- ������� ������
/** C������� ��������-������ ����������� ��������� �������������� �������� */
JSI = function(){};
JSIHost = {};
JSI.first;
JSI.count = 0;
/** ������� ��� ����������� ����������� ������� */
JSI.name = '__jsi_';
/** ������ ����������� ������� */
JSI.index = 0;
/** ������ �������� ������� ������� window, ������� ����� ������� ��� ������������� ������� */
JSI.isInstalled = false;
JSI.installedEventList = ['onJSIInstalled', 'onjsiinstalled'];
//---------------------------------------------------------------------------------------------------- JSI PUBLIC
//---------------------------------------------------------------------------------------------------- JSI STATIC
/** ������� ��������� ������. ���������� ������ �� ����. 
 * 
 * @param {String} id
 * @param {String} url
 * @return {String}
 */
JSI.create = function(id, url){
	var nm = id ? id : JSI.name+String(JSI.index++);
	var o = new JSIMain(id, url, nm);
	if(!JSI.first){
		JSI.first = o;
	};
	JSIHost[nm] = o;
	JSI.count++;
	return nm;
};
/** �������� ��������� ������� �� ��� ������ 
 * 
 * @param {String} n
 * @return {JSIMain}
 */
JSI.get = function(n){
	var r;
	if(n){
		r = JSIHost[n];
	}else if(JSI.count==1){
		r = JSI.first;
	};
	return r;
};
/** ��������� ������� ����� JS 
 * 
 * @param {String} n
 * @param {Boolean} c ��������� �� ������������� �������� ��������(������� ������)
 */
JSI.clear = function(n, c, o){
	JSIHost[n].clear(c, o);
};
/** ���������� ������ �� ������ document. ��� ����������� ���������, ���� ��������� ���������� �������� ������������ �ExternalInterface �� ����� ���� JavaScript injection(����������, ���� �������� ���� �� ������ 255) 
 * 
 * @return {HTMLDocument}
 */
JSI.d = function(){
	var d;
	try{
		d = window['document'];
	}catch(e){
		d = null;
	};
	return d;
};
/** ���������, �������� �� ������ document
 * 
 * @return {Boolean}
 */
JSI.hasDocument = function(){
	return Boolean(JSI.d());
};
/** ���������, ��, ������ � ���� ����� ���������, ��� �� ������� �������
 * 
 * @return {Boolean}
 */
JSI.isIE = function(){
	return (navigator.appName.indexOf('Microsoft')>=0);
};
/** ������ ����������� ������ */
JSI.onInstalled = function(){
	if(!JSI.isInstalled){
		var len = JSI.installedEventList.length;
		for(var i=0; i<len; i++){
			var e = JSI.installedEventList[i];
			if(typeof window[e]=='function'){
				window[e]();
			};
		};
		JSI.isInstalled = true;
	};
};
//----------------------------- ��������� �������
/** �������� ������ �� ������ document. 
 * 
 * @param {String} jn
 * @return {String}
 */
JSI.getDocumentLink = function(jn){
	return JSIHost[jn].getInfo(JSI.hasDocument() ? JSI.d() : null);
};
/** �������� ������ �� ������ window.
 * 
 * @param {String} jn
 * @return {String}
 */
JSI.getWindowLink = function(jn){
	return JSIHost[jn].getInfo(window);
};
/** �������� ������ �� ������ navigator. 
 * 
 * @param {String} jn
 * @return {String}
 */
JSI.getNavigatorLink = function(jn){
	return JSIHost[jn].getInfo(navigator);
};
/** �������� ������ �� ������ ���� ������. 
 * 
 * @param {String} jn
 * @return {String}
 */
JSI.getMainLink = function(jn){
	var j = JSIHost[jn];
	var m = j.main;
	return j.getInfo(m);
};
/** �������� ������ �� ������ �������. 
 * 
 * @param {String} jn
 * @return {String}
 */
JSI.getEventLink = function(jn){
	var j = JSIHost[jn];
	return j.getInfo(event);
};
//----------------------------- �����
/** �������� info ������ �� �������� 
 * 
 * @param {String} jn
 * @param {Object} val
 * @return {Object}
 */
JSI.getInfo = function(jn, vn){
	var val = JSI.eval(vn);
	return {value:JSIHost[jn].getInfo(val)};
};
/** 
 * @private
 */
JSI.tryGetInfo = function(jn, vn){
	var o;
	try{
		o = JSI.getInfo(jn, vn);
	}catch(e){
		o = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, vn)};
	};
	return o;
};
/** ������ �������� eval, �.�. ���������� ������� eval �������� ������ � FireFox'�
 * "function eval must be called directly, and not by way of a function of another name", 
 * � � ����� ��� �������� ��������� � ����������� ����������� ��������� �������.
 * 
 * @param {String} n ���, ������� ����� ���������. � �������� ����� ������� ���� � �������� �������.
 */
JSI.eval = function(n){
	var f = new Function('return '+n+';');
	return f();
};
/** �������� ������ info �������� �� ��������, � ��������� JSI ������� 
 * 
 * @param {JSIMain} j
 * @param {Array} args
 * @return {Array}
 */
JSI.convertListToInfoIn = function(j, args){
	var ret = [];
	if(args){
		var len = args.length;
		for(var i=0; i<len; i++){
			ret[i] = j.getInfo(args[i]);
		};
	};
	return ret;
};
/** �������� �������� �� info ������� 
 * 
 * @param {String} jn
 * @param {Object} info
 * @return {Object}
 */
JSI.getValue = function(jn, o){
	var r;
	if(o instanceof Object){
		r = JSI.getValueIn(JSIHost[jn], o);
	}else{
		r = o;
	};
	return r;
};
/** �������� �������� �� info �������, � ��������� JSI ������� 
 * 
 * @param {JSIMain} j
 * @param {Object} info
 * @return {Object}
 */
JSI.getValueIn = function(j, o){
	var r;
	if(o instanceof Object && o.constructor==Object){
		if(o.isComplex){
			r = JSI.getComplexValueIn(j, o);
		}else{
			r = JSI.getSimpleValueIn(j, o);
		};
	}else{
		r = o;
	};
	return r;
};
/** �������� �������� ������������ ����
 * @private
 * @param {Object} j
 * @param {Object} o
 */
JSI.getComplexValueIn = function(j, o){
	var r;
	if(o.side=='JS'){
		if(o.type=='function'){
			r = j.funcs.getItem(o.value);
		}else{
			r = j.objects.getItem(o.value);
		};
	}else{
		if(o.type=='function'){
			r = j.callbacks.getItemByInfo(o);
		}else{
			r = new FLObject(j, o);
		};
	};
	return r;
};
/** �������� �������� �������� ����
 * @private
 * @param {Object} j
 * @param {Object} o
 */
JSI.getSimpleValueIn = function(j, o){
	var r;
	if(o.type=='array'){
		r = JSI.convertListToValueIn(j, o.value);
	}else if(o.type=='object'){
		r = JSI.convertObjectToValueIn(j, o.value);
	}else{
		r = o.value;
	};
	return r;
};
/** �������� �������� �� ������ info ��������, � ��������� JSI ������� 
 * 
 * @param {JSIMain} j
 * @param {Array} args
 * @return {Array}
 */
JSI.convertListToValueIn = function(j, args){
	var r = [];
	if(args){
		var len = args.length;
		for(var i=0; i<len; i++){
			r[i] = JSI.getValueIn(j, args[i]);
		};
	};
	return r;
};
/** �������� �������� �� �������������� �������(�������) info ��������, � ��������� JSI ������� 
 * 
 * @param {JSIMain} j
 * @param {Array} args
 * @return {Array}
 */
JSI.convertObjectToValueIn = function(j, obj){
	var r = {};
	if(obj){
		for(var p in obj){
			r[p] = JSI.getValueIn(j, obj[p]);
		};
	};
	return r;
};
//----------------------------- �������
/** �������� ������ �� ������ �� JSI � ������ �� ��������� ������ 
 * 
 * @param {String} jn
 * @param {String} nm
 * @return {Object}
 */
JSI.getObject = function(jn, nm){
	return JSIHost[jn].objects.getItem(nm);
};
/** ������� ��������� ������ 
 * 
 * @param {String} jn - ��� ���������� ����������
 * @param {String} args - ������ � �����������, ����� �������
 * @param {String} code - ��� �������
 * @return {Object}
 */
JSI.createFunction = function(jn, args, code){
	var j = JSIHost[jn];
	var func = JSI.eval('function('+args+'){'+code+'};');
	return {value:j.getInfo(func)};
};
/** 
 * @private
 */
JSI.tryCreateFunction = function(jn, args, code){
	var o;
	try{
		o = JSI.createFunction(jn, args, code);
	}catch(e){
		o = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, 'Function')};
	};
	return o;
};
/** ������� ��������� ������ 
 * 
 * @param {String} jn - ��� ���������� ����������
 * @param {String} cn - ��� ������ ������������ �������
 * @param {Array} args - ������ ���������� ������������ � �����������
 * @return {Object}
 */
JSI.createInstance = function(jn, cn, args){
	var j = JSIHost[jn];
	var cls = JSI.eval(cn);
	args = JSI.convertListToValueIn(j, args);
	return {value:j.getInfo(JSIInstance.create(cls, args))};
};
/** 
 * @private
 */
JSI.tryCreateInstance = function(jn, cn, args){
	var o;
	try{
		o = JSI.createInstance(jn, cn, args);
	}catch(e){
		o = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, cn)};
	};
	return o;
};
/** ������� ��������� ������ 
 * 
 * @param {String} jn - ��� ���������� ����������
 * @param {String} cn - ��� ������ ������������ �������
 * @param {Array} args - ������ ���������� ������������ � �����������
 * @return {Object}
 */
JSI.createInstanceByLink = function(jn, nm, t, args){
	var j = JSIHost[jn];
	var cls = (t=='function' ? j.funcs : j.objects).getItem(nm);
	args = JSI.convertListToValueIn(j, args);
	return {value:j.getInfo(JSIInstance.create(cls, args))};
};
/** 
 * @private
 */
JSI.tryCreateInstanceByLink = function(jn, nm, t, args){
	var o;
	try{
		o = JSI.createInstance(jn, nm, t, args);
	}catch(e){
		o = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, nm)};
	};
	return o;
};
/** ������� ������ �� ������
 * 
 * @param {String} jn
 * @param {String} nm
 */
JSI.removeObject = function(jn, nm){
	JSIHost[jn].objects.removeItem(nm);
};
/** ��������� ������������� ������ �� ������
 * 
 * @param {String} jn
 * @param {String} nm
 * @return {Boolean}
 */
JSI.isExistsObject = function(jn, nm){
	return JSIHost[jn].objects.isExists(nm);
};
//----------------------------- �������
/** �������� ������ ������� �� ������ 
 * 
 * @param {String} jn
 * @param {String} fn
 * @return {Function}
 */
JSI.getFunc = function(jn, fn){
	return JSIHost[jn].funcs.getItem(fn);
};
/** ������� ������ �� �������
 * 
 * @param {String} jn
 * @param {String} fn
 * @return {Boolean}
 */
JSI.removeFunc = function(jn, fn){
	return JSIHost[jn].funcs.removeItem(fn);
};
/** ��������� ������������� ������ �� �������
 * 
 * @param {String} jn
 * @param {String} fn
 * @return {Boolean}
 */
JSI.isExistsFunc = function(jn, fn){
	return JSIHost[jn].funcs.isExists(fn);
};
/** ��������� ������������ ������� ���������� �� ������ � ����������� �������� ����������� �������.
 * ���� ������� �� ���� ������� �� ������ ��������, �� ��� ����� ������� ����� ��� ��������, ���� ��� - ����� ������� ����� ������ �� �������
 * @param {String} jn
 * @param {String} fn
 * @param {String} pn
 * @return {Boolean}
 */
JSI.isCurrentFunc = function(jn, fn, pn){
	return JSIHost[jn].funcs.isCurrent(fn, pn);
};
/** ������� ������� �� ������ �� ��� �� ������� 
 * 
 * @param {String} jn
 * @param {String} fn
 * @param {String} pn
 * @param {Array} args
 * @return {Object}
 */
JSI.callFunction = function(jn, fn, pn, args){
	var j = JSIHost[jn];
	var f = j.funcs.getItemObject(fn);
	return {value:j.getInfo(JSI.__callFunction(j, f, fn, pn, JSI.convertListToValueIn(j, args)))};
};
/** 
 * @private
 */
JSI.tryCallFunction = function(jn, fn, pn, args){
	var r;
	try{
		r = JSI.callFunction(jn, fn, pn, args);
	}catch(e){
		var j = JSIHost[jn];
		var f = j.funcs.getItemObject(fn);
		r = {value:null, error:JSICallbacks.getErrorObject(j, e, pn, f.name)};
	};
	return r;
};
/** 
 * @private
 * @param {JSIMain} j
 * @param {Object} f
 * @param {String} fn
 * @param {String} pn
 * @param {Array} args
 * @return {Object}
 */
JSI.__callFunction = function(j, f, fn, pn, args){
	var val;
	if(pn){
		val = f.func.apply(j.objects.getItem(pn), args);
	}else{
		var p = f.parent;
		var n = f.name;
		if(p && n && j.funcs.isCurrent(fn, p)){
			val = JSIInstance.callMethod(j.objects.getItem(p), n, args);
		}else{
			val = JSIInstance.callFunction(f.func, args);
		};
	};
	return val;
};
/** �������� JS-�������, ������ ��������� ������� 
 * 
 * @param {String} jn
 * @param {String} cn
 * @return {Function}
 */
JSI.getCallback = function(jn, cn){
	var j = JSIHost[jn];
	return j.callbacks.getItem(cn);
};
/** ����� ������� callLater(obj, func, handler, time=1), ������� �������� func �� ��������, � ��������� ���������� � �������.
 * {String} jn ������ �� ������ JSIMain
 * {Object,String} nm ������ ��� ��� ������, � ������� ��������� ����������� �������
 * {String} hn ��� �������
 * {Array} a ������ ���������� �������
 * {String} cn ������ �� ������, � ������� ����� �������� ���������� ������ �������
 * {Number} t ������� ����� ������� ����� ��������� �������
 */
JSI.callLater = function(jn, nm, hn, a, cn, t){
	var j = JSIHost[jn];
	var f = JSI.__getCallLater(j);
	JSI.__callLater(f, j, nm, hn, a, cn);
	setTimeout(f, t);
};
/**
 * @private
 */
JSI.__callLater = function(f, j, nm, hn, a, cn){
	if(typeof nm == 'string'){
		nm = j.objects.getItem(nm);
	};
	f._o = nm;
	f._hn = hn;
	f._a = a;
	if(cn){
		f._c = j.callbacks.getItem(cn);
	};
};
/**
 * @private
 */
JSI.__getCallLater = function(j){
	var f = function(){
		var c = arguments.callee;
		var r = JSIInstance.callMethod(c._o,  c._hn, c._a);
		if (c._c){
			c._c(r);
		};
	};
	return f;
};
/** 
 * @private
 */
JSI.tryCallLater = function(jn, nm, hn, a, cn, t){
	var j = JSIHost[jn];
	var f = JSI.__tryGetCallLater(j);
	JSI.__callLater(f, j, nm, hn, a, cn);
	setTimeout(f, t);
};
/**
 * @private
 */
JSI.__tryGetCallLater = function(j){
	var f = function(){
		var c = arguments.callee;
		var r;
		try{
			r = JSIInstance.callMethod(c._o,  c._hn, c._a);
		}catch(e){
			c._j.callbacks.throwException(e, c._o, c._hn);
		};
		if (c._c){
			c._c(r);
		};
	};
	f._j = j;
	return f;
};
//----------------------------- ��������
/** �������� �������� 
 * 
 * @param {String} jn
 * @param {String} nm
 * @param {String} pn
 * @return {Object}
 */
JSI.getProperty = function(jn, nm, t, pn){
	var j = JSIHost[jn];
	var o = (t=='function' ? j.funcs : j.objects).getItem(nm);
	var r;
	if(pn in o){
		r = o[pn];
	};
	return {value:j.getInfo(r, nm, pn)};
};
/** 
 * @private
 */
JSI.tryGetProperty = function(jn, nm, t, pn){
	var r;
	try{
		r = JSI.getProperty(jn, nm, t, pn);
	}catch(e){
		r = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, nm, pn)};
	};
	return r;
};
/** ��������� ������������� �������� 
 * 
 * @param {String} jn
 * @param {String} nm
 * @param {String} pn
 * @return {Boolean}
 */
JSI.hasProperty = function(jn, nm, t, pn){
	var j = JSIHost[jn];
	var o = (t=='function' ? j.funcs : j.objects).getItem(nm);
	return {value:(pn in o)};
};
/** 
 * @private
 */
JSI.tryHasProperty = function(jn, nm, t, pn){
	var r;
	try{
		r = JSI.hasProperty(jn, nm, t, pn);
	}catch(e){
		r = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, nm, pn)};
	};
	return r;
};
/** ���������� �������� �������� 
 * 
 * @param {String} jn
 * @param {String} nm
 * @param {String} pn
 * @param {Object} info
 */
JSI.setProperty = function(jn, nm, t, pn, info){
	var j = JSIHost[jn];
	var o = (t=='function' ? j.funcs : j.objects).getItem(nm);
	o[pn] = JSI.getValueIn(j, info);
	return {value:null};
};
/** 
 * @private
 */
JSI.trySetProperty = function(jn, nm, t, pn, info){
	var r;
	try{
		r = JSI.setProperty(jn, nm, t, pn, info);
	}catch(e){
		r = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, nm, pn)};
	};
	return r;
};
/** ������� �������� 
 * 
 * @param {String} jn
 * @param {String} nm
 * @param {String} pn
 * @return {Boolean}
 */
JSI.deleteProperty = function(jn, nm, t, pn){
	var j = JSIHost[jn];
	var o = (t=='function' ? j.funcs : j.objects).getItem(nm);
	return {value:delete o[pn]};
};
/** 
 * @private
 */
JSI.tryDeleteProperty = function(jn, nm, t, pn){
	var r;
	try{
		r = JSI.deleteProperty(jn, nm, t, pn);
	}catch(e){
		r = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, nm, pn)};
	};
	return r;
};
/** ������� ��������, ��� ����� 
 * 
 * @param {String} jn
 * @param {String} nm
 * @param {String} hn
 * @param {Array} args
 * @return {Object}
 */
JSI.callProperty = function(jn, nm, t, hn, args){
	var j = JSIHost[jn];
	var o = (t=='function' ? j.funcs : j.objects).getItem(nm);
	var r;
	if(JSIFunctions.isFunction(o[hn])){
		r = JSI.callPropertyAsFunc(j, o, hn, args);
	}else{
		r = j.getInfo(o[hn], nm, hn);
	};
	return {value:r};
};
/** 
 * @private
 */
JSI.tryCallProperty = function(jn, nm, t, hn, args){
	var r;
	try{
		r = JSI.callProperty(jn, nm, t, hn, args);
	}catch(e){
		r = {value:null, error:JSICallbacks.getErrorObject(JSIHost[jn], e, nm, hn)};
	};
	return r;
};
/** ������� ����� �� ������ �� ������ 
 * 
 * @param {JSIMain} j
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 * @return {Object}
 */
JSI.callPropertyAsFunc = function(j, o, hn, args){
	args = JSI.convertListToValueIn(j, args);
	return j.getInfo(JSIInstance.callMethod(o, hn, args));
};
/** ��������� �������� �������, ��������� ���������� � �������� � ������� ������� - ���, info 
 * 
 * @param {Object} jn
 * @param {Object} nm
 * @param {Object} cn
 */
JSI.forEach = function(jn, nm, cn){
	var j = JSIHost[jn];
	var o = j.objects.getItem(nm);
	var fem = JSICallbacks.forEachMethod;
	var m = j.main;
	for(var p in o){
		m[fem](cn, p, j.getInfo(o[p]));
	};
};
/** �������� ������ ��������� ������� �������, �� ������ 
 * 
 * @param {String} jn
 * @param {String} nm
 * @return {Array}
 */
JSI.getPropertyList = function(jn, nm){
	var j = JSIHost[jn];
	var o = j.objects.getItem(nm);
	var list = [];
	for(var p in o){
		list.push(p);
	};
	return list;
};
//---------------------------------------------------------------------------------------------------- ��������� ������ �� ������ ������ ��� ���������
/** O����� ��� ������ ���� �������� � ���������. */
JSIElement = function(){};
JSIElement.noIENodeName = 'embed';
//---------------------------------------------------------------------------------------------------- JSIElement PUBLIC
//---------------------------------------------------------------------------------------------------- JSIElement STATIC
/** �������� object/embed ������� DOM ��������� �� ��� ID ��� URL 
 * 
 * @param {String} id
 * @param {String} url
 * @return {HTMLElement}
 */
JSIElement.get = function(id, url){
	var r;
	if(id){
		var d = JSI.d();
		r = JSI.isIE() ? d[id] : JSIElement.getNOIE(d, id);
		if(!r){
			r = d.getElementById(id);
		};
	};
	if(!r){
		r = JSIElement.find(url);
	};
	return r;
};
/**
 * @private
 * @param {Object} d
 * @param {Object} id
 */
JSIElement.getNOIE = function(d, id){
	var n = 'embed';
	var d = JSI.d();
	var r = JSIElement.getEmbed(window[id]);
	if(!r){
		r = JSIElement.getEmbed(d[id]);
	};
	if(!r){
		r = JSIElement.getEmbed(d.all[id]);
	};
	return r;
};
/**
 * @private
 * @param {Object} node
 */
JSIElement.isEmbed = function(node){
	if(node instanceof HTMLElement && node.nodeName.toLowerCase()==JSIElement.noIENodeName){
		return true;
	}else{
		return false;
	};
};
/**
 * @private
 * @param {Object} v
 */
JSIElement.getEmbed = function(v){
	var r;
	if(v){
		if(JSIElement.isEmbed(v)){
			r = v;
		}else if('length' in v){
			var l = v.length;
			for(var i=0; i<l; i++){
				if(JSIElement.isEmbed(v[i])){
					r = v[i];
					break;
				};
			};
		};
	};
	return r;
};
/** ����� ������� �� ��� URL 
 * 
 * @param {String} url
 * @return {HTMLElement}
 */
JSIElement.find = function(url){
	if(JSI.isIE()){
		return JSIElement.findIE(url);
	}else{
		return JSIElement.findNOIE(url);
	};
};
/** ���� ������� � ������, ���� ������� IE 
 * 
 * @param {String} url
 * @return {HTMLElement}
 */
JSIElement.findIE = function(url){
	var r;
	var list = JSI.d().getElementsByTagName('object');
	var len = list.length;
	for(var i=0; i<len; i++){
		var o = list[i];
		if(JSIElement.findIEIsValid(o.childNodes, url)){
			r = o;
			break;
		};
	};
	if(!r){
		r = list[0];
	};
	return r;
};
/** ���� � ���������� ���� <object> �������� � ������ movie � ������� �������� URL �� ������������ 
 * 
 * @param {NodeList} list
 * @param {String} url
 * @return {Boolean}
 */
JSIElement.findIEIsValid = function(list, url){
	var len = list.length;
	for(var i=0; i<len; i++){
		var a = list[i].attributes;
		if(a.name.value=='movie'){
			if(a.value.value==url){
				return true;
			}else{
				return false;
			};
		};
	};
	return false;
};
/** ���� ������� <embed> � �������, ����� ������� ������� �� �������� IE 
 * 
 * @param {String} url
 * @return {HTMLElement}
 */
JSIElement.findNOIE = function(url){
	var r;
	var list = JSI.d().getElementsByTagName('embed');
	var len = list.length;
	for(var i=0; i<len; i++){
		var o = list[i];
		var a = o.attributes.src;
		if(a && a.value==url){
			r = o;
			break;
		};
	};
	if(!r){
		r = list[0];
	};
	return r;
};
//---------------------------------------------------------------------------------------------------- ��������� ������ �� ������ ������ ��� ���������
/** ������������ ������� ������ � ����� ����������� ��������� ���� � ���������. */
JSIBrowser = function(){};
//---------------------------------------------------------------------------------------------------- JSIBrowser PUBLIC
//---------------------------------------------------------------------------------------------------- JSIBrowser STATIC
/** ��������� � ��������� ���� <head><title></title></head> ��� �������������� ������� ��������� ����. ���� ��� Opera. */
JSIBrowser.presetTitle = function(){
	var d = JSI.d();
	var f = d.getElementsByTagName;
	if(d){
		if(!f.call(d,'head').length){
			d.appendChild(d.createElement('head'));
		};
		if(!f.call(d,'title').length){
			f.call(d,'head')[0].appendChild(d.createElement('title'));
		};
	};
};
/** �������� ��������� ��������� */
JSIBrowser.getTitle = function(){
	return JSI.hasDocument() ? JSI.d().title : '';
};
/** ������ ��������� ��������� 
 * 
 * @param {String} p
 */
JSIBrowser.setTitle = function(p){
	if(JSI.hasDocument()){
		JSI.d().title = p;
	};
};
/** �������� ������ ���� */
JSIBrowser.getStatus = function(){
	return window.status;
};
/** ������ ������ ���� 
 * 
 * @param {String} p
 */
JSIBrowser.setStatus = function(p){
	window.status = p;
};
/** �������� ������ ���� �� ��������� */
JSIBrowser.getDefaultStatus = function(){
	return window.defaultStatus;
};
/** ������ ������ ���� �� ��������� 
 * 
 * @param {String} p
 */
JSI.setDefaultStatus = function(p){
	window.defaultStatus = p;
};
/** �������� ������ ������ */
JSIBrowser.getLocation = function(){
	if(JSI.hasDocument()){
		return JSI.d().location.href;
	}else{
		return window.location.href;
	};
};
/** �������� ������ ������� ���� */
JSIBrowser.getTopLocation = function(){
	var p = window.top;
	if(JSI.hasDocument()){
		return p.document.location.href;
	}else{
		return p.location.href;
	};
};
/** �������� ��� �������� ������ */
JSIBrowser.getLocationHash = function(){
	if(JSI.hasDocument()){
		return JSI.d().location.hash;
	}else{
		return window.location.hash;
	};
};
/** ������ ��� �������� ������ 
 * 
 * @param {String} p
 */
JSIBrowser.setLocationHash = function(p){
	if(JSI.hasDocument()){
		JSI.d().location.hash = p;
	}else{
		window.location.hash = p;
	};
};
/** �������� ������ ���� */
JSIBrowser.getCookieString = function(){
	return JSI.d().cookie;
};
/** ������ ������ ���� 
 * 
 * @param {String} p
 */
JSIBrowser.setCookieString = function(p){
	JSI.d().cookie = p;
};
//---------------------------------------------------------------------------------------------------- �������� �����������
/** ������ ��������� ���������� �������� � �������� ������� ��� ����� �������� ��������� */
JSIInstance = function(){};
//---------------------------------------------------------------------------------------------------- JSIBrowser PUBLIC
//---------------------------------------------------------------------------------------------------- JSIBrowser STATIC
/** ����� �������� ���������� ������ � ����� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create = function(cls, args){
	var r;
	if(args){
		r = JSIInstance['create'+args.length](cls, args);
	}else{
		r = JSIInstance.create0(cls);
	};
	return r;
};
/** �������� ����� ��� ������������ ������ 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod = function(o, hn, args){
	var r;
	if(args){
		r = JSIInstance['callMethod'+args.length](o, hn, args);
	}else{
		r = JSIInstance.callMethod0(o, hn);
	};
	return r;
};
/** �������� ������� ��������, �� ����� � ������� ���������.
 * 
 * @param {Function} f
 * @param {Array} args
 */
JSIInstance.callFunction = function(f, args){
	var r;
	if(args){
		r = JSIInstance['callFunction'+args.length](f, args);
	}else{
		r = JSIInstance.callFunction0(f);
	};
	return r;
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create0 = function(cls, args){
	return new cls();
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create1 = function(cls, args){
	return new cls(args[0]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create2 = function(cls, args){
	return new cls(args[0], args[1]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create3 = function(cls, args){
	return new cls(args[0], args[1], args[2]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create4 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create5 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create6 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create7 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create8 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create9 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create10 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create11 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create12 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create13 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create14 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]);
};
/** ����� �������� ���������� ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} cls
 * @param {Array} args
 */
JSIInstance.create15 = function(cls, args){
	return new cls(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod0 = function(o, hn, args){
	return o[hn]();
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod1 = function(o, hn, args){
	return o[hn](args[0]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod2 = function(o, hn, args){
	return o[hn](args[0], args[1]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod3 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod4 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod5 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod6 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod7 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod8 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod9 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod10 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod11 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod12 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod13 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod14 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]);
};
/** �������� ����� ��� ������������ ������ � N-�� ���-��� ���������� 
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callMethod15 = function(o, hn, args){
	return o[hn](args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction0 = function(f, args){
	return f();
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction1 = function(f, args){
	return f(args[0]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction2 = function(f, args){
	return f(args[0], args[1]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction3 = function(f, args){
	return f(args[0], args[1], args[2]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction4 = function(f, args){
	return f(args[0], args[1], args[2], args[3]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction5 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction6 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction7 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction8 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction9 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction10 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction11 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction12 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction13 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction14 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13]);
};
/** �������� ������� � N-�� ���-��� ���������� �� ����� � ������� ���������
 * 
 * @param {Object} o
 * @param {String} hn
 * @param {Array} args
 */
JSIInstance.callFunction15 = function(f, args){
	return f(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13], args[14]);
};
//---------------------------------------------------------------------------------------------------- ������� ������ �������
/** ��������� ��� ���� �������. 
 * 
 * @param {String} i
 * @param {String} u
 * @param {String} n
 */
JSIMain = function(i, u, n){
	this.id = i;
	this.url = u;
	this.name = n;
	this.funcs = new JSIFunctions(this);
	this.objects = new JSIObjects(this);
	this.callbacks = new JSICallbacks(this);
	this.getDocProps();
};
/** ������� ��������� JSIMain */
JSI.mp = JSIMain.prototype;
/**
 * @private
 */
JSI.mp.getDocProps = function(){
	if(JSI.hasDocument()){
		this.tag = JSIMain.getTag();
		this.main = JSIElement.get(this.id, this.url);
	};
};
/** ������� ��� ��������� ������� */
JSIMain.ieBrowser = JSI.isIE();
/** ������ ���������� �������� �� ��������� ��������� ������� ����� ������. */
JSIMain.simple = {};
JSIMain.simple['number'] = true;
JSIMain.simple['string'] = true;
JSIMain.simple['boolean'] = true;
//---------------------------------------------------------------------------------------------------- JSIMain PUBLIC
/** ������� ��� ������������ ������
 * 
 * @param {Object} c - ������� Flash ��������
 * @param {Object} o - ������� Flash �������
 */
JSI.mp.clear = function(c, o){
	if(c){
		this.callbacks.clear();
	};
	if(o){
		this.objects.clear();
		this.funcs.clear();
	};
};
/** �������� ���������� ���������� � ��������. ���� ��������� ��������� �������� ������, �� ������ ����, � ������������ ������� ����� ���������� ������ �� ���� ������. 
 * @param {Object} val - �������� ��� �������� ���������� ����������
 * @param {String} p - ������ �� ������ �������� ��� �������� �������� *��� �������
 * @param {String} n - ��� ��������� � ������� ���������� �������� *��� �������
 * @return {Object}
*/
JSI.mp.getInfo = function(v, p, n){
	var o;
	if(v instanceof Object || typeof v == 'object'){
		if(v instanceof FLSimple){
			o = this.getSimpleInfo(v);
		}else if(v instanceof FLObject){
			o = v.info;
		}else{
			o = this.getComplexInfo(v, p, n);
		};
	}else{
		o = v;
	};
	return o;
};
/** �������� ���� � ������� ������� �� ������� �� ����.
 * 
 * @param {Object} v
 * @param {String} p
 * @param {String} n
 * @return {Object}
 */
JSI.mp.getComplexInfo = function(v, p, n){
	var o = JSIMain.__getInfo(v);
	if(o.isComplex){
		if(o.type=='function'){
			if('jsDynamicInfo' in v){
				return v.jsDynamicInfo;
			}else{
				o.value = this.funcs.addItem(v, p, n);
			};
		}else{
			o.value = this.objects.addItem(v);
		};
	};
	return o;
};
/** �������� ���� � ������� �������, �� ���� � �� ����������� ������ �� ������� ������, �� �� ����� ������� �� ������, ��� ����������.
 * 
 * @param {Object} v
 * @return {Object}
 */
JSI.mp.getSimpleInfo = function(v){
	var o = v.data;
	if(o instanceof Array){
		o = this.getSimpleArray(o);
	}else if(o instanceof Object){
		o = this.getSimpleObject(o);
	};
	return {value:o, type:JSIMain.getType(o), isComplex:false, side:'JS'};
};
/** �������� �������� ������� � ����������� � ������� �������� ����������� � ��, �������������� � ��������� �� ���� �����.
 * 
 * @param {Object} v
 * @return {Object}
 */
JSI.mp.getSimpleObject = function(v){
	var r = {};
	for(var p in v){
		r[p] = this.getInfo(v[p]);
	};
	return r;
};
/** �������� �������� ������� � ����������� � ������� �������� ����������� � ��, �������������� � ��������� �� ���� �����.
 * 
 * @param {Array} v
 * @return {Array}
 */
JSI.mp.getSimpleArray = function(v){
	var r = [];
	var l = v.length;
	for(var i=0; i<l; i++){
		r[i] = this.getInfo(v[i]);
	};
	return r;
};
/** �������� ������ � ����������� � ��������. 
 * @private
 * @param {Object} val
 * @return {Object}
 */
JSIMain.__getInfo = function(val){
	return {value:val, type:JSIMain.getType(val), isComplex:JSIMain.isComplex(val), side:'JS'};
};
/** �������� ��� �������� 
 * 
 * @param {Object} o
 * @return {String}
 */
JSIMain.getType = function(o){
	var t = typeof o;
	if(t == 'object'){
		if(o){
			if(o instanceof Array){
				t = 'array';
			}else if(JSIMain.ieBrowser){
				t = JSIMain.getIEString(o, t);
			};
		}else{
			t = 'void';
		};
	}else if(o.constructor==Object){
		t = 'object';
	};
	return t;
};
/** �������� ����������� ����������, ������ ��� ������� ��� �������.
 * � IE, ��������� ������� � �������� typeof ���������� "object", � ���� ������ ��� �������� ��������� ������� ����.
 * @param {Object} o
 * @param {String} t
 * @return {String}
 */
JSIMain.getIEString = function(o, t){
	if('toString' in o){
		var p = o.toString().indexOf('function');
		if(p>=0 && p<3){
			t = 'function';
		};
	};
	return t;
};
/** ��������� ������������ �� ���� �������� ��������� � �������� ��������� 
 * 
 * @param {Object} o
 * @return {Boolean}
 */
JSIMain.isComplex = function(o){
	return (!Boolean(!o || JSIMain.simple[typeof o]) || o instanceof Array);
};
//---------------------------------------------------------------------------------------------------- JSIMain STATIC
/** �������� ���, ������� ����� ����������� ��� ��������� ��� �����������, � �������� ������ �������, ��������� ����� 
 * @return {HTMLElement}
 */
JSIMain.getTag = function(){
	var d = JSI.d();
	var hd = d.getElementsByTagName('head')[0];
	if(!hd){
		hd = d.createElement('head');
		d.firstChild.appendChild(hd);
	};
	return hd;
};
//----------------------------------- ������ �������������� ������ �� JS ������� ������ ���� ������
/**
 * 
 * @param {Object} i
 */
JSIFunctions = function(i){
	this.jsi = i;
	this.index = 0;
	this.items = {};
};
/** ������� ��������� JSIFunctions */
JSI.fp = JSIFunctions.prototype;
/** ������� ����� ������ �� �������. ������ ������� �� �������� ����� � ������ ������. ������ ������ ���������. */
JSIFunctions.base = 'func_';
//---------------------------------------------------------------------------------------------------- JSIFunctions PUBLIC
/** ���������, ������� ���� ������� ��������������� �� ������� ��� �� ������.
 * @param {Function} fn - �������
 * @param {String} pn - ������ �� ������ � ������� ���������� �������
 * @param {String} nm - ��� �������� � ������� ���������� �������
 * @return {String} 
*/
JSI.fp.addItem = function(fn, pn, nm){
	var n = this.findItem(fn, pn, nm);
	if(!n){
		n = JSIFunctions.base+String(this.index++);
		this.items[n] = {func:fn, parent:pn, name:nm};	
	};
	return n;
};
/** �������� ������� �� ������
 * 
 * @param {Function} fn ������ �� �������
 * @param {String} pn ������ �� ������ ���������
 * @param {String} nm ��� ��������, � ������� ����������� �������.
 */
JSI.fp.findItem = function(fn, pn, nm){
	for(var p in this.items){
		var o = this.items[p];
		if(o.func==fn && o.parent==pn && o.name==nm){
			return p;
		};
	};
	return '';
};
/** �������� ������� � ��������� �������
 * 
 * @param {Function} fn
 * @param {Object} pt ������ � ������� ����������� �������
 * @param {String} nm
 */
JSI.fp.addItemByTarget = function(fn, pt, nm){
	return this.addItem(fn, this.jsi.objects.addItem(pt), nm);
};
/** �������� ������� �� ������. 
 * 
 * @param {String} n
 * @return {Function}
 */
JSI.fp.getItem = function(n){
	var o = this.items[n];
	if(o){
		return o.func;
	}else{
		return null;
	};
};
/** �������� ������ ������� �� ������. 
 * 
 * @param {String} n
 * @return {Object}
 */
JSI.fp.getItemObject = function(n){
	return this.items[n];
};
/** ������� ������ �� ������� 
 * 
 * @param {String} n
 */
JSI.fp.removeItem = function(n){
	delete this.items[n];
};
/** ������� ��� ������ �� ������� */
JSI.fp.clear = function(){
	for(var p in this.items){
		delete this.items[p];
	};
};
/** ��������� ������������� ������ 
 * 
 * @param {String} n
 * @return {Boolean}
 */
JSI.fp.isExists = function(n){
	return Boolean(this.items[n]);
};
/**
 * 
 * @param {String} fn
 * @param {Object} pt
 * @return {Boolean}
 */
JSI.fp.isCurrentByTarget = function(fn, pt){
	return this.isCurrent(fn, this.jsi.objects.addItem(pt));
};
/**
 * 
 * @param {String} fn
 * @param {String} pn
 * @return {Boolean}
 */
JSI.fp.isCurrent = function(fn, pn){
	var jo = this.jsi.objects;
	var o = this.getItem(fn);
	var p = jo.getItem(o.parent);
	var t = jo.getItem(pn);
	if(p===t && t[o.name]===o.func){
		return true;
	}else{
		return false;
	};
};
//---------------------------------------------------------------------------------------------------- JSIFunctions STATIC
/** ���������, �� �������� �� ������ ������� 
 * 
 * @param {Object} o
 * @return {Boolean}
 */
JSIFunctions.isFunction = function(o){
	if(o){
		var t = typeof o;
		if(t=='function'){
			return true;
		}else if(JSIMain.ieBrowser && t=='object'){
			var pos = String(o).indexOf('function');
			if(pos>=0 && pos<3){
				return true;
			};
		};
	};
	return false;
};
//----------------------------------- ������ �������������� ������ �� JS ������� ������ ���� ������
/**  
 * 
 * @param {JSIMain} i
 */
JSIObjects = function(i){
	this.jsi = i;
	this.index = 0;
	this.items = {};
};
/** ������� ��������� JSIObjects */
JSI.op = JSIObjects.prototype;
/** ������� ����� ������ �� ������. ������ ������� �� �������� ����� � ������ ������. ������ ������ ���������. */
JSIObjects.base = 'obj_';
//---------------------------------------------------------------------------------------------------- JSIObjects PUBLIC
/** ���������� ������ �� ������. ���� ������ ��� ����� ������� ��� �������, �� ��� ����� ����������. 
 * 
 * @param {Object} o
 */
JSI.op.addItem = function(o){
	for(var p in this.items){
		if(this.items[p]===o){
			return p;
		};
	};
	var name = JSIObjects.base+String(this.index++);
	this.items[name] = o;
	return name;
};
/** �������� ������ �� ������. 
 * 
 * @param {String} n
 */
JSI.op.getItem = function(n){
	return this.items[n];
};
/** �������� ��� �������� �� ������ 
 * 
 * @param {String} n
 */
JSI.op.getItemType = function(n){
	return typeof this.items[n];
};
/** ������� ������ �� ������ 
 * 
 * @param {String} n
 */
JSI.op.removeItem = function(n){
	delete this.items[n];
};
/** ������� ��� ������ �� ������� */
JSI.op.clear = function(){
	for(var p in this.items){
		delete this.items[p];
	};
};
/** ��������� ������������� ������ 
 * 
 * @param {String} n
 */
JSI.op.isExists = function(n){
	return Boolean(this.items[n]);
};
//---------------------------------------------------------------------------------------------------- JSIObjects STATIC
//----------------------------------- ������ �������������� ��������
/** ������ ������ ������� ������ ����������� �������� ������ �������� �� �������, ����� ������� ��� �������� ������� */
JSICallbacks = function(i){
	this.objects = {};
	this.jsi = i;
};
/** ������� ��������� JSICallbacks */
JSI.cp = JSICallbacks.prototype;
JSICallbacks.getJSINameMethod = 'getJSIName';
JSICallbacks.forEachMethod = 'jsiCaller_ForEachMethod';
JSICallbacks.callbackMethod = 'jsiCaller_CallMethod';
JSICallbacks.exceptionMethod = 'jsiCaller_ThrowException';
JSICallbacks.objectCreateMethod = 'jsiCaller_Object_CreateMethod';
JSICallbacks.objectInstanceMethod = 'jsiCaller_Object_InstanceMethod';
JSICallbacks.objectCallMethod = 'jsiCaller_Object_CallMethod';
JSICallbacks.objectCallCommand = 'jsiCaller_Object_CallCommand';
JSICallbacks.objectHasMethod = 'jsiCaller_Object_HasMethod';
JSICallbacks.objectGetMethod = 'jsiCaller_Object_GetMethod';
JSICallbacks.objectSetMethod = 'jsiCaller_Object_SetMethod';
JSICallbacks.objectDeleteMethod = 'jsiCaller_Object_DeleteMethod';
JSICallbacks.objectRemoveMethod = 'jsiCaller_Object_RemoveMethod';
JSICallbacks.objectsClear = 'jsiCaller_Objects_Clear';
//---------------------------------------------------------------------------------------------------- JSICallbacks PUBLIC
/** ��������� ������� ��������� ������
 * 
 * @param {String} cn Callback name
 * @param {String} on Object link value
 * @param {String} hn Handler function name
*/
JSI.cp.addItem = function(cn, on, hn){
	var obj = this.jsi.objects.getItem(on);
	if(cn){
		obj[hn] = this.getItem(cn);
	}else{
		delete obj[hn];
	};
};
/** ������ ������� ��������� ������, ���������� ������ document 
 * @private
 * @param {String} cn
 */
JSI.cp.getItem = function(cn){
	if(cn){
		return JSICallbacks.getHandler(this.jsi, cn);
	}else{
		return null;
	};
};
/** ������ ������� ��������� ������, �������� ������ �� info ������
 * 
 * @param {String} cn
 */
JSI.cp.getItemByInfo = function(info){
	var f = this.getItem(info.value);
	if(f){
		f.jsDynamicInfo = info;
	};
	return f;
};
/** ������� ������� ��������� ������ 
 * 
 * @param {String} on
 * @param {String} hn
 */
JSI.cp.removeItem = function(on, hn){
	var obj = this.jsi.objects.getItem(on);
	obj[hn] = null;
	delete obj[hn];
};
JSI.cp.clear = function(){
	for(var p in this.objects){
		delete this.objects[p];
	};
};
/** ���������� ���������� � ������ �� ���� �����
 * 
 * @param {Error} e ������ ������������ ������
 * @param {Object,String} nm ����� �� ������ ��� ��� ������ ��� ��������� �������� �������� ��������� ������
 * @param {String} pn ��� �������� ��� ��������� �������� ��������� ������
*/
JSI.cp.throwException = function(e, nm, pn){
	var m = this.jsi.main;
	m[JSICallbacks.exceptionMethod](JSICallbacks.getErrorObject(this.jsi, e, nm, pn));
};
//--------------------------------------------- For FLObject
/** �������� ������ ������ �� ���� ������ �� ��� ������.
 * 
 * @param {Object} on ������ �� ���� ������
 */
JSI.cp.addObject = function(on){
	var obj = this.getObject(on);
	if(!obj){
		obj = new FLObject(this.jsi, on);
		this.objects[on] = obj;
	};
};
/** �������� ������������� ������ ������ �� ������ �� ���� ������, ���� �� ����.
 * 
 * @param {Object} on
 */
JSI.cp.getObject = function(on){
	return this.objects[on];
};
/** ������� ������ ������ �� ������ �� ���� ������
 * 
 * @param {Object} on
 */
JSI.cp.removeObject = function(on){
	delete this.objects[on];
};
/** ������� ���� ������
 * 
 * @param {String} cn
 * @param {Array} a
 */
JSI.cp.createObject = function(cn, a){
	var r = this.jsi.main[JSICallbacks.objectCreateMethod](cn, JSI.convertListToInfoIn(this.jsi, a));
	return this.getReturnedValue(r);
};
/** �������� ������������ ���� ������ ����� ����(�������� �������)
 * 
 * @param {Object} p
 */
JSI.cp.instanceObject = function(p, t){
	if(t && t instanceof FLObject){
		t = t.info;
	};
	var r = this.jsi.main[JSICallbacks.objectInstanceMethod](p, t);
	return this.getReturnedValue(r);
};
/** ������� ������ �� ����� ������
 * 
 * @param {Object} p
 */
JSI.cp.removeObject = function(p){
	this.jsi.main[JSICallbacks.objectRemoveMethod](p);
};
/** ��������� ���� ������ ���� ��������
 * 
 * @param {Object} c - ������� JavaScript ��������
 * @param {Object} o - ������� JavaScript �������
 */
JSI.cp.objectsClear = function(c, o){
	this.jsi.main[JSICallbacks.objectsClear](c, o);
};
/** ������� ��������/����� �������
 * 
 * @param {String} nm
 * @param {String} pn
 * @param {Array} a
 * @param {String} u
 */
JSI.cp.callProperty = function(nm, pn, a, u){
	var r = this.jsi.main[JSICallbacks.objectCallMethod](nm, pn, JSI.convertListToInfoIn(this.jsi, a), u);
	return this.getReturnedValue(r);
};
/** ������� �������, ����������� �� ���� ������
 * 
 * @param {String} nm
 * @param {String} cn
 * @param {Array} a
 */
JSI.cp.callCommand = function(nm, cn, a){
	if(!a){
		a = [];
	};
	if(!(a instanceof Array)){
		a  [a];
	};
	var r = this.jsi.main[JSICallbacks.objectCallCommand](nm, cn, JSI.convertListToInfoIn(this.jsi, a));
	return this.getReturnedValue(r);
};
/** ��������� ������������� �������� � ���� �������
 * 
 * @param {String} nm
 * @param {String} pn
 * @param {String} u
 */
JSI.cp.hasProperty = function(nm, pn, u){
	var r = this.jsi.main[JSICallbacks.objectHasMethod](nm, pn, u);
	return this.getReturnedValue(r);
};
/** �������� �������� � �������� ���� �������
 * 
 * @param {String} nm
 * @param {String} pn
 * @param {String} u
 */
JSI.cp.getProperty = function(nm, pn, u){
	var r = this.jsi.main[JSICallbacks.objectGetMethod](nm, pn, u);
	return this.getReturnedValue(r);
};
/** ���������� �������� �������� ���� �������
 * 
 * @param {String} nm
 * @param {String} pn
 * @param {Object} v
 * @param {String} u
 */
JSI.cp.setProperty = function(nm, pn, v, u){
	var r = this.jsi.main[JSICallbacks.objectSetMethod](nm, pn, this.jsi.getInfo(v), u);
	return this.getReturnedValue(r);
};
/** ������� �������� ���� �������
 * 
 * @param {String} nm
 * @param {String} pn
 * @param {String} u
 */
JSI.cp.deleteProperty = function(nm, pn, u){
	var r = this.jsi.main[JSICallbacks.objectDeleteMethod](nm, pn, u);
	return this.getReturnedValue(r);
};
/** ������� ���������� ���������� �� ���� ������
 * 
 * @param {Object} o
 */
JSI.cp.throwObjectError = function(o){
	var e = new Error(o.message);
	e.flId = o.id;
	e.flDef = o.def;
	e.flName = o.name;
	e.flStackTrace = o.stackTrace;
	throw e;
};
/** ��������� ���������� �������� �� ���� ������.
 * 
 * @param {Object} r
 */
JSI.cp.getReturnedValue = function(r){
	if('error' in r){
		this.throwObjectError(r.error);
	}else{
		return JSI.getValueIn(this.jsi, r.value);
	};
	var u;
	return u;
};
//---------------------------------------------------------------------------------------------------- JSICallbacks STATIC
/** �������� ������� ��������� ������, ���������� ������ document 
 * @private
 * @param {JSIMain} j
 * @param {String} n
 */
JSICallbacks.getHandler = function(j, n){
	var f = function(){
		var a = arguments;
		var c = a.callee;
		var m = c._jsi.main;
		return m[JSICallbacks.callbackMethod](c._jsi.getInfo(this), c._n, JSI.convertListToInfoIn(c._jsi, a));
	};
	f._jsi = j;
	f._n = n;
	return f;
};
/**
 * 
 * @param {Error} e
 * @param {Object} o
 * @param {String} pn
 */
JSICallbacks.getErrorObject = function(j, e, nm, pn){
	var o = {
		message:e.message,
		number:e.number,
		description:e.description,
		fileName:e.fileName,
		lineNumber:e.lineNumber,
		name:e.name,
		stack:e.stack,
		property:pn
	};
	JSICallbacks.__errTarget(j, o, nm);
	JSICallbacks.__errFL(e, o);
	return o;
};
/**
 * @private
 * @param {Object} j
 * @param {Object} o
 * @param {Object} nm
 */
JSICallbacks.__errTarget = function(j, o, nm){
	if(j && nm){
		if(typeof nm == 'string'){
			if(j.objects.isExists(nm)){
				o.target = j.getInfo(j.objects.getItem(nm));
			}else{
				o.target = nm;
			};
		}else{
			o.target = j.getInfo(nm);
		};
	};
};
/**
 * @private
 * @param {Object} e
 * @param {Object} o
 */
JSICallbacks.__errFL = function(e, o){
	if('flId' in e){
		o.flId = e.flId;
		o.flDef = e.flDef;
		o.flName = e.flName;
		o.flStackTrace = e.flStackTrace;
	};
};
//----------------------------------- ������ ����������� �������������� �������
/**
 * 
 * 
 */
JSIInclude = function(){};
//---------------------------------------------------------------------------------------------------- JSIInclude PUBLIC
//---------------------------------------------------------------------------------------------------- JSIInclude STATIC
/** ������ �������� JavaScript �����
 * 
 * @param {String} jn
 * @param {String} url
 * @param {String} func
 * @param {String} type
 */
JSIInclude.loadJavaScript = function(jn, url, func, type){
	var j = JSIHost[jn];
	if(!type){
		type = 'text/javascript';
	};
	var el = JSIInclude.getJSEl(url, type);
	if(func){
		JSIInclude.getCH(j, el, func);
	};
	el.src = url;
	j.tag.appendChild(el);
	return j.getInfo(el);
};
/**
 * @private
 * @param {Object} jn
 * @param {Object} url
 * @param {Object} func
 * @param {Object} type
 */
JSIInclude.tryLoadJavaScript = function(jn, url, func, type){
	var o;
	try{
		o = JSIInclude.loadJavaScript(jn, url, func, type);
	}catch(e){
		var j = JSIHost[jn];
		j.callbacks.throwException(e, null, '');
	};
	return o;
};
/** �������� ����� HTML-������� SCRIPT
 * @private
 * @param {JSIMain} j
 * @param {String} name
 * @param {String} url
 * @param {String} type
 */
JSIInclude.getJSEl = function(url, type){
	var el = JSI.d().createElement('script');
	el.type = type;
	return el;
};
/** ������ �������� CSS �����
 * 
 * @param {String} jn
 * @param {String} url
 * @param {String} func
 * @param {String} type
 */
JSIInclude.loadCSS = function(jn, url, func, type){
	var j = JSIHost[jn];
	if(!type){
		type = 'text/css';
	};
	var el = JSIInclude.getCSSEl(url, type);
	if(func){
		JSIInclude.getCH(j, el, func);
	};
	el.href = url;
	j.tag.appendChild(el);
	return j.getInfo(el);
};
/**
 * @private
 * @param {Object} jn
 * @param {Object} url
 * @param {Object} func
 * @param {Object} type
 */
JSIInclude.tryLoadCSS = function(jn, url, func, type){
	var o;
	try{
		o = JSIInclude.loadCSS(jn, url, func, type);
	}catch(e){
		var j = JSIHost[jn];
		j.callbacks.throwException(e, null, '');
	};
	return o;
};
/** �������� ����� HTML-������� LINK
 * @private
 * @param {JSIMain} j
 * @param {String} name
 * @param {String} url
 * @param {String} type
 */
JSIInclude.getCSSEl = function(url, type){
	var el = JSI.d().createElement('link');
	el.rel = 'stylesheet';
	el.type = type;
	return el;
};
/** �������� ������� �� ������� ��������
 * @private
 * @param {JSIMain} j
 * @param {HTMLElement} el
 * @param {String} func
 */
JSIInclude.getCH = function(j, el, func){
	var f = function(){
		var a = arguments;
		JSIInclude.callCH(this, a.callee._h, a);
		JSIInclude.clearCH(this);
	};
	f._h = j.callbacks.getItem(func);
	if(JSI.isIE()){
		el.onreadystatechange = f;
	}else{
		el.onload = f;
	};
	return f;
};
/** ������� ���� ������� �� ��������
 * @private
 * @param {HTMLElement} el
 * @param {Function} func
 * @param {Array} args
 */
JSIInclude.callCH = function(el, func, args){
	var f = function(){
		var c = arguments.callee;
		c._f.apply(c._e, c._a);
	};
	f._e = el;
	f._f = func;
	f._a = args;
	setTimeout(f, 1);
};
/** ������� ������� �������
 * @private
 * @param {HTMLElement} el
 * @param {Function} func
 * @param {Array} args
 */
JSIInclude.clearCH = function(el){
	if(JSI.isIE()){
		el.onreadystatechange = null;
	}else{
		el.onload = null;
	};
};
//----------------------------------- ������ ������� ��� JavaScript �������� ������������ ��������
/**
 * 
 * @param {Object} v
 */
FLSimple = function(v){
	this.data = v;
};
//----------------------------------- ������ ������� ��� ���� �������� �� FLASH �����
/**
 * 
 * @param {Object} j
 * @param {Object} n
 */
FLObject = function(j, i){
	this.jsi = j;
	this.info = i;
	this.name = i.value;
};
JSI.fo = FLObject.prototype;
//---------------------------------------------------------------------------------------------------- FLObject PUBLIC
/** ������� ��������/����� �� ���� �������
 * 
 * @param {Object} n
 * @param {Object} a
 * @param {Object} u
 */
JSI.fo.call = function(n, a, u){
	if (!a) {
		a = [];
	};
	if(arguments.length<=2){
		u = '';
	};
	return this.jsi.callbacks.callProperty(this.name, n, a, u);
};
/** ��������� ������� �������� �� ���� �������
 * 
 * @param {Object} n
 * @param {Object} u
 */
JSI.fo.has = function(n, u){
	if(arguments.length==1){
		u = '';
	};
	return this.jsi.callbacks.hasProperty(this.name, n, u);
};
/** �������� �������� �������� �� ���� �������
 * 
 * @param {Object} n
 * @param {Object} u
 */
JSI.fo.get = function(n, u){
	if(arguments.length==1){
		u = '';
	};
	return this.jsi.callbacks.getProperty(this.name, n, u);
};
/** ���������� �������� �� ���� �������
 * 
 * @param {Object} n
 * @param {Object} v
 * @param {Object} u
 */
JSI.fo.set = function(n, v, u){
	if(arguments.length<=2){
		u = '';
	};
	return this.jsi.callbacks.setProperty(this.name, n, v, u);
};
/** ������� �������� �� ���� �������
 * 
 * @param {Object} n
 * @param {Object} u
 */
JSI.fo.del = function(n, u){
	if(arguments.length==1){
		u = '';
	};
	return this.jsi.callbacks.deleteProperty(this.name, n, u);
};
/** �������� ������ ���� ������ �� ��� ������, � �������� - � ����������� ������������� � ������� ����� � ���� ����������.
 * 
 */
JSI.fo.getAsSimple = function(){
	return this.jsi.callbacks.callCommand(this.name, 'asSimple');
};
/** �������� ������ ������� ���� �������
 * 
 * @param {String} ac - R,W,RW,D(������ ������������, �� ����������� ��������)
 */
JSI.fo.getPropertyList = function(ac){
	return this.jsi.callbacks.callCommand(this.name, 'propertyList', arguments);
};
/** �������� ������ ������� ���� �������
 * 
 */
JSI.fo.getMethodList = function(){
	return this.jsi.callbacks.callCommand(this.name, 'methodList');
};
/** �������� ��� ������ ���� �������
 * 
 */
JSI.fo.describeType = function(){
	return this.jsi.callbacks.callCommand(this.name, 'describeType');
};
/** �������� ��� ������ ���� �������
 * 
 */
JSI.fo.getClassName = function(){
	return this.jsi.callbacks.callCommand(this.name, 'className');
};
/** �������� ��� ����� ������ ���� �������
 * 
 */
JSI.fo.getSuperClassName = function(){
	return this.jsi.callbacks.callCommand(this.name, 'superClassName');
};
/** ������� ������ ������ �� ����� ������
 * 
 */
JSI.fo.remove = function(){
	return this.jsi.callbacks.removeObject(this.name);
};
//---------------------------------------------------------------------------------------------------- FLObject STATIC
/** ������� ���� ������
 * 
 * @param {String} cn
 * @param {Array} a
 * @param {String} jn
 */
FLObject.create = function(cn, a, jn){
	var j = JSI.get(jn);
	if(arguments.length<2 || a==null){
		a = [];
	}else if(!(a instanceof Array)){
		a = [a];
	};
	return j.callbacks.createObject(cn, a);
};
/** �������� ���� ������ �� ���� � ����
 * 
 * @param {Object} p
 * @param {Object} jn
 */
FLObject.instance = function(p, t, jn){
	var j = JSI.get(jn);
	return j.callbacks.instanceObject(p, t);
};
/** ������� ��� ������ �� ���� �������
 * 
 * @param {Object} flc - ������� Flash ��������
 * @param {Object} flo - ������� Flash �������
 * @param {Object} jsc - ������� JavaScript ��������
 * @param {Object} jso - ������� JavaScript �������
 * @param {Object} jn -��� JSI �������
 */
FLObject.clear = function(flc, flo, jsc, jso, jn){
	var l = arguments.length;
	if(l<1) flc = true;
	if(l<2) flo = true;
	if(l<3) jsc = true;
	if(l<4) jso = true;
	var j = JSI.get(jn);
	j.clear(flc, flo);
	return j.callbacks.objectsClear(jsc, jso);
};
/** �������� ���� ������ stage
 * 
 * @param {Object} jn
 */
FLObject.stage = function(jn){
	var j = JSI.get(jn);
	return j.callbacks.instanceObject('stage');
};
/** �������� ���� ������ root timeline
 * 
 * @param {Object} jn
 */
FLObject.root = function(jn){
	var j = JSI.get(jn);
	return j.callbacks.instanceObject('root');
};
/** �������� ���� ������ ApplicationDomain.currentDomain
 * 
 * @param {Object} jn
 */
FLObject.applicationDomain = function(jn){
	var j = JSI.get(jn);
	return j.callbacks.instanceObject('applicationDomain');
};
//---------------------------------------------------------------------------------------------------- FLSimple PUBLIC
//---------------------------------------------------------------------------------------------------- FLSimple STATIC