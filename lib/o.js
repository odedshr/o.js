〇=O=(function(){
    this.VER = { framework: '0.1.1' };

    this.isNodeJS = (typeof window === 'undefined');

    if (!this.isNodeJS) {
        this.EVT = (function EVT() {
            var iEVT = {},
                oldOnLoad = window.onload ? window.onload : false,
                dispatch = function dispatchEvent (eventName, content) {
                    document.dispatchEvent(new CustomEvent(eventName, {detail: content}));
                    return this;
                },
                getDispatcher = function getEventDispatcher (eventName, fHandler) {
                    if (typeof fHandler === 'function') {
                        subscribe(eventName, fHandler);
                    }
                    return function (evt) {
                        dispatch (eventName,evt);
                        return false;
                    };
                },
                subscribe = function subscribe (eventName, fHandler) {
                    document.addEventListener(eventName,fHandler);
                    return this;
                },
                unsubscribe = function unsubscribe (eventName, fHandler) {
                    document.removeEventListener(eventName,fHandler);
                    return this;
                };
            iEVT.subscribe = subscribe.bind(iEVT);
            iEVT.unsubscribe = unsubscribe.bind(iEVT);
            iEVT.dispatch = dispatch.bind(iEVT);
            iEVT.getDispatcher = getDispatcher.bind(iEVT);

            window.onload = iEVT.getDispatcher("window.onload");
            if (oldOnLoad) {
                iEVT.subscribe("window.onload",oldOnLoad);
            }
            return iEVT;
        }).call(this);
        this.ELM = (function ELM() {
            var iELM = {};
            var refresh = (function refresh () {
                var list = this;
                for (var member in this) {
                    if (this.hasOwnProperty(member) && typeof this[member] !== 'function') {
                        delete this[member];
                    }
                }
                [].forEach.call(document.querySelectorAll("[id]"), function perDOMElement(dElm) {
                    list[dElm.id]= dElm;
                });
                return this;
            }).bind(iELM);
            var anObserver = new MutationObserver(refresh.bind(iELM));
            var observerParameters = { childList: true, subtree: true,attributes: false, characterData: false, attributeOldValue: false, characterDataOldValue: false };
            var observe = (function observe (isEnabled) {
                if (isEnabled) {
                    anObserver.observe(document.body, observerParameters);
                    refresh();
                } else {
                    anObserver.disconnect();
                }
                return this;
            }).bind(iELM);
            var forEach = function (callback) {
                var args = [];
                for (var a = 0; a < arguments.length; a++) {
                    args[a] = arguments[a];
                }
                for (var i = 0; i < this.length; i++) {
                    args[0] = this[i];
                    callback.apply(this, args);
                }
                return this;
            };
            var per = (function per (query) {
                var elements = document.querySelectorAll(query);
                elements.each = forEach.bind (elements);
                elements.remove = forEach.bind (elements, this.DOM.remove);
                elements.useAsTemplate = forEach.bind (elements, this.TPL.use);
                elements.html = forEach.bind (elements, function (dElm,html) { dElm.innerHTML = html; });
                elements.css = {
                    add : forEach.bind (elements, this.CSS.add),
                    remove : forEach.bind (elements, this.CSS.remove),
                    toggle : forEach.bind (elements, this.CSS.toggle)
                };
                return elements;
            }).bind(this);
            iELM.refresh = refresh;
            iELM.per = per.bind (iELM);
            iELM.observe = observe;
            this.EVT.subscribe("window.onload",(function refreshAndStartObserver() {
                observe(true);
            }).bind(this));
            return iELM;
        }).call(this);
        this.DOM = (function DOM() {
            var iDOM = {};
            var create = function create (tag, attributes,innerHTML) {
                var dElm = document.createElement(tag);
                if (attributes) {
                    Object.keys(attributes).forEach(function perAttribute(key){
                        dElm.setAttribute(key,attributes[key]);
                    });
                }
                if (innerHTML) {
                    dElm.innerHTML = innerHTML;
                }
                return dElm;
            };
            var domParser = new DOMParser();
            var parse = function parse (string) {
                return domParser.parseFromString(string.trim(),"text/html").body.firstChild;
            };
            var getElement = function getElement (dNewElm) {
                return (typeof dNewElm === 'string') ? parse(dNewElm) : dNewElm;
            };
            var insertBefore = function insertBefore (dElm,dNewElm) {
                dElm.parentNode.insertBefore(getElement(dNewElm), dElm);
                return this;
            };
            var insertAfter = function insertAfter (dElm,dNewElm) {
                dElm.parentNode.insertBefore(getElement(dNewElm), dElm.nextSibling);
                return this;
            };
            var prepend = function prepend (dElm,dNewElm) {
                dElm.insertBefore(getElement(dNewElm), dElm.firstChild);
                return this;
            };
            var append = function append (dElm,dNewElm) {
                dElm.appendChild(getElement(dNewElm));
                return this;
            };
            var remove = function remove (dElm) {
                if (typeof dElm !== 'object') {
                    throw 'bad input for DOM.remove function ('+dElm+')';
                }
                else if (dElm.parentNode && dElm.removeChild) {
                    dElm.parentNode.removeChild(dElm);
                } else {
                    throw 'cannot remove child without a parentNode';
                }
            };
            iDOM.create = create.bind(iDOM);
            iDOM.parse = parse.bind(iDOM);
            iDOM.insertBefore = insertBefore.bind(iDOM);
            iDOM.insertAfter = insertAfter.bind(iDOM);
            iDOM.prepend = prepend.bind(iDOM);
            iDOM.append = append.bind(iDOM);
            iDOM.remove = remove.bind(iDOM);
            return iDOM;
        }).call(this);
        this.CSS = (function CSS() {
            var iCSS = {};
            var jsPrefixString = 'js-';
            var isJsPrefixed = true;
            var getJSPrefix = function () {
                return isJsPrefixed ? jsPrefixString : '';
            };
            var has = function hasClass (dElm, className) {
                return dElm && (dElm.className.split(" ").indexOf(getJSPrefix()+className)>-1);
            };
            var toggle = function toggle (dElm, className,isAdd,isRemove) {
                var classes = dElm.className.split(" "),
                    isAlreadyExists = (classes.indexOf(getJSPrefix()+className)!=-1);
                if (isAlreadyExists) {
                    (isRemove || (!isAdd && !isRemove)) && classes.splice(classes.indexOf(getJSPrefix()+className),1);
                } else {
                    (isAdd || (!isAdd && !isRemove)) && classes.push(getJSPrefix()+className)
                }
                dElm.className = classes.join(" ");
                return this;
            };
            var add = function add (dElm, className) {
                var classes = dElm.className.split(" ");
                if (classes.indexOf(getJSPrefix()+className)==-1) {
                    classes.push(getJSPrefix()+className)
                }
                dElm.className = classes.join(" ");
                return this;
            };
            var remove = function remove (dElm, className) {
                var classes = dElm.className.split(" ");
                if (classes.indexOf(getJSPrefix()+className)!=-1) {
                    classes.splice(classes.indexOf(getJSPrefix()+className),1);
                }
                dElm.className = classes.join(" ");
                return this;
            };
            iCSS.has = has.bind(iCSS);
            iCSS.add = add.bind(iCSS);
            iCSS.remove = remove.bind(iCSS);
            iCSS.toggle = toggle.bind(iCSS);
            iCSS.toggle = toggle.bind(iCSS);
            iCSS.isJsPrefixed = function isJsPrefix(value) {
                if (typeof value !== 'undefined') {
                    isJsPrefixed = value;
                }
                return isJsPrefixed;
            };
            return iCSS;
        }).call(this);
        this.AJAX = (function AJAX() {
            var iAJAX = {};
            var defaults = {
                credentials : false,
                type: 'json',
                url : false,
                callback : false
            };
            var makeAjaxRequest = function makeAjaxRequest (method, url, data, callback, options) {
                if (['GET','DELETE'].indexOf(method)>-1) {
                    options = callback;
                    callback = data;
                    delete data;
                }
                if (typeof url === 'undefined') {
                    if (defaults.url) {
                        url = defaults.url;
                    } else {
                        throw new Error('missing-url');
                    }
                }
                options  = options || {};
                var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

                xmlhttp.onload = function() {
                    if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                        if(+xmlhttp.readyState == 4 && +xmlhttp.status == 200){
                            callback ? callback(xmlhttp.response) : (defaults.callback ? defaults.callback(xmlhttp.response) : false);
                        }
                        else {
                            throw 'ajax-error-'+xmlhttp.status;
                        }
                    }
                };
                xmlhttp.withCredentials = (typeof options.credentials !== 'undefined') ? options.credentials : defaults.credentials;
                if (options.type) {
                    xmlhttp.responseType = options.type
                } else if (defaults.type) {
                    xmlhttp.responseType = defaults.type;
                }
                xmlhttp.open(method, encodeURI(url), true);
                xmlhttp.send(data ? JSON.stringify(data) : false);
                return xmlhttp;
            };
            var setDefaults = function setDefaults (options) {
                for (var key in options) {
                    if (defaults.hasOwnProperty(key)) {
                        defaults[key] = options[key];
                    }
                }
            };

            iAJAX.get = makeAjaxRequest.bind(iAJAX,'GET');
            iAJAX.post = makeAjaxRequest.bind(iAJAX,'POST');
            iAJAX.put = makeAjaxRequest.bind(iAJAX,'PUT');
            iAJAX.delete = makeAjaxRequest.bind(iAJAX,'DELETE');
            iAJAX.setDefaults = setDefaults.bind(iAJAX);
            return iAJAX;
        }).call(this);
    }

    this.TPL = (function TPL() {
        var getDefaultLocale = (function () {
            return (this.isNodeJS) ? 'en-us' : ((window.navigator.userLanguage || window.navigator.language).toLowerCase());
        }).bind(this);
        var locale =  getDefaultLocale();
        var strings = {};
        strings[locale] = {};
        var iTPL = {};
        var templates = {};
        var delimiters = [{start: '{{', end: '}}'}];
        var stdPattern, lngPattern, ifPattern, ifNotPattern, loopPattern, innerPattern, fixPattern;
        var escapeRegExp = function escapeRegExp (string) {
            return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/gm, "\\$&");
        };
        var buildPatterns = (function buildPatterns(start, end) {
            stdPattern = new RegExp(start+'([^#]+?)'+end,'g');
            lngPattern = new RegExp(start+'#(.+?)'+end,'g');
            ifPattern = new RegExp(start+'\\?(.+?)'+end+'([\\s\\S]+?)'+start+'\\/\\1'+end,'g');
            ifNotPattern = new RegExp(start+'\\?\\!(.+?)'+end+'([\\s\\S]+?)'+start+'\\/\\1'+end,'g');
            loopPattern = new RegExp(start+'([^@}]+?)@([\\s\\S]+?)(:([\\s\\S]+?))?'+end+'([\\s\\S]+?)'+start+'\\/\\1@\\2'+end,'g');
            innerPattern = new RegExp(start+'\\@([\\s\\S]+?)'+end+'([\\s\\S]+?)'+start+'\\/\\1'+end,'g');
            fixPattern = new RegExp(start+'\'([^\'}]+?)\',\'([\\s\\S]+?)\''+end+'([\\s\\S]+?)'+start+'\\/\'\\1\',\'\\2\''+end,'g');
        }).bind(this);
        var html = (function (dElm) {
            return dElm.innerHTML ? dElm.innerHTML : dElm.html();
        }).bind(this);
        var use = (function use (dElm) {
            var id = dElm ? dElm.getAttribute('id') : false;
            if (id) {
                templates[id] = dElm;
            } else {
                throw new Error('cannot use element without ID for template');
            }
            return this;
        }).bind(iTPL);
        var list = function list () {
            return Object.keys(templates);
        };
        var load = (function load (sUrl) {
            this.AJAX.get(sUrl, (function (response) {
                var loadedTemplates = response.querySelectorAll('.js-template[id]');
                [].forEach.call (loadedTemplates,use);
                this.EVT.dispatch('TPL.templatesLoaded',list());
            }).bind(this), {type:'document'});
            return this;
        }).bind(this);
        var loadLanguage = (function loadLanguage (sUrl) {
            this.AJAX.get(sUrl, (function (response) {
                for (var locale in response) {
                    if (response.hasOwnProperty(locale)) {
                        appendToLanguage(locale, response[locale]);
                    }
                }
                this.EVT.dispatch('TPL.languageLoaded',Object.keys(response));
            }).bind(this), {type:'json'});
            return this;
        }).bind(this);
        var appendToLanguage = function appendToLanguage (locale,dictionary) {
            if (typeof strings[locale] === 'undefined') {
                strings[locale] = {}
            }
            for (var key in dictionary) {
                if (dictionary.hasOwnProperty(key)) {
                    strings[locale][key] = dictionary[key];
                }
            }
            return this;
        };
        var setLocale = function setLocale (newLocale) {
            locale = newLocale ? newLocale : getDefaultLocale();
            return this;
        };
        var getLocale = function getLocale () {
            return locale;
        };
        var getValue = function (dataset, key) {
            var valueAndTemplate = key.split(':');
            var template = valueAndTemplate[1];
            var value = valueAndTemplate[0];
            if (key==='.') {
                value = dataset;
            } else {
                var nested = key.split('.');
                if (nested.length > 1) {
                    value = dataset.hasOwnProperty(nested[0]) ? dataset[nested[0]] : nested[0];
                    for (var i=1;i<nested.length;i++) {
                        value = value.hasOwnProperty(nested[i]) ? value[nested[i]] : nested[i];
                    }
                } else {
                    value = dataset.hasOwnProperty(key) ? dataset[key] : (key === '.' ? dataset : key);
                }
            }
            if (template) {
                var subTemplateInfo = {};
                subTemplateInfo[template] = value;
                return render(subTemplateInfo);
            } else  {
                return value;
            }
        };
        var toString = function toString (value) {
            return (typeof value === 'function' ? value() : (typeof value === 'object' ? JSON.stringify(value) : value));
        };
        var translate = function translate (value) {
            var translated = strings[locale][value];
            return toString((typeof translated !== 'undefined') ? translated : value.substr(value.indexOf('.')+1));
        };
        var render = function render (input){
            if (Object.keys(input).length !== 1) {
                throw new Error ('cannot render multiple templates!');
            }
            var templateName = Object.keys(input)[0];
            if (templates[templateName] === undefined) {
                throw new Error ('template not found:' + templateName);
            }
            return populate(html(templates[templateName]), input[templateName]);

        };

        var populate = function (string, data) {
            var item;
            while (item = fixPattern.exec(string)) {
                var delimiter = { start: escapeRegExp(item[1]), end: escapeRegExp(item[2]) };
                delimiters.push(delimiter);
                buildPatterns(delimiter.start, delimiter.end);
                string = string.split(item[0]).join( populate(item[3], data) );
                delimiters.pop();
                var previousDelimiter = delimiters[delimiters.length-1];
                buildPatterns(previousDelimiter.start, previousDelimiter.end);
                fixPattern.lastIndex = 0;
            }
            while (item = innerPattern.exec(string)) {
                string = string.split(item[0]).join( populate(item[2],getValue(data,item[1])) );
                innerPattern.lastIndex = 0;
            }
            while (item = loopPattern.exec(string)) {
                var array = [];
                getValue(data,item[2])[item[1]].forEach(function perValue(value, index) {
                    if (typeof value === 'object' && typeof item[4] !== 'undefined') {
                        value[item[4]] = index;
                    }
                    array.push(populate(item[5],value));
                });
                string = string.split(item[0]).join( array.join(''));
                loopPattern.lastIndex = 0;
            }
            while (item = ifNotPattern.exec(string)) {
                string = string.split(item[0]).join( (getValue(data,item[1])===false) ? item[2] : '' );
                ifNotPattern.lastIndex = 0;
            }
            while (item = ifPattern.exec(string)) {
                string = string.split(item[0]).join( (getValue(data,item[1])===true) ? item[2] : '' );
                ifPattern.lastIndex = 0;
            }
            while (item = stdPattern.exec(string)) {
                string = string.split(item[0]).join( toString(getValue(data,item[1])));
                stdPattern.lastIndex = 0;
            }
            while (item = lngPattern.exec(string)) {
                string = string.split(item[0]).join(translate(item[1]));
                lngPattern.lastIndex = 0;
            }
            return string;
        };

        buildPatterns(delimiters[0].start,delimiters[0].end);

        iTPL.load = load.bind(iTPL);
        iTPL.use = use;
        iTPL.loadLanguage = this.isNodeJS ? appendToLanguage.bind(iTPL) : loadLanguage.bind(iTPL);
        if (!this.isNodeJS) {
            iTPL.appendToLanguage = appendToLanguage.bind(iTPL);
        }
        iTPL.setLocale = setLocale.bind(iTPL);
        iTPL.getLocale = getLocale.bind(iTPL);
        iTPL.translate = translate.bind(iTPL);
        iTPL.list = list.bind(iTPL);
        iTPL.render = this.isNodeJS ? populate.bind(iTPL) : render.bind(iTPL);

        if (this.isNodeJS) {
            module.exports = iTPL;
        } else {
            this.EVT.subscribe("window.onload",(function refreshAndStartObserver() {
                this.ELM.per('.js-template[id]').useAsTemplate();
            }).bind(this));
        }

        return iTPL;
    }).call(this);

    return this;}).call((typeof O != "undefined")?O:{});