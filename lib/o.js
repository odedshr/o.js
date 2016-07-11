var O = (function 〇Enclosure() {
  'use strict';
  var O = this,
      isClientSide = (typeof window !== 'undefined');

  O.VER = { framework: '0.2.0' };

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            DetailedError
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function DetailedError (message, stack) {
    this.message = message;
    this.stack = stack;
  }

  DetailedError.prototype = Object.create(Error.prototype);
  DetailedError.prototype.constructor = DetailedError;

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            COOKIE
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function initCookie (self) {
    function setCookie (key, value, exdays) {
      var d = new Date(),
          expires;

      if (exdays === undefined) {
        exdays = 0;
      }

      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      expires = "expires="+d.toUTCString();
      document.cookie = key + "=" + value + "; " + expires;
    }

    function getCookie (key) {
      return document.cookie.replace(new RegExp('(?:(?:^|.*;\\s*)'+key+'\\s*\\=\\s*([^;]*).*$)|^.*$'), "$1");
    }

    function Cookie (key, value, exdays) {
      if (value !== undefined) {
        setCookie(key, value, exdays);
        return self;
      } else {
        return getCookie(key);
      }
    }

    return Cookie.bind(self);
  }

  if (isClientSide) {
    O.COOKIE = initCookie(this);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            AJAX
  ////////////////////////////////////////////////////////////////////////////////////////////////


  function ajax() {
    function handleError (callback, xmlhttp, data, errorMessage) {
      var error = new DetailedError(errorMessage, {});
      error.status = xmlhttp.status;
      error.url = xmlhttp.responseURL;
      error.data = data;
      callback(error);
    }

    function makeAjaxRequest (method, url, data, callback, options) {
      var isSendingData = (['GET', 'DELETE'].indexOf(method) === -1);

      if (!isSendingData) {
        options = callback;
        callback = data;
        data = undefined;
      }
      if (typeof url === 'undefined') {
        if (defaults.url) {
          url = defaults.url;
        } else {
          throw new Error('missing-url');
        }
      }
      options = options || {};
      if (options.credentials === undefined) {
        options.credentials = defaults.credentials;
      }
      if (options.type === undefined) {
        options.type = defaults.type;
      }
      var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

      xmlhttp.onload = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (+xmlhttp.readyState == 4 && +xmlhttp.status == 200) {
            if (callback) {
              callback(xmlhttp.response);
            } else if (defaults.callback) {
              defaults.callback(xmlhttp.response);
            }
          }
          else {
            handleError(callback, xmlhttp, data, xmlhttp.statusText);
          }
        }
      };
      xmlhttp.onerror = handleError.bind({},callback, xmlhttp, data);
      xmlhttp.withCredentials = (options.credentials !== undefined);
      xmlhttp.open(method, encodeURI(url), true);
      if (options.credentials) {
          xmlhttp.setRequestHeader("Authorization", options.credentials);
      }
      if (options.type) {
        xmlhttp.responseType = options.type;
      }
      if (isSendingData) {
        xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      }
      xmlhttp.send(data ? JSON.stringify(data) : false);
      return xmlhttp;
    }

    function setDefaults (options) {
      for (var key in options) {
        if (defaults.hasOwnProperty(key)) {
          defaults[key] = options[key];
        }
      }
    }

    var defaults = {
      credentials : false,
      type: 'json',
      url : false,
      callback : false
    };

    return {
      get: makeAjaxRequest.bind({},'GET'),
      post: makeAjaxRequest.bind({},'POST'),
      put: makeAjaxRequest.bind({},'PUT'),
      delete: makeAjaxRequest.bind({},'DELETE'),
      setDefaults: setDefaults.bind({})
    };
  }

  if (isClientSide) {
    O.AJAX = ajax();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            DOM
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function dom() {
    function create(tag, attributes,innerHTML) {
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
    }

    function parse(string) {
      return domParser.parseFromString(string.trim(),'text/html').body.firstChild;
    }

    function getElement(dNewElm) {
      return (typeof dNewElm === 'string') ? parse(dNewElm) : dNewElm;
    }

    function insertBefore(dElm,dNewElm) {
      dElm.parentNode.insertBefore(getElement(dNewElm), dElm);
      return iDOM;
    }

    function insertAfter(dElm,dNewElm) {
      dElm.parentNode.insertBefore(getElement(dNewElm), dElm.nextSibling);
      return iDOM;
    }

    function prepend(dElm,dNewElm) {
      dElm.insertBefore(getElement(dNewElm), dElm.firstChild);
      return iDOM;
    }

    function append(dElm,dNewElm) {
      dElm.appendChild(getElement(dNewElm));
      return iDOM;
    }

    function remove(dElm) {
      if (typeof dElm !== 'object') {
        throw 'bad input for DOM.remove function ('+dElm+')';
      }
      else if (dElm.parentNode && dElm.removeChild) {
        dElm.parentNode.removeChild(dElm);
      } else {
        throw 'cannot remove child without a parentNode';
      }
    }

    var domParser = new DOMParser(),
        iDOM = {
          create: create,
          parse: parse,
          insertBefore: insertBefore,
          insertAfter: insertAfter,
          prepend: prepend,
          append: append,
          remove: remove
        };

    return iDOM;
  }

  if (isClientSide) {
    O.DOM = dom();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            TPL
  //////////////////////////////////////////////////////////////////////////////////////////////////

  function tpl (O) {
    function appendToLanguage (locale,dictionary) {
      if (typeof strings[locale] === 'undefined') {
        strings[locale] = {};
      }

      for (var key in dictionary) {
        if (dictionary.hasOwnProperty(key)) {
          strings[locale][key] = dictionary[key];
        }
      }

      return iTPL;
    }

    function getDefaultLocale () {
      return (!isClientSide) ? 'en-us' : ((window.navigator.userLanguage || window.navigator.language).toLowerCase());
    }

    function getValue(dataset, key) {
      var value = false,
          keyAndTemplate = key.split(':'),
          template = keyAndTemplate[1],
          i, nested, subTemplateInfo;

      key = keyAndTemplate[0];
      if (key === '.') {
        value = dataset;
      } else if (dataset === undefined) {
        return undefined;
      } else {
        nested = key.split('.');
        value = dataset.hasOwnProperty(nested[0]) ? dataset[nested[0]] : (nested[0] === '.' ? dataset : '');
        for (i = 1; i < nested.length; i++) {
          value = value.hasOwnProperty(nested[i]) ? value[nested[i]] : '';
        }
      }

      if (template) {
        template = (template.match(patterns.quote)) ? template.replace(/'/g,'') : getValue(dataset, template);
      }

      if (template) {
        subTemplateInfo = {};
        subTemplateInfo[template] = (key === '.') ? value : dataset[key];
        return render(subTemplateInfo);
      } else  {
        return value;
      }
    }

    function buildPatterns(start, end) {
      patterns.std = new RegExp(start+'([^#]+?)'+end,'g');
      patterns.lng = new RegExp(start+'#(.+?)'+end,'g');
      patterns.if = new RegExp(start+'\\?(.+?)'+end+'([\\s\\S]+?)'+start+'[\\/$]\\1'+end,'g');
      patterns.ifNot = new RegExp(start+'\\?\\!(.+?)'+end+'([\\s\\S]+?)'+start+'\\/\\1'+end,'g');
      patterns.loop = new RegExp(start+'([^@}]+?)@([\\s\\S]+?)(:([\\s\\S]+?))?'+end+'([\\s\\S]+?)'+start+'\\/\\1@\\2'+end,'g');
      patterns.inner = new RegExp(start+'\\@([\\s\\S]+?)'+end+'([\\s\\S]+?)'+start+'\\/\\1'+end,'g');
      patterns.fix = new RegExp(start+'\'([^\'}]+?)\',\'([\\s\\S]+?)\''+end+'([\\s\\S]+?)'+start+'\\/\'\\1\',\'\\2\''+end,'g');
      patterns.quote = new RegExp('^\'.*\'$');
    }

    function escapeRegExp (string) {
      return string.replace(patterns.escape, "\\$&");
    }

    function find(pattern, string) {
      pattern.lastIndex = 0;
      return pattern.exec(string);
    }

    function getLocale () {
      return locale;
    }

    function list () {
      return Object.keys(templates);
    }

    function loadTemplates (sUrl, callback) {
      O.AJAX.get(sUrl, onTemplatesLoaded.bind( {},callback), { type:'text' });
      return iTPL;
    }

    function onTemplatesLoaded (callback, templateString) {
      var template;

      while ((template = patterns.template.exec(templateString)) !== null) {
        useAsTemplate(template[2],template[1]);
      }
      if (typeof callback === 'function') {
        callback(list());
      }
    }

    function loadLanguage (sUrl, callback) {
      if (isClientSide) {
        O.AJAX.get(sUrl, languageLoaded.bind({}, callback), { type:'json' });
      } else {
        languageLoaded(callback, require(sUrl));
      }
      return iTPL;
    }

    function languageLoaded(callback, response) {
      for (var locale in response) {
        if (response.hasOwnProperty(locale)) {
          appendToLanguage(locale, response[locale]);
        }
      }
      if (typeof callback === 'function') {
        callback(Object.keys(response));
      }
    }

    function populate (string, data) {
      var item, delimiter, previousDelimiter, array, loopableElement, i, loopCount, value, loop, indexName;

      while ((item = patterns.fix.exec(string)) !== null) {
        delimiter = { start: escapeRegExp(item[1]), end: escapeRegExp(item[2]) };
        delimiters.push(delimiter);
        buildPatterns(delimiter.start, delimiter.end);
        string = string.split(item[0]).join( populate(item[3], data) );
        delimiters.pop();
        previousDelimiter = delimiters[delimiters.length-1];
        buildPatterns(previousDelimiter.start, previousDelimiter.end);
        patterns.fix.lastIndex = 0;
      }

      while ((item = find (patterns.inner, string)) !== null) {
        string = string.split(item[0]).join( populate(item[2],getValue(data,item[1])) );
      }

      while ((item = find (patterns.loop, string)) !== null) {
        array = [];
        i = 0;
        loop = getValue(data,item[2]);
        indexName = item[4];
        if (Array.isArray(loop)) {
          loopableElement = item[1];
          // since we write to the main scope, which may have these variable, we'll back them up
          value = { elmenet: data[loopableElement], idx: data[indexName] };
          for (loopCount = loop.length; i < loopCount; i++) {
            data[loopableElement] = loop[i];
            data[indexName] = i;
            array.push (populate(item[5],data));
          }
          string = string.split(item[0]).join( array.join(''));
          // restoring the original values -
          data[loopableElement] = value.elmenet;
          data[indexName] = value.idx;
        } else if (loop !== undefined){
          loopableElement = loop[item[1]];

          if (loopableElement !== undefined) {//} && loopableElement.forEach) {
            for (loopCount = loopableElement.length; i < loopCount; i++) {
              value = loopableElement[i];
              if (typeof value === 'object' && typeof indexName !== 'undefined') {
                value[indexName] = i;
              }
              array.push(populate(item[5],value));
            }
            string = string.split(item[0]).join( array.join(''));
          } else {
            string = string.split(item[0]).join( '' );
          }
        } else { //no content for loop
          string = string.split(item[0]).join( '' );
        }
      }
      while ((item = find (patterns.ifNot, string)) !== null) {
        string = string.split(item[0]).join( !getValue(data,item[1]) ? item[2] : '' );
      }
      while ((item = find (patterns.if, string)) !== null) {
        string = string.split(item[0]).join( getValue(data,item[1]) ? item[2] : '' );
      }
      while ((item = find (patterns.std, string)) !== null) {
        string = string.split(item[0]).join( toString(getValue(data,item[1])));
      }
      while ((item = find (patterns.lng, string)) !== null) {
        string = string.split(item[0]).join(translate(item[1]));
      }
      return string;
    }

    function render (input) {
      var templateName = Object.keys(input)[0];

      if (Object.keys(input).length !== 1) {
        throw new Error ('cannot render multiple templates!');
      }

      if (templates[templateName] === undefined) {
        throw new Error ('template not found:' + templateName);
      }

      return populate(templates[templateName], input[templateName]);
    }

    function setLocale (newLocale) {
      locale = newLocale ? newLocale : getDefaultLocale();
      return iTPL;
    }

    function toString (value) {
      return (typeof value === 'function' ? value() : (typeof value === 'object' ? JSON.stringify(value) : value));
    }

    function translate (value) {
      var translated = strings[locale][value];
      return toString((typeof translated !== 'undefined') ? translated : value.substr(value.indexOf('.')+1));
    }

    function useAsTemplate (dElm, id) {
      if (id === undefined && typeof dElm !== 'string') {
        id = dElm.getAttribute('data-template');
        if (id === undefined) {
          id = dElm.getAttribute('data-id');
        }
        if (id === undefined) {
          id = dElm.getAttribute('id');
        }
      }
      if (id) {
        templates[id] = (typeof dElm === 'string') ? dElm : (dElm.innerHTML ? dElm.innerHTML : dElm.html());
      } else {
        throw new Error('could not determine id for template '+ dElm);
      }
      return iTPL;
    }

    var locale = getDefaultLocale(),
        strings = {},
        iTPL = {
          load: loadTemplates,
          use: useAsTemplate,
          loadLanguage: loadLanguage,
          appendToLanguage: appendToLanguage,
          setLocale: setLocale,
          getLocale: getLocale,
          translate: translate,
          list: list,
          render: (isClientSide) ? render: populate
        },
        patterns = {
          template: new RegExp('<template data-id="([\\s\\S]+?)">([\\s\\S]+?)</template>','g'),
          escape: new RegExp('[\-\\[\\]\\/\\{\\}\\(\\)\\*\\+\\?\\.\\\\\\^\$\\|]','gm')
          // - /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/gm
        },
        delimiters = [{start: '{{', end: '}}'}],
        templates = {};

    strings[locale] = {};
    buildPatterns(delimiters[0].start,delimiters[0].end);

    return iTPL;
  }

  O.TPL = tpl(O);

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            Deprecated functions
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function enableDeprecatedFunction () {
    O.EVT = evt();
    O.ELM = elm();
    O.CSS = css();
  }

  O.enableDeprecatedFunction = enableDeprecatedFunction;

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            EVT (deprecated)
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function evt() {
    var oldOnLoad = window.onload ? window.onload : false,
        dispatch = function dispatchEvent (eventName, content) {
          return document.dispatchEvent(new CustomEvent(eventName, {detail: content}));
        },
        getDispatcher = function getEventDispatcher (eventName, fHandler) {
          if (typeof fHandler === 'function') {
            subscribe(eventName, fHandler);
          }
          return function (evt) {
            return dispatch (eventName,evt);
          };
        },
        subscribe = function subscribe (eventName, fHandler) {
          document.addEventListener(eventName,fHandler);
          return this;
        },
        unsubscribe = function unsubscribe (eventName, fHandler) {
          document.removeEventListener(eventName,fHandler);
          return this;
        },
        iEVT = {
          subscribe: subscribe.bind(iEVT),
          unsubscribe: unsubscribe.bind(iEVT),
          dispatch: dispatch.bind(iEVT),
          getDispatcher: getDispatcher.bind(iEVT)
        };

    window.onload = iEVT.getDispatcher("window.onload");
    if (oldOnLoad) {
      iEVT.subscribe("window.onload",oldOnLoad);
    }
    return iEVT;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            ELM (deprecated)
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function elm() {
    function refresh () {
      var list = iELM;
      for (var member in iELM) {
        if (iELM.hasOwnProperty(member) && typeof iELM[member] !== 'function') {
          delete iELM[member];
        }
      }
      [].forEach.call(document.querySelectorAll("[id]"), function perDOMElement(dElm) {
        list[dElm.id]= dElm;
      });
      return iELM;
    }

    function observe (isEnabled) {
      if (isEnabled) {
        anObserver.observe(document.body, observerParameters);
        refresh();
      } else {
        anObserver.disconnect();
      }
      return iELM;
    }

    function per (query) {
      var elements = document.querySelectorAll(query);
      elements.each = Loop.bind (elements);
      elements.remove = Loop.bind (elements, O.DOM.remove);
      elements.useAsTemplate = Loop.bind (elements, O.TPL.use);
      elements.html = Loop.bind (elements, function (dElm,html) { dElm.innerHTML = html; });
      elements.css = {
        add : Loop.bind (elements, O.CSS.add),
        remove : Loop.bind (elements, O.CSS.remove),
        toggle : Loop.bind (elements, O.CSS.toggle)
      };
      return elements;
    }

    function Loop(callback) {
      var args = [];
      for (var a = 0; a < arguments.length; a++) {
        args[a] = arguments[a];
      }
      for (var i = 0; i < this.length; i++) {
        args[0] = this[i];
        callback.apply(this, args);
      }
      return this;
    }

    function refreshAndStartObserver() {
      observe(true);
    }

    var anObserver = new MutationObserver(refresh.bind(iELM)),
        observerParameters = { childList: true,
                               subtree: true,
                               attributes: false,
                               characterData: false,
                               attributeOldValue: false,
                               characterDataOldValue: false },
        iELM = {
          refresh: refresh,
          per: per,
          observe: observe
        };


    O.EVT.subscribe("window.onload",refreshAndStartObserver);
    return iELM;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  //                                            CSS (deprecated)
  ////////////////////////////////////////////////////////////////////////////////////////////////

  function css() {
    function add(dElm, className) {
      var classes = dElm.className.split(" ");
      if (classes.indexOf(getJSPrefix()+className) == -1) {
        classes.push(getJSPrefix() + className);
      }
      dElm.className = classes.join(" ");
      return iCSS;
    }

    function getJSPrefix() {
      return isJsPrefixed ? jsPrefixString : '';
    }

    function isJsPrefixed(value) {
      if (typeof value !== 'undefined') {
        isJsPrefixedValue = value;
      }
      return isJsPrefixedValue;
    }

    function hasClass(dElm, className) {
      return dElm && (dElm.className.split(" ").indexOf(getJSPrefix()+className) > -1);
    }

    function remove (dElm, className) {
      var classes = dElm.className.split(" ");
      if (classes.indexOf(getJSPrefix()+className)!=-1) {
        classes.splice(classes.indexOf(getJSPrefix()+className),1);
      }
      dElm.className = classes.join(" ");
      return iCSS;
    }

    function toggle(dElm, className,isAdd,isRemove) {
      var classes = dElm.className.split(" "),
          isAlreadyExists = (classes.indexOf(getJSPrefix() + className) != -1);
      if (isAlreadyExists) {
        if (isRemove || (!isAdd && !isRemove)) {
          classes.splice(classes.indexOf(getJSPrefix() + className),1);
        }
      } else if (isAdd || (!isAdd && !isRemove)) {
         classes.push(getJSPrefix() + className);
      }
      dElm.className = classes.join(" ");
      return iCSS;
    }

    var jsPrefixString = 'js-',
        isJsPrefixedValue = true,
        iCSS = {
          has: hasClass,
          add: add,
          remove: remove,
          toggle: toggle,
          isJsPrefixed: isJsPrefixed
        };

    return iCSS;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////

  return O;
}).call((function (appName) {
  return (typeof window !== 'undefined') ? (function () {
    if (window[appName] === undefined) {
      window[appName] = {};
    }
    return window[appName];
  })() : module.exports;
})('〇'));
