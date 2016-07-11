〇=(function(){
    〇.enableDeprecatedFunction();
    this.EVT.subscribe('window.onload',(function refreshAndStartObserver() {
        〇.ELM.per('script.js-template[data-template]').useAsTemplate();
        〇.ELM.per('.js-version').html(this.VER.framework);
        var count = 1;
        this.ELM.per('h1,h2,h3,h4').each((function perHeader(dElm) {
            var name = dElm.innerHTML.replace(/\W/g,'')+(count++);
            var data = {anchor:name,title:dElm.innerHTML,className: dElm.tagName.toLowerCase()};
            dElm.innerHTML = this.TPL.render({'headerTemplate':data});
            this.DOM.append(this.ELM.navigation,this.TPL.render({'navLinkTemplate':data}));
        }).bind(this));
    }).bind(this));

return this;}).call((typeof 〇 !== 'undefined')?〇:{});
