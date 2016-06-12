// ==UserScript==
// @name           oAutoPagerize
// @namespace      http://ss-o.net/
// @description    loading next page and inserting into current page.(opera-optimized and Safari3 support..)
// @checkurl       http://ss-o.net/userjs/oAutoPagerize.user.js
// @include        http*
// ==/UserScript==
//
// author: os0x( http://d.hatena.ne.jp/os0x/ )
//
// this script based on
// AutoPagerize_opera ( http://d.hatena.ne.jp/gnarl/20070603/1180820465 id:gnarl) and
// AutoPagerize ( http://userscripts.org/scripts/show/8551 id:swdyh) and
// GoogleAutoPager ( http://la.ma.la/blog/diary_200506231749.htm ) and
// estseek autopager ( http://la.ma.la/blog/diary_200601100209.htm ).
// thanks to ma.la.
//
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// UPDATE INFO (Only Japanese) http://d.hatena.ne.jp/os0x/searchdiary?word=%2a%5boAutoPagerize%5d
// 

/*
javascript:(function(a,s){s=document.createElement('script');s.charset='UTF-8';s.type='text/javascript';s.src=a.shift();document.body.appendChild(s);if(a.length)arguments.callee(a);})(['http://ss-o.net/userjs/xAutoPagerize.user.js']);
*/

(function(){
	if (window.AutoPagerizeWedataSiteinfo) {
		var SITEINFO = window.AutoPagerizeWedataSiteinfo;
	} else {
		var fn = arguments.callee;
		insertSITEINFO(function(siteinfo){
			window.AutoPagerizeWedataSiteinfo = siteinfo;
			fn();
		});
		return;
	}
	//delete window.AutoPagerizeWedataSiteinfo;

	// disable site set
	var naviType = 'number'; // 'link' or 'number';
	var DebugMode = false;
	//var HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
	var URL = 'http://d.hatena.ne.jp/os0x/searchdiary?word=%2a%5boAutoPagerize%5d';
	var UPDATE_URL = window.opera ? 'http://ss-o.net/userjs/0AutoPagerize.SITEINFO.js' : 'http://ss-o.net/userjs/0AutoPagerize.SITEINFO.user.js';
	var VERSION = '1.1.2';
	var AUTO_START = true;
	//var CACHE_EXPIRE = 24 * 60 * 60 * 1000;
	var BASE_REMAIN_HEIGHT = 4000;
	var FORCE_TARGET_WINDOW = true;
	var TARGET_WINDOW_NAME = '_blank';
	//loading animation generated with http://www.ajaxload.info/
	// and encoded with http://www.kawa.net/works/js/data-scheme/base64.html
	var LOADING_IMAGE = ['url(','data:image/gif;base64,',
		'R0lGODlhEAAQAPQAAAD//wAAAAD4+AA4OACEhAAGBgAmJgDW1gCoqAAWFgB2dgBmZgDk5ACYmADG',
		'xgBISABWVgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH+GkNy',
		'ZWF0ZWQgd2l0aCBhamF4bG9hZC5pbmZvACH5BAAKAAAAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAA',
		'EAAQAAAFUCAgjmRpnqUwFGwhKoRgqq2YFMaRGjWA8AbZiIBbjQQ8AmmFUJEQhQGJhaKOrCksgEla',
		'+KIkYvC6SJKQOISoNSYdeIk1ayA8ExTyeR3F749CACH5BAAKAAEALAAAAAAQABAAAAVoICCKR9KM',
		'aCoaxeCoqEAkRX3AwMHWxQIIjJSAZWgUEgzBwCBAEQpMwIDwY1FHgwJCtOW2UDWYIDyqNVVkUbYr',
		'6CK+o2eUMKgWrqKhj0FrEM8jQQALPFA3MAc8CQSAMA5ZBjgqDQmHIyEAIfkEAAoAAgAsAAAAABAA',
		'EAAABWAgII4j85Ao2hRIKgrEUBQJLaSHMe8zgQo6Q8sxS7RIhILhBkgumCTZsXkACBC+0cwF2GoL',
		'LoFXREDcDlkAojBICRaFLDCOQtQKjmsQSubtDFU/NXcDBHwkaw1cKQ8MiyEAIfkEAAoAAwAsAAAA',
		'ABAAEAAABVIgII5kaZ6AIJQCMRTFQKiDQx4GrBfGa4uCnAEhQuRgPwCBtwK+kCNFgjh6QlFYgGO7',
		'baJ2CxIioSDpwqNggWCGDVVGphly3BkOpXDrKfNm/4AhACH5BAAKAAQALAAAAAAQABAAAAVgICCO',
		'ZGmeqEAMRTEQwskYbV0Yx7kYSIzQhtgoBxCKBDQCIOcoLBimRiFhSABYU5gIgW01pLUBYkRItAYA',
		'qrlhYiwKjiWAcDMWY8QjsCf4DewiBzQ2N1AmKlgvgCiMjSQhACH5BAAKAAUALAAAAAAQABAAAAVf',
		'ICCOZGmeqEgUxUAIpkA0AMKyxkEiSZEIsJqhYAg+boUFSTAkiBiNHks3sg1ILAfBiS10gyqCg0Ua',
		'FBCkwy3RYKiIYMAC+RAxiQgYsJdAjw5DN2gILzEEZgVcKYuMJiEAOwAAAAAAAAAAAA==',')'].join('');
	var COLOR = {
		on         : '#00ff00',
		off        : '#cccccc',
		loading    : '#00ffff ' + LOADING_IMAGE + ' no-repeat center',
		terminated : '#0000ff',
		error      : '#ff00ff'
	};
	var ICON_SIZE = 8;
	var MICROFORMATs = [
		{
			 url          : '^https?://.'
			,nextLink     : '//a[@rel="next"] | //link[@rel="next"]'
			,insertBefore : '//*[contains(concat(" ",@class," "), " autopagerize_insert_before ")]'
			,pageElement  : '//*[contains(concat(" ",@class," "), " autopagerize_page_element ")]'
		}
		,{
			 url          : '^https?://.'
			,nextLink     : '//link[@rel="next"] | //a[contains(concat(" ", @rel, " "), " next ")] | //a[contains(concat(" ", @class, " "), " next ")]'
			,pageElement  : '//*[contains(concat(" ",@class," "), " hfeed ") or contains(concat(" ",@class," "), " xfolkentry ")]'
		}
	];

	var locationHref = location.href;

	var forEach = function(arr,fun,obj) {
		for(var i=0,l=arr.length;i<l;i++) fun.call(obj,arr[i],i,arr);
	};
	var forMap = function(arr,callback,obj) {
		var _arr = [];
		for(var i = 0, len = arr.length; i < len; i++) {
			_arr.push(callback.call(obj,arr[i],i,arr));
		}
		return _arr;
	};
	var TOP_SITEINFO = [
		/*
		{
			 url:          'http://twitter\\.com/.*'
			,nextLink:     '//div[@class="pagination"]/a[last()]'
			,incremental:{
				nextMatch:  '\\?page=(\\d+)'
				,nextLink:   '?page=#'
				,step:  1
			}
			,pageElement:  '//table[@class="doing"]'
			,exampleUrl:'http://twitter.com/os0x'
		},
		*/
		{
			url:           'http://images\\.google\\..+/images\\?.+'
			,nextLink:     'id("nn")/parent::a'
			,pageElement:  '//table[tbody/tr/td/a[starts-with(@href,"/imgres")]]'
			,exampleUrl:   'http://images.google.com/images?gbv=2&hl=ja&safe=off&q=%E3%83%9A%E3%83%BC%E3%82%B8'
		}
	];
	var BOTTOM_SITEINFO = [
		/* template
		,{
			 url:          ''
			,nextLink:     ''
			//,insertBefore: ''
			,pageElement:  ''
			,exampleUrl:   ''
		}
		*/
	];
	if (window != window.parent) { //if frame
		return;
	}
	var isIE = !!window.ActiveXObject;
	var miscellaneous = [];
	if (/^http:\/\/images\.google\..+\/images\?.+/.test(locationHref)) {
		miscellaneous.push(function(){
			//via http://furyu.tea-nifty.com/annex/2008/04/autopagerizeaut_c163.html
			var nn = document.getElementById('nn');
			var n = nn.parentNode;
			if (n) n.href = n.href.replace(/(?:(\?)gbv=2&|(?:&)gbv=2(&?))/,'$1$2') + '&gbv=1';
			setTimeout(function(){
				new Image().src='http://images.google.com/images?gbv=2&hl=ja&safe=off&q=AutoPagerize?update='+(new Date()).getTime();
				//  for delete cookie(PREF= .. GBV=1 ..)
			},100);
		});
	}
	var autopager = function() {
		if (miscellaneous.length) {
			forEach(miscellaneous,function(f){f();});
		}
		log('autopagerize loading');
		var docRoot = document.documentElement.clientHeight < document.body.clientHeight ? document.documentElement : document.body;

		var AutoPager = function() {this.initialize.apply(this, arguments);};
		AutoPager.prototype = {
			initialize:function(info){
				log('new AutoPager('+info+')');
				this.pageNum = 1;
				this.info = info;
				this.state = AUTO_START;
				var self = this;
				var url = this.getNextURL(info.nextLink, document);
				if (info.insertBefore) {
					this.insertPoint = getFirstElementByXPath(info.insertBefore);
				}
				if (!this.insertPoint) {
					var lastPageElement = getElementsByXPath(info.pageElement).pop() || {};
					this.insertPoint = lastPageElement.nextSibling || lastPageElement.parentNode.appendChild(document.createTextNode(' '));
				}
				log('this.insertPoint.parentNode:'+this.insertPoint);
				if (!url || !this.insertPoint) return;
				this.requestURL = url;
				this.loadedURLs = {};
				this.loadedURLs[location.href] = true;
				this.toggle = function() {self.stateToggle();};
				this.scroll = function() {self.onScroll();};
				addEvent(window,"scroll", this.scroll, false);
				this.initIcon();
				this.initHelp();
				addEvent(this.icon,"mouseover", function(){self.viewHelp()}, false);
				var scrollHeight = docRoot.scrollHeight;
				var bottom = getElementPosition(this.insertPoint).top || this.getPageElementsBottom() || (Math.round(scrollHeight * 0.8));
				this.remainHeight = scrollHeight - bottom + BASE_REMAIN_HEIGHT;
				//this.onScroll();
				// append space to show scrollbar surely.
				var pageHeight = (window.opera || isIE) ? document.documentElement.clientHeight : document.body.offsetHeight;
				if ( (window.innerHeight || document.body.offsetHeight) >= pageHeight) {
					var st = document.body.appendChild(document.createElement('div')).style;
					st.position = "absolute";
					st.bottom ="-1px";
					st.height ="1px";
					st.width  ="1px";
				}
			}
			,getPageElementsBottom:function() {
				try {
					var elem = getElementsByXPath(this.info.pageElement).pop();
					return getElementBottom(elem);
				} catch(e) {}
			}
			,initHelp:function() {
				var helpBack = document.createElement('div');
				with(helpBack.style){
					width = '100%';
					height= '100%';
					display='none';
					position='fixed';
					top='0px';
					right='0px';
					zIndex='1024';
					overflow='hidden';
					background='transparent';
					//background = #aaa;
					margin='0';
					padding='0';
				}
				if (helpBack.style.setExpression) { // via http://d.hatena.ne.jp/shogo4405/20060919/1158664960
					helpBack.style.position = 'absolute';
					var root = document.documentElement.scrollHeight > document.body.scrollHeight ? 'document.documentElement' : 'document.body';
					helpBack.style.setExpression("top", "3 + parseInt("+root+".scrollTop) + 'px'");
				};
				var helpDiv = document.createElement('div');
				helpDiv.id = 'autopagerize_help';
				with(helpDiv.style){
					padding = '5px';
					position = 'absolute';
					top = '3px';
					right = '3px';
					fontSize = '10px';
					background = '#fff';
					color = '#000';
					border = '1px solid #ccc';
					zIndex = '256';
					textAlign = 'left';
					fontWeight = 'normal';
					lineHeight = '120%';
					fontFamily = 'verdana';
				}
				//helpDiv.setAttribute('style', css);

				var toggleDiv = document.createElement('div');
				//toggleDiv.setAttribute('style', 'position:absolute;right:3px;');
				toggleDiv.style.position = 'absolute';
				toggleDiv.style.right = '6px';
				toggleDiv.style.top = '20px';
				var a = document.createElement('a');
				a.className = 'autopagerize_link';
				a.innerHTML = 'on/off';
				a.href = 'javascript:void(0)';
				var self = this;
				var toggle = function() {
					self.stateToggle();
					helpBack.style.display = 'none';
				}
				addEvent(a,'click', toggle, false);
				toggleDiv.appendChild(a);

				var s = ['<div style="width:',140+ICON_SIZE,'px;position:relative;">'];
				var top = 0;
				for (var i in COLOR) {
					s.push([
						"<div style='position:absolute;width:",ICON_SIZE,"px;height:",ICON_SIZE,"px;top:",top*(ICON_SIZE+1),"px;"
						,"margin:0 3px;background:",COLOR[i],";"
						,"'></div><div style='margin:0 3px;position:absolute;left:",ICON_SIZE+4,"px;top:",top*(ICON_SIZE+1),"px;'>",i,"</div>"
					].join(''));
					top++;
				}
				s.push('</div>');
				var colorDiv = document.createElement('div');
				colorDiv.innerHTML = s.join('');
				colorDiv.style.height = top * (ICON_SIZE+1) + 'px';
				helpDiv.appendChild(colorDiv);
				helpDiv.appendChild(toggleDiv);

				var versionDiv = document.createElement('div');
				versionDiv.style.clear = 'both';
				versionDiv.innerHTML = '<a href="' + URL + '">oAutoPagerize</a> ver ' + VERSION + '<br><a href="'+UPDATE_URL+'">UPDATE SITEINFO</a>';
				helpDiv.appendChild(versionDiv);
				helpBack.appendChild(helpDiv);
				document.body.appendChild(helpBack);
				addEvent(helpBack,'mouseover', function(e){
					var elem = e.target || e.srcElement; 
					if(elem == helpBack) {
						helpBack.style.display = 'none';
					}
				}, false);
				this.helpLayer = helpBack;
			}
			,viewHelp:function() {
				this.helpLayer.style.display = 'block';
			}
			,onScroll:function() {
				if (!this.wait) {
					this.wait = true;
					this.checkRemain();
					var self = this;
					setTimeout(function(){
						self.checkRemain();
						self.wait=false;
					},500);
				}
			}
			,checkRemain:function() {
				var pageHeight = docRoot.scrollHeight,remain;
				if (window.innerHeight && window.pageYOffset) {
					remain = pageHeight - window.innerHeight - window.pageYOffset;
				} else {
					var innerHeight = docRoot.clientHeight;
					var pageYOffset = docRoot.scrollTop;
					remain = pageHeight - innerHeight - pageYOffset;
					//alert([remain,pageHeight,innerHeight,pageYOffset,this.remainHeight,remain < this.remainHeight])
				}
				if (this.state && remain < this.remainHeight) {
					this.request();
				}
			}
			,stateToggle:function() {
				if (this.state) {
					this.disable();
				} else {
					this.enable();
				}
			}
			,enable:function() {
				this.state = true;
				this.icon.style.background = COLOR['on'];
				this.icon.style.opacity = 0.8;
			}
			,disable:function() {
				this.state = false;
				this.icon.style.background = COLOR['off'];
				this.icon.style.opacity = 0.5;
			}
			,request:function() {
				if (!this.requestURL || this.lastRequestURL == this.requestURL) return;
				if (!this.requestURL.match(/^http/)) {
					this.requestURL = pathToURL(this.requestURL);
				}
				this.lastRequestURL = this.requestURL;
				this.showLoading(true);
				if ( (window.opera && ( !window.postMessage || 'utf-8' != document.characterSet ) ) || isIE) {
					this.frameRequest();
				} else {
					this.httpRequest();
				}
			}
			,httpRequest:function() {
				var self = this;
				try {
					var x = new XMLHttpRequest();
					x.onreadystatechange=function() {
						if (x.readyState == 4) {
							if (x.status <= 200 && x.status < 300) {
								self.requestLoad.call(self, x);
							} else {
								self.error.call(self, x);
							}
						}
					};
					log('XMLHttpRequest: url='+this.requestURL);
					x.overrideMimeType('text/plane; charset=' + document.characterSet);
					x.open('GET',this.requestURL,true);
					x.send(null);
				} catch (e) {
					if (window.opera) {
						self.frameRequest();
					} else {
						log('message: '+e.message);
						this.error();
						return;
					}
				}
			}
			,frameRequest:function() {
				var iframe = document.createElement('iframe');
				var self = this;
				addEvent(iframe,'load',function() {
					self.frameLoad.call(self,iframe);
				},false);
				this.cleanup = function(){
					document.body.removeChild(iframe);
				}
				iframe.width = 1;
				iframe.height = 1;
				iframe.style.visibility = 'hidden';
				iframe.name = 'oAutoPagerizeRequest';
				iframe.src = this.requestURL;
				document.body.appendChild(iframe);
			}
			,showLoading:function(sw) {
				if (sw) {
					this.icon.style.background = COLOR['loading'];
				} else {
					this.icon.style.background = COLOR['on'];
					if (this.cleanup) {
						this.cleanup();
						this.cleanup = null;
					}
				}
			}
			,frameLoad:function(frame) {
				var htmlDoc = frame.contentDocument || frame.contentWindow.document;
				if (htmlDoc.evaluate) {
					this.loaded(htmlDoc);
				} else {
					var self = this;
					insertJavaScriptXPath(function(){
						self.loaded(htmlDoc);
					},htmlDoc);
				}
			}
			,requestLoad:function(res) {
				log('requestLoad\n'+'status: '+res.statusText);
				var t = res.responseText;
				var htmlDoc = createHTMLDocumentByString(t);
				this.createHTMLDocumentMode = true;
				this.loaded(htmlDoc);
			}
			,loaded:function(htmlDoc) {
				AutoPagerize.loadDocument = htmlDoc.ownerDocument || htmlDoc;
				forEach(AutoPager.documentFilters,function(i) {
					i(htmlDoc, this.requestURL, this.info)
				}, this);
				log('response document: '+htmlDoc);
				try {
					var pages = getElementsByXPath(this.info.pageElement, htmlDoc, htmlDoc.ownerDocument);
					var url = this.getNextURL(this.info.nextLink, htmlDoc, htmlDoc.ownerDocument);
					if(!!this.info.incremental){
						var exp = new RegExp(this.info.incremental.nextMatch,'i');
						var _m = this.info.incremental.nextLink;
						var step = this.info.incremental.step || 1;
						url = this.requestURL.replace(exp,function(m0,m1){
							var n = parseInt(m1,10) + step;
							return _m.split('#').join(n);
						});
					}
				} catch(e) {
					log('error at AutoPager:requestLoad() : '+e);
					log('code: '+e.code);
					this.error();
					return;
				}
				if (!pages.length) {
					log('requestLoad abort: pages:'+pages);
					this.terminate();
					return;
				}
				if (this.loadedURLs[this.requestURL]) {
					log('requestLoad abort: already loadpage:' + this.requestURL);
					this.terminate();
					return;
				}
				if (this.createHTMLDocumentMode && !window.opera) {
					pages = forMap(pages,function (page) {
						page = document.importNode(page, true);
						return page;
					});
				}
				this.loadedURLs[this.requestURL] = true;
				this.addPage(htmlDoc, pages);
				forEach(AutoPager.filters,function(i) {
					i(pages);
				});
				this.requestURL = url;
				this.showLoading(false);
				if (!url) {
					log('requestLoad abort: next url is empty');
					this.terminate();
				}
			}
			,addPage:function(htmlDoc, pages) {
				var insertParentNode = this.insertPoint.parentNode;
				var root,node;
				if (insertParentNode.tagName == 'TBODY') {
					var colNodes = getElementsByXPath('child::tr[1]/child::*[self::td or self::th]',insertParentNode);
					var colums = 0;
					for (var i = 0, l = colNodes.length;i<l;i++) {
						var col = colNodes[i].getAttribute('colspan');
						colums += parseInt(col,10) || 1;
					}
					node = document.createElement('td');
					root = document.createElement('tr');
					node.setAttribute('colspan',colums);
					root.appendChild(node);
				} else {
					root = node =  document.createElement('div');
				}
				var tmpl = {
					number:'<hr style="clear:both;" class="autopagerize_page_separator" /><p class="autopagerize_page_info">page: <a class="autopagerize_link" href="%s">%n</a></p>'
					,link:'<hr style="clear:both;" class="autopagerize_page_separator" /><p class="autopagerize_page_info">AutoPagerized: <a class="autopagerize_link" href="%s">%s</a></p>'
				}
				node.innerHTML = (tmpl[naviType]||tmpl['number']).replace(/%s/g, this.requestURL).replace(/%n/g,++this.pageNum);
				insertParentNode.insertBefore(root, this.insertPoint);
				var self = this;
				var fragmentsStrings = [];
				forEach(pages,function(node) {
					if (!isIE) {
						self.insertPoint.parentNode.insertBefore(node, self.insertPoint);
					} else {
						fragmentsStrings.push(node.outerHTML);
					}
				});
				if (isIE) {
					var portNode = document.createElement('div');
					portNode.innerHTML = fragmentsStrings.join('\n');
					this.insertPoint.parentNode.insertBefore(portNode, this.insertPoint);
				}
			}
			,initIcon:function() {
				var div = document.createElement("div");
				div.id = 'autopagerize_icon';
				with (div.style) {
					fontSize = '12px';
					position = 'fixed';
					top = '3px';
					right = '3px';
					background = this.state ? COLOR['on'] : COLOR['off'];
					color = '#fff';
					width = '16px';
					height = '16px';
					zIndex = '255';
				}
				if (div.style.setExpression) { // via http://d.hatena.ne.jp/shogo4405/20060919/1158664960
					div.style.position = 'absolute';
					var root = document.documentElement.scrollHeight > document.body.scrollHeight ? 'document.documentElement' : 'document.body';
					div.style.setExpression("top", "3 + parseInt("+root+".scrollTop) + 'px'");
				};
				//div.setAttribute('style', css);
				document.body.appendChild(div);
				this.icon = div
			}
			,getNextURL:function(xpath, doc) {
				var next = getFirstElementByXPath(xpath, doc);
				if (next) {
					return next.href || next.action || next.value;
				}
			}
			,terminate:function() {
				log('terminating');
				this.icon.style.background = COLOR['terminated'];
				removeEvent(window,'scroll', this.scroll, true);
				var self = this;
				setTimeout(function() {
					self.icon.parentNode.removeChild(self.icon);
				}, 1500);
			}
			,error:function() {
				this.icon.style.background = COLOR['error'];
				removeEvent(window,'scroll', this.scroll, true);
			}
		}
		AutoPager.documentFilters = [];
		AutoPager.filters = [];

		if (FORCE_TARGET_WINDOW) {
			var setTargetBlank = function(doc) {
				var anchers = getElementsByXPath(
					[
						'descendant-or-self::a[',
							'not(contains(@class,"autopagerize_link")',
							'or',
							'starts-with(@href,"javascript:")',
							'or',
							'starts-with(@href,"#"))',
						']'
					].join(' ')
				, doc, AutoPagerize.loadDocument);
				forEach(anchers,function(i) {
					i.target = TARGET_WINDOW_NAME;
				});
			}
			AutoPager.documentFilters.push(setTargetBlank);
		}

		var launchAutoPager = function(list) {
			log('launchAutoPager(...)');
			var s = (new Date).getTime();
			var nlist = [];
			//var m = [];
			for (var i = 0;i < list.length;++i) {
				try {
					var _item = list[i].data || list[i];
					_item.regurl = new RegExp(_item.url);
					if (!_item.nextLink || !_item.pageElement) continue;
					if (!_item.regurl.test('http://a')) {
						//m.push(_item.url);
					} else {
						MICROFORMATs.push(_item);
					}
					nlist.push(_item);
				} catch (e){
					debug(e.description,list[i]);
				}
			}
			//var regexp = new RegExp(m.join('|'));
			//if (regexp.test(locationHref)) {
				for (var i = 0,l = nlist.length;i < l; ++i) {
					var info = nlist[i];
					try {
						if (ap) {
						} else if (!info.regurl.test(locationHref)) {
						} else if (!getFirstElementByXPath(info.nextLink)) {
							// ignore microformats case.
							if (!info.regurl.test('http://a')) {
								debug("nextLink not found.", list[i])
							}
						} else if (!getFirstElementByXPath(info.pageElement)) {
							if (!info.regurl.test('http://a')) {
								debug("pageElement not found.", list[i])
							}
						} else {
							ap = new AutoPager(info);
							window.AutoPagerize.AutoPagerObject = ap;
							break;
						}
					} catch(e) {
						log('error at launchAutoPager()'+e);
						continue;
					}
				}
			//}
			log('launchAutoPager...fin:'+((new Date).getTime()-s));
			forEach(MICROFORMATs,function(format){
				if (!ap && getFirstElementByXPath(format.nextLink) && getFirstElementByXPath(format.pageElement)) {
					ap = new AutoPager(format);
					window.AutoPagerize.AutoPagerObject = ap;
				}
			});
		}

		// initialize
		if (!window.AutoPagerize) {
			window.AutoPagerize = {
				addFilter:function(f) {
					AutoPager.filters.push(f);
				}
				,addDocumentFilter:function(f) {
					AutoPager.documentFilters.push(f);
				}
			};
		}
		var ap = null;
		launchAutoPager(TOP_SITEINFO.concat(SITEINFO,BOTTOM_SITEINFO));

		// utility functions.
		function getElementsByXPath(xpath, node, root) {
			//return $X(xpath,node);
			if (window.getMatchedCSSRules) return $X(xpath,node);
			return $x(xpath, node, root);
		}

		function getFirstElementByXPath(xpath, node, root) {
			//return $X(xpath,node)[0];
			if (window.getMatchedCSSRules) return $X(xpath,node)[0];
			return $x(xpath, node, root)[0];
		}
		window.AutoPagerize.getElementsByXPath = getElementsByXPath;
		window.AutoPagerize.getFirstElementByXPath = getFirstElementByXPath;

		function createHTMLDocumentByString(str) {
			var html = String(str);// Thx! jAutoPagerize#HTMLResource.createDocumentFromString http://svn.coderepos.org/share/lang/javascript/userscripts/jautopagerize.user.js
			html = html.replace(/<script[^>]*>[\S\s]*?<\/script\s*>|<\/?(?:i?frame|html|script|object)(?:\s*|\s+[^<>]+)>/gi, " ");
			var htmlDoc = document.implementation.createHTMLDocument ?
					document.implementation.createHTMLDocument('hogehoge') :
					document.implementation.createDocument(null, 'html', null);
			var fragment = createDocumentFragmentByString(html,htmlDoc);
			htmlDoc.documentElement.appendChild(fragment);
			return htmlDoc;
		}
		function createDocumentFromString(str) {
			$X.forceRelative = true;
			var d = document.createElement("div");
			d.innerHTML = str;
			return d;
		}

		function createDocumentFragmentByString(str,htmlDoc) {
/*
			var range = htmlDoc.createRange();
			range.selectNodeContents(htmlDoc.documentElement);
/*/
			var range = document.createRange();
			range.setStartAfter(document.body);
//*/
			return range.createContextualFragment(str);
		}

		function debug(message, siteinfo) {
			if(DebugMode) {
				var params = (function(site){
					var p = [];
					for (var k in site){
						if (k == 'data') {
							var data = site[k];
							for (var j in data){
								p.push(j+'='+data[j]);
							}
						} else {
							p.push(k+'='+site[k]);
						}
					}
					return p.join('&');
				})(siteinfo);
				var host = location.host;
				var href = '/siteinfo/errors' + host + location.pathname + location.search + (location.search ? '&siteinfo=' : '?siteinfo=') + params;
				log(href);
			}
		}

		function log(message) {
			if(DebugMode) {
				if (window.opera) {
					opera.postError(message);
				} else if (window.console){
					console.log(message);
				}
			}
		}

		function getElementPosition(elem) {
			var offsetTrail = elem;
			var offsetLeft  = 0;
			var offsetTop   = 0;
			while (offsetTrail) {
				offsetLeft += offsetTrail.offsetLeft;
				offsetTop  += offsetTrail.offsetTop;
				offsetTrail = offsetTrail.offsetParent;
			}
			offsetTop = offsetTop || null;
			offsetLeft = offsetLeft || null;
			return {left: offsetLeft, top: offsetTop};
		}

		function getElementBottom(elem) {
			var c_style = document.defaultView.getComputedStyle(elem, '');
			var height  = 0;
			var prop    = [
				'height', 'borderTopWidth', 'borderBottomWidth',
				'paddingTop', 'paddingBottom',
				'marginTop', 'marginBottom'];
			forEach(prop,function(i) {
				var h = parseInt(c_style[i]);
				if (typeof h == 'number') {
					height += h;
				}
			});
			var top = getElementPosition(elem).top;
			return top ? (top + height) : null;
		}
		function pathToURL(path) {
			var link = document.createElement('a');
			link.href = path;
			return link.href;
		}
		function $x (exp, context, root) {
			context = context || document;
			root = root || context;
			var results = root.evaluate(exp,context,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,null);
			var ret = [];
			for (var i = 0, len = results.snapshotLength; i < len; i++) {
				ret.push(results.snapshotItem(i));
			}
			return ret;
		}
		function $X (exp, context, type /* want type */) {
			if ($X.forceRelative) {
				exp = exp.replace(/id\(\s*(["'])([^"']+)\1\s*\)/g, './/*[@id="$2"]'); 
				exp = exp.indexOf("(//") == 0
					? "(.//" + exp.substring(3)
					: (exp[0] == "/" ? "." : "./") + exp;
			}
			log("xpath:" + exp);

			if (typeof context == "function") {
				type    = context;
				context = null;
			}
			if (!context) context = document;
			var exp = (context.ownerDocument || context).createExpression(exp, function (prefix) {
				return document.createNSResolver(
					(context.ownerDocument == null ? context : context.ownerDocument).documentElement
				).lookupNamespaceURI(prefix) || document.documentElement.namespaceURI;
			});

			switch (type) {
				case String:
					return exp.evaluate(
						context,
						XPathResult.STRING_TYPE,
						null
					).stringValue;
				case Number:
					return exp.evaluate(
						context,
						XPathResult.NUMBER_TYPE,
						null
					).numberValue;
				case Boolean:
					return exp.evaluate(
						context,
						XPathResult.BOOLEAN_TYPE,
						null
					).booleanValue;
				case Array:
					var result = exp.evaluate(
						context,
						XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
						null
					);
					var ret = [];
					for (var i = 0, len = result.snapshotLength; i < len; i++) {
						ret.push(result.snapshotItem(i));
					}
					return ret;
				case undefined:
					var result = exp.evaluate(context, XPathResult.ANY_TYPE, null);
					switch (result.resultType) {
						case XPathResult.STRING_TYPE : return result.stringValue;
						case XPathResult.NUMBER_TYPE : return result.numberValue;
						case XPathResult.BOOLEAN_TYPE: return result.booleanValue;
						case XPathResult.UNORDERED_NODE_ITERATOR_TYPE: {
							// not ensure the order.
							var ret = [];
							var i = null;
							while (i = result.iterateNext()) {
								ret.push(i);
							}
							return ret;
						}
					}
					return null;
				default:
					throw(TypeError("$X: specified type is not valid type."));
			}
		}
		function addEvent(target,type,listener,useCapture) {
			var func;
			if (window.addEventListener) {
				func = function(target,type,listener,useCapture){
					target.addEventListener(type,listener, useCapture);
				}
			} else if (window.attachEvent) {
				func = function(target,type,listener){
					target.attachEvent('on'+type,listener);
				}
			} else {
				func = function(target,type,listener){
					target['on'+type] = listener;
				}
			}
			func(target,type,listener,useCapture);
			addEvent = func;
		}
		function removeEvent(target,type,listener,useCapture) {
			var func;
			if (window.removeEventListener) {
				func = function(target,type,listener,useCapture){
					target.removeEventListener(type,listener, useCapture);
				}
			} else if (window.detachEvent) {
				func = function(target,type,listener){
					target.detachEvent('on'+type,listener);
				}
			} else {
				func = function(target,type,listener){
					target['on'+type] = null;
				}
			}
			func(target,type,listener,useCapture);
			removeEvent = func;
		}
	}
	function insertJavaScriptXPath(callback,doc){
		doc = doc  || document;
		var src = 'http://ss-o.net/js/javascript-xpath-latest-cmp.js';
		var sc = doc.createElement('script');
		sc.type = 'text/javascript';
		(function(){
			var f = arguments.callee;
			setTimeout(function(){
				if (doc.evaluate) callback();
				else f();
			},500);
		})();
		sc.src = src;
		doc.body.appendChild(sc);
	}
	function insertSITEINFO(callback,thisObject){
		var src = 'http://ss-o.net/json/wedataAutoPagerizeSITEINFO.js';
		var sc = document.createElement('script');
		sc.type = 'text/javascript';
		window.AutoPagerizeCallbackSiteinfo = function(res){
			callback.call(thisObject,res);
			//delete window.AutoPagerizeCallbackSiteinfo;
		};
		sc.src = src;
		document.body.appendChild(sc);
	}
	if (document.evaluate) {
		autopager();
	} else {
		insertJavaScriptXPath(autopager);
	}
})();
