var pe=Object.defineProperty,he=Object.defineProperties;var ge=Object.getOwnPropertyDescriptors;var W=Object.getOwnPropertySymbols;var me=Object.prototype.hasOwnProperty,ve=Object.prototype.propertyIsEnumerable;var q=(a,e,t)=>e in a?pe(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t,b=(a,e)=>{for(var t in e||(e={}))me.call(e,t)&&q(a,t,e[t]);if(W)for(var t of W(e))ve.call(e,t)&&q(a,t,e[t]);return a},A=(a,e)=>he(a,ge(e));import{_ as E}from"./preload-helper-5828fb0a.js";import{w as T,d as x}from"./index-0be4f015.js";import{$ as g,K as ye}from"./index-210a101c.js";var be=Object.defineProperty,we=Object.defineProperties,ke=Object.getOwnPropertyDescriptors,j=Object.getOwnPropertySymbols,U=Object.prototype.hasOwnProperty,Q=Object.prototype.propertyIsEnumerable,H=(a,e,t)=>e in a?be(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t,y=(a,e)=>{for(var t in e||(e={}))U.call(e,t)&&H(a,t,e[t]);if(j)for(var t of j(e))Q.call(e,t)&&H(a,t,e[t]);return a},$=(a,e)=>we(a,ke(e)),R=(a,e)=>{var t={};for(var r in a)U.call(a,r)&&e.indexOf(r)<0&&(t[r]=a[r]);if(a!=null&&j)for(var r of j(a))e.indexOf(r)<0&&Q.call(a,r)&&(t[r]=a[r]);return t},K=({parser:a,key:e,params:t,translations:r,locale:o,fallbackLocale:i})=>{if(!(e&&o))return console.warn("[i18n]: No translation key or locale provided. Skipping translation..."),"";let n=(r[o]||{})[e];return i&&n===void 0&&(n=(r[i]||{})[e]),a.parse(n,t,o,e)},O=(...a)=>a.length?a.filter(e=>!!e).map(e=>{let t=`${e}`.toLowerCase();try{if([t]=Intl.Collator.supportedLocalesOf(e),!t)throw new Error(`[i18n]: '${e}' is non-standard.`)}catch{console.warn(`[i18n]: Non-standard locale provided: '${e}'. Check your 'translations' and 'loaders' in i18n config...`)}return t}):[],V=(a,e)=>Object.keys(a||{}).reduce((t,r)=>{let o=a[r],i=e?`${e}.${r}`:`${r}`;return o&&typeof o=="object"?y(y({},t),V(o,i)):$(y({},t),{[i]:o})},{}),Oe=async a=>{try{return(await Promise.all(a.map(e=>{var t=e,{loader:r}=t,o=R(t,["loader"]);return new Promise(async i=>{let n;try{n=await r()}catch(c){console.error(`[i18n]: Failed to load translation. Verify your '${o.locale}' > '${o.key}' Loader.`),console.error(c)}i($(y({loader:r},o),{data:n}))})}))).reduce((e,{key:t,data:r,locale:o})=>{if(!r)return e;let[i]=O(o);return $(y({},e),{[i]:V($(y({},e[i]||{}),{[t]:r}))})},{})}catch(e){console.error(e)}return{}},$e=a=>e=>{try{if(typeof e=="string")return e===a;if(typeof e=="object")return e.test(a)}catch{throw new Error("[i18n]: Invalid route config!")}return!1},Le=(a,e)=>{let t=!0;try{t=Object.keys(a).filter(r=>a[r]!==void 0).every(r=>a[r]===e[r])}catch{}return t},z=1e3*60*60*24,_e=class{constructor(a){this.cachedAt=0,this.loadedKeys={},this.currentRoute=T(),this.config=T(),this.isLoading=T(!1),this.promises=new Set,this.loading={subscribe:this.isLoading.subscribe,toPromise:(e,t)=>{let r=Array.from(this.promises).filter(o=>Le({locale:O(e)[0],route:t},o)).map(({promise:o})=>o);return Promise.all(r)},get:()=>g(this.isLoading)},this.privateTranslations=T({}),this.translations={subscribe:this.privateTranslations.subscribe,get:()=>g(this.translations)},this.locales=$(y({},x([this.config,this.privateTranslations],([e,t])=>{if(!e)return[];let{loaders:r=[]}=e,o=r.map(({locale:n})=>O(n)[0]),i=Object.keys(t).map(n=>O(n)[0]);return Array.from(new Set([...o,...i]))},[])),{get:()=>g(this.locales)}),this.internalLocale=T(),this.loaderTrigger=x([this.internalLocale,this.currentRoute],([e,t],r)=>{var o,i,n;e!==void 0&&t!==void 0&&(e!==((o=g(this.loaderTrigger))==null?void 0:o[0])||t!==((i=g(this.loaderTrigger))==null?void 0:i[1]))&&((n=g(this.config))!=null&&n.debug&&console.debug("[i18n]: Triggering translation load..."),r([e,t]))},[]),this.localeHelper=T(),this.locale={subscribe:this.localeHelper.subscribe,forceSet:this.localeHelper.set,set:this.internalLocale.set,update:this.internalLocale.update,get:()=>g(this.locale)},this.initialized=x([this.locale,this.currentRoute,this.privateTranslations],([e,t,r],o)=>{g(this.initialized)||o(e!==void 0&&t!==void 0&&!!Object.keys(r).length)}),this.translation=x([this.privateTranslations,this.locale,this.isLoading],([e,t,r],o)=>{let i=e[t];i&&Object.keys(i).length&&!r&&o(i)},{}),this.t=$(y({},x([this.config,this.translation],([{parser:e,fallbackLocale:t}])=>(r,...o)=>K({parser:e,key:r,params:o,translations:this.translations.get(),locale:this.locale.get(),fallbackLocale:t}))),{get:(e,...t)=>g(this.t)(e,...t)}),this.l=$(y({},x([this.config,this.translations],([{parser:e,fallbackLocale:t},r])=>(o,i,...n)=>K({parser:e,key:i,params:n,translations:r,locale:o,fallbackLocale:t}))),{get:(e,t,...r)=>g(this.l)(e,t,...r)}),this.getLocale=e=>{if(!e)return"";let t=this.locales.get().find(r=>r===O(e)[0])||"";return O(t)[0]||""},this.setLocale=e=>{var t;if(!e)return;let[r]=O(e);if(r!==g(this.internalLocale))return(t=g(this.config))!=null&&t.debug&&console.debug(`[i18n]: Setting '${r}' locale.`),this.internalLocale.set(r),this.loading.toPromise(e,g(this.currentRoute))},this.setRoute=e=>{var t;if(e!==g(this.currentRoute)){(t=g(this.config))!=null&&t.debug&&console.debug(`[i18n]: Setting '${e}' route.`),this.currentRoute.set(e);let r=g(this.internalLocale);return this.loading.toPromise(r,e)}},this.loadConfig=async e=>{await this.configLoader(e)},this.getTranslationProps=async(e=this.locale.get(),t=g(this.currentRoute))=>{let r=g(this.config);if(!r||!e)return[];let o=this.translations.get(),{loaders:i,fallbackLocale:n="",cache:c=z}=r||{},p=Number.isNaN(+c)?z:+c;this.cachedAt?Date.now()>p+this.cachedAt&&(r!=null&&r.debug&&console.debug("[i18n]: Refreshing cache."),this.loadedKeys={},this.cachedAt=0):(r!=null&&r.debug&&console.debug("[i18n]: Setting cache timestamp."),this.cachedAt=Date.now());let[l,h]=O(e,n),d=o[l],u=o[h],s=(i||[]).map(f=>{var m=f,{locale:v}=m,w=R(m,["locale"]);return $(y({},w),{locale:O(v)[0]})}).filter(({routes:f})=>!f||(f||[]).some($e(t))).filter(({key:f,locale:m})=>m===l&&(!d||!(this.loadedKeys[l]||[]).includes(f))||n&&m===h&&(!u||!(this.loadedKeys[h]||[]).includes(f)));if(s.length){this.isLoading.set(!0),r!=null&&r.debug&&console.debug("[i18n]: Fetching translations...");let f=await Oe(s);this.isLoading.set(!1);let m=Object.keys(f).reduce((w,k)=>$(y({},w),{[k]:Object.keys(f[k])}),{}),v=s.filter(({key:w,locale:k})=>(m[k]||[]).some(L=>`${L}`.startsWith(w))).reduce((w,{key:k,locale:L})=>$(y({},w),{[L]:[...w[L]||[],k]}),{});return[f,v]}return[]},this.addTranslations=(e,t)=>{var r;if(!e)return;(r=g(this.config))!=null&&r.debug&&console.debug("[i18n]: Adding translations...");let o=Object.keys(e||{});this.privateTranslations.update(i=>o.reduce((n,c)=>$(y({},n),{[c]:y(y({},n[c]||{}),V(e[c]))}),i)),o.forEach(i=>{let n=Object.keys(e[i]).map(c=>`${c}`.split(".")[0]);t&&(n=t[i]),this.loadedKeys[i]=Array.from(new Set([...this.loadedKeys[i]||[],...n||[]]))})},this.loader=async([e,t])=>{var r;(r=g(this.config))!=null&&r.debug&&console.debug("[i18n]: Adding loader promise.");let o=(async()=>{let i=await this.getTranslationProps(e,t);i.length&&this.addTranslations(...i)})();this.promises.add({locale:e,route:t,promise:o}),o.then(()=>{let i=this.getLocale(e);i&&this.locale.get()!==i&&this.locale.forceSet(i)})},this.loadTranslations=(e,t=g(this.currentRoute)||"")=>{if(e)return this.setRoute(t),this.setLocale(e),this.loading.toPromise(e,t)},a&&this.loadConfig(a),this.loaderTrigger.subscribe(this.loader),this.isLoading.subscribe(async e=>{var t;e&&this.promises.size&&(await this.loading.toPromise(),this.promises.clear(),(t=g(this.config))!=null&&t.debug&&console.debug("[i18n]: Loader promises have been purged."))})}async configLoader(a){if(!a)throw new Error("[i18n]: No config provided!");let e=a,{initLocale:t,fallbackLocale:r,translations:o,debug:i}=e,n=R(e,["initLocale","fallbackLocale","translations","debug"]);[t]=O(t),[r]=O(r),i&&console.debug("[i18n]: Setting config."),this.config.set(y({initLocale:t,fallbackLocale:r,translations:o,debug:i},n)),o&&this.addTranslations(o),await this.loadTranslations(t)}},Y=Object.defineProperty,Ee=Object.defineProperties,Pe=Object.getOwnPropertyDescriptors,I=Object.getOwnPropertySymbols,Z=Object.prototype.hasOwnProperty,ee=Object.prototype.propertyIsEnumerable,B=(a,e,t)=>e in a?Y(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t,_=(a,e)=>{for(var t in e||(e={}))Z.call(e,t)&&B(a,t,e[t]);if(I)for(var t of I(e))ee.call(e,t)&&B(a,t,e[t]);return a},te=(a,e)=>Ee(a,Pe(e)),S=(a,e)=>{var t={};for(var r in a)Z.call(a,r)&&e.indexOf(r)<0&&(t[r]=a[r]);if(a!=null&&I)for(var r of I(a))e.indexOf(r)<0&&ee.call(a,r)&&(t[r]=a[r]);return t},Te=(a,e)=>{for(var t in e)Y(a,t,{get:e[t],enumerable:!0})},ae={};Te(ae,{ago:()=>Fe,date:()=>Ie,eq:()=>N,gt:()=>oe,gte:()=>Ae,lt:()=>re,lte:()=>Se,ne:()=>xe,number:()=>je});var M=(a,e)=>{let{modifierDefaults:t}=e||{},{[a]:r}=t||{};return r||{}},N=({value:a,options:e=[],defaultValue:t=""})=>(e.find(({key:r})=>`${r}`.toLowerCase()===`${a}`.toLowerCase())||{}).value||t,xe=({value:a,options:e=[],defaultValue:t=""})=>(e.find(({key:r})=>`${r}`.toLowerCase()!==`${a}`.toLowerCase())||{}).value||t,re=({value:a,options:e=[],defaultValue:t=""})=>(e.sort((r,o)=>+r.key-+o.key).find(({key:r})=>+a<+r)||{}).value||t,oe=({value:a,options:e=[],defaultValue:t=""})=>(e.sort((r,o)=>+o.key-+r.key).find(({key:r})=>+a>+r)||{}).value||t,Se=({value:a,options:e=[],defaultValue:t=""})=>N({value:a,options:e,defaultValue:re({value:a,options:e,defaultValue:t})}),Ae=({value:a,options:e=[],defaultValue:t=""})=>N({value:a,options:e,defaultValue:oe({value:a,options:e,defaultValue:t})}),je=({value:a,props:e,defaultValue:t="",locale:r="",parserOptions:o})=>{if(!r)return"";let i=M("number",o),{maximumFractionDigits:n}=i,c=S(i,["maximumFractionDigits"]),p=(e==null?void 0:e.number)||{},{maximumFractionDigits:l=n||2}=p,h=S(p,["maximumFractionDigits"]);return new Intl.NumberFormat(r,_(te(_({},c),{maximumFractionDigits:l}),h)).format(+a||+t)},Ie=({value:a,props:e,defaultValue:t="",locale:r="",parserOptions:o})=>{if(!r)return"";let i=S(M("date",o),[]),n=S((e==null?void 0:e.date)||{},[]);return new Intl.DateTimeFormat(r,_(_({},i),n)).format(+a||+t)},F=[{key:"second",multiplier:1e3},{key:"minute",multiplier:60},{key:"hour",multiplier:60},{key:"day",multiplier:24},{key:"week",multiplier:7},{key:"month",multiplier:13/3},{key:"year",multiplier:12}],ie=(a="",e="")=>new RegExp(`^${a}s?$`).test(e),De=a=>F.indexOf(F.find(({key:e})=>ie(e,a))),Re=(a,e)=>F.reduce(([t,r],{key:o,multiplier:i},n)=>{if(ie(r,e))return[t,r];if(!r||n===De(r)+1){let c=Math.round(t/i);if(!r||Math.abs(c)>=1||e!=="auto")return[c,o]}return[t,r]},[a,""]),Fe=({value:a,defaultValue:e="",locale:t="",props:r,parserOptions:o})=>{if(!t)return"";let i=M("ago",o),{format:n,numeric:c}=i,p=S(i,["format","numeric"]),l=(r==null?void 0:r.ago)||{},{format:h=n||"auto",numeric:d=c||"auto"}=l,u=S(l,["format","numeric"]),s=+a||+e,f=Re(s,h);return new Intl.RelativeTimeFormat(t,_(te(_({},p),{numeric:d}),u)).format(...f)},Ce=a=>typeof a=="string"&&/{{(?:(?!{{|}}).)+}}/.test(a),C=a=>typeof a=="string"?a.replace(/\\(?=:|;|{|})/g,""):a,Ve=({value:a,props:e,payload:t,parserOptions:r,locale:o})=>`${a}`.replace(/{{\s*(?:(?!{{|}}).)+\s*}}/g,i=>{let n=C(`${i.match(/(?!{|\s).+?(?!\\[:;]).(?=\s*(?:[:;]|}}$))/)}`),c=t==null?void 0:t[n],[,p=""]=i.match(/.+?(?!\\;).;\s*default\s*:\s*([^\s:;].+?(?:\\[:;]|[^;\s}])*)(?=\s*(?:;|}}$))/i)||[];p=p||(t==null?void 0:t.default)||"";let[,l=""]=i.match(/{{\s*(?:[^;]|(?:\\;))+\s*(?:(?!\\:).[:])\s*(?!\s)((?:\\;|[^;])+?)(?=\s*(?:[;]|}}$))/i)||[];if(c===void 0&&l!=="ne")return p;let h=!!l,{customModifiers:d}=r||{},u=_(_({},ae),d||{});l=Object.keys(u).includes(l)?l:"eq";let s=u[l],f=(i.match(/[^\s:;{](?:[^;]|\\[;])+[^\s:;}]/gi)||[]).reduce((m,v,w)=>{if(w>0){let k=C(`${v.match(/(?:(?:\\:)|[^:])+/)}`.trim()),L=`${v.match(/(?:(?:\\:)|[^:])+$/)}`.trim();if(k&&k!=="default"&&L)return[...m,{key:k,value:L}]}return m},[]);return!h&&!f.length?c:s({value:c,options:f,props:e,defaultValue:p,locale:o,parserOptions:r})}),ne=({value:a,props:e,payload:t,parserOptions:r,locale:o})=>{if(Ce(a)){let i=Ve({value:a,payload:t,props:e,parserOptions:r,locale:o});return ne({value:i,payload:t,props:e,parserOptions:r,locale:o})}else return C(a)},Me=a=>({parse:(e,[t,r],o,i)=>((t==null?void 0:t.default)&&e===void 0&&(e=`${t.default}`),e===void 0&&(e=`${i}`),ne({value:e,payload:t,props:r,parserOptions:a,locale:o}))}),Ne=Me,We=Object.defineProperty,qe=Object.defineProperties,He=Object.getOwnPropertyDescriptors,D=Object.getOwnPropertySymbols,le=Object.prototype.hasOwnProperty,se=Object.prototype.propertyIsEnumerable,J=(a,e,t)=>e in a?We(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t,Ke=(a,e)=>{for(var t in e||(e={}))le.call(e,t)&&J(a,t,e[t]);if(D)for(var t of D(e))se.call(e,t)&&J(a,t,e[t]);return a},ze=(a,e)=>qe(a,He(e)),Be=(a,e)=>{var t={};for(var r in a)le.call(a,r)&&e.indexOf(r)<0&&(t[r]=a[r]);if(a!=null&&D)for(var r of D(a))e.indexOf(r)<0&&se.call(a,r)&&(t[r]=a[r]);return t},X=a=>{var e=a,{parserOptions:t={}}=e,r=Be(e,["parserOptions"]);return ze(Ke({},r),{parser:Ne(t)})},Je=class extends _e{constructor(a){super(a&&X(a)),this.loadConfig=e=>super.configLoader(X(e))}},Xe=Je;const Ge="English",Ue="Fran\xE7aise",Qe="Espa\xF1ol",Ye="Deutsche",Ze="Portugues do Brasil",et="Nederlands",tt="T\xFCrk\xE7e";var P={en:Ge,fr:Ue,es:Qe,de:Ye,pt:Ze,nl:et,tr:tt};const at={translations:{en:{lang:P},fr:{lang:P},nl:{lang:P},es:{lang:P},pt:{lang:P},tr:{lang:P},de:{lang:P}},loaders:[{locale:"en",key:"main",loader:async()=>(await E(()=>import("./main-9d9f50c9.js"),[])).default},{locale:"fr",key:"main",loader:async()=>(await E(()=>import("./main-01fb726b.js"),[])).default},{locale:"nl",key:"main",loader:async()=>(await E(()=>import("./main-2f52e482.js"),[])).default},{locale:"es",key:"main",loader:async()=>(await E(()=>import("./main-ba5466e8.js"),[])).default},{locale:"pt",key:"main",loader:async()=>(await E(()=>import("./main-7b25f831.js"),[])).default},{locale:"tr",key:"main",loader:async()=>(await E(()=>import("./main-2045feac.js"),[])).default},{locale:"de",key:"main",loader:async()=>(await E(()=>import("./main-70ea3cfb.js"),[])).default}]};function ft(){return!navigator||!navigator.language?"en":navigator.language.startsWith("fr")?"fr":navigator.language.startsWith("nl")?"nl":navigator.language.startsWith("es")?"es":navigator.language.startsWith("pt")?"pt":navigator.language.startsWith("tr")?"tr":navigator.language.startsWith("de")?"de":"en"}const{t:pt,loading:ht,locales:gt,locale:mt,loadTranslations:vt,translations:yt}=new Xe(at);function rt(a,e,t){const r=/^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(location.hostname)||location.protocol==="file:";if(!e.trackLocalhost&&r)return console.warn("[Plausible] Ignoring event because website is running locally");if(localStorage.getItem("plausible_ignore")==="true")return console.warn('[Plausible] Ignoring event because "plausible_ignore" is set to "true" in localStorage');const i={n:a,u:e.url,d:e.domain,r:e.referrer,w:e.deviceWidth,h:e.hashMode?1:0,p:t&&t.props?JSON.stringify(t.props):void 0},n=new XMLHttpRequest;n.open("POST",`${e.apiHost}/api/event`,!0),n.setRequestHeader("Content-Type","text/plain"),n.send(JSON.stringify(i)),n.onreadystatechange=()=>{n.readyState===4&&t&&t.callback&&t.callback()}}function ot(a){const e=()=>b({hashMode:!1,trackLocalhost:!1,url:location.href,domain:location.hostname,referrer:document.referrer||null,deviceWidth:window.innerWidth,apiHost:"https://plausible.io"},a),t=(n,c,p)=>{rt(n,b(b({},e()),p),c)},r=(n,c)=>{t("pageview",c,n)};return{trackEvent:t,trackPageview:r,enableAutoPageviews:()=>{const n=()=>r(),c=history.pushState;return c&&(history.pushState=function(p,l,h){c.apply(this,[p,l,h]),n()},addEventListener("popstate",n)),a&&a.hashMode&&addEventListener("hashchange",n),r(),function(){c&&(history.pushState=c,removeEventListener("popstate",n)),a&&a.hashMode&&removeEventListener("hashchange",n)}},enableAutoOutboundTracking:(n=document,c={subtree:!0,childList:!0,attributes:!0,attributeFilter:["href"]})=>{function p(s){t("Outbound Link: Click",{props:{url:this.href}}),typeof process!="undefined"&&process,setTimeout(()=>{location.href=this.href},150),s.preventDefault()}const l=new Set;function h(s){s instanceof HTMLAnchorElement?s.host!==location.host&&(s.addEventListener("click",p),l.add(s)):"querySelectorAll"in s&&s.querySelectorAll("a").forEach(h)}function d(s){s instanceof HTMLAnchorElement?(s.removeEventListener("click",p),l.delete(s)):"querySelectorAll"in s&&s.querySelectorAll("a").forEach(d)}const u=new MutationObserver(s=>{s.forEach(f=>{f.type==="attributes"?(d(f.target),h(f.target)):f.type==="childList"&&(f.addedNodes.forEach(h),f.removedNodes.forEach(d))})});return n.querySelectorAll("a").forEach(h),u.observe(n,c),function(){l.forEach(f=>{f.removeEventListener("click",p)}),l.clear(),u.disconnect()}}}}const G=ot({domain:"vegeta897.github.io/word-peaks",apiHost:"https://plausible.pixelatomy.com"}),bt=()=>ce("pageview"),wt=a=>ce(a);function ce(a){try{a==="pageview"?G.trackPageview():G.trackEvent(a)}catch(e){console.warn(`Failed to track ${a}`,e)}}function kt(a){return a*a*a}function ue(a){const e=a-1;return e*e*e+1}function Ot(a){return-a*(a-2)}function $t(a){return-.5*(Math.cos(Math.PI*a)-1)}function Lt(a,{delay:e=0,duration:t=400,easing:r=ye}={}){const o=+getComputedStyle(a).opacity;return{delay:e,duration:t,easing:r,css:i=>`opacity: ${i*o}`}}function _t(a,{delay:e=0,duration:t=400,easing:r=ue,x:o=0,y:i=0,opacity:n=0}={}){const c=getComputedStyle(a),p=+c.opacity,l=c.transform==="none"?"":c.transform,h=p*(1-n);return{delay:e,duration:t,easing:r,css:(d,u)=>`
			transform: ${l} translate(${(1-d)*o}px, ${(1-d)*i}px);
			opacity: ${p-h*u}`}}function Et(a,{delay:e=0,duration:t=400,easing:r=ue}={}){const o=getComputedStyle(a),i=+o.opacity,n=parseFloat(o.height),c=parseFloat(o.paddingTop),p=parseFloat(o.paddingBottom),l=parseFloat(o.marginTop),h=parseFloat(o.marginBottom),d=parseFloat(o.borderTopWidth),u=parseFloat(o.borderBottomWidth);return{delay:e,duration:t,easing:r,css:s=>`overflow: hidden;opacity: ${Math.min(s*20,1)*i};height: ${s*n}px;padding-top: ${s*c}px;padding-bottom: ${s*p}px;margin-top: ${s*l}px;margin-bottom: ${s*h}px;border-top-width: ${s*d}px;border-bottom-width: ${s*u}px;`}}const it={duration:4e3,initial:1,next:0,pausable:!1,dismissable:!0,reversed:!1,intro:{x:256},theme:{}},nt=()=>{const{subscribe:a,update:e}=T([]);let t=0;const r={},o=l=>l instanceof Object;return{subscribe:a,push:(l,h={})=>{const d=b({target:"default"},o(l)?l:A(b({},h),{msg:l})),u=r[d.target]||{},s=A(b(b(b({},it),u),d),{theme:b(b({},u.theme),d.theme),id:++t});return e(f=>s.reversed?[...f,s]:[s,...f]),t},pop:l=>{e(h=>{if(!h.length||l===0)return[];if(o(l))return h.filter(u=>l(u));const d=l||Math.max(...h.map(u=>u.id));return h.filter(u=>u.id!==d)})},set:(l,h={})=>{const d=o(l)?b({},l):A(b({},h),{id:l});e(u=>{const s=u.findIndex(f=>f.id===d.id);return s>-1&&(u[s]=b(b({},u[s]),d)),u})},_init:(l="default",h={})=>(r[l]=h,r)}},lt=nt();function Pt({gameWon:a,guesses:e,gameMode:t,hardMode:r,day:o}){const i=a?e.length:"X",n=t==="random"?"\u221E ":`#${o} `,c=`${i}/6${r?"*":""}`;return`${fe()?"Word Leaks":"Word Peaks"} ${n}${c}`}function Tt({guesses:a,answer:e,guessTimes:t}){let r;t&&(r=de(t));const o=fe()?"\u{1F4A7}":"\u{1F53D}";return"  "+a.map((i,n)=>[...i].map((c,p)=>c===e[p]?"\u{1F7E9}":c>e[p]?o:"\u{1F53C}").join("")+(t?" "+t[n].padStart(r):"")).join(`
  `)}function xt(a){return lt.pop(),navigator.clipboard.writeText(a)}function St(a){a.toBlob(async e=>{let t=[new ClipboardItem({[e.type]:e})];await navigator.clipboard.write(t)})}async function At(a,{hash:e,day:t}){const r=a.toDataURL(),o=await(await fetch(r)).blob(),n={files:[new File([o],`word-peaks-${e||t}.png`,{type:o.type,lastModified:new Date().getTime()})]};await navigator.share(n)}function jt(a,{highContrast:e,boardContent:t,guesses:r,caption:o,guessTimes:i,totalTime:n,showURL:c,hash:p}){if(!a)return;a.width=504+(i?de(i)*28+6:0),a.style.maxWidth=`min(100%, ${Math.round(a.width/2)}px)`,a.height=r.length*100+60+(c?44:0);const l=a.getContext("2d");l.fillStyle=e?"#161a25":"#312236",l.fillRect(0,0,a.width,a.height);const h=(d,u,s,f,m,v)=>{v=v!=null?v:m,l.beginPath(),l.moveTo(d+m,u),l.arcTo(d+s,u,d+s,u+f,m),l.arcTo(d+s,u+f,d,u+f,v),l.arcTo(d,u+f,d,u,v),l.arcTo(d,u,d+s,u,m),l.closePath(),l.fill()};if(l.font="50px Arial",l.textAlign="right",l.textBaseline="middle",t.forEach((d,u)=>{u>=r.length||(d.forEach((s,f)=>{let m=10,v=10;s.distance===0?l.fillStyle=e?"#64ba2e":"#15a850":s.distance>0?(l.fillStyle="#567de8",v=28):(l.fillStyle=e?"#da3f8b":"#e38f2f",m=28);const w=8+f*100,k=8+u*100,L=88;h(w,k,L,L,m,v)}),i&&(l.fillStyle="#a7a1a9",l.fillText(i[u],a.width-6,u*100+55)))}),l.textBaseline="alphabetic",l.fillStyle="#cccccc",n&&l.fillText(n,a.width-6,r.length*100+44),l.font="40px Arial",l.textAlign=n?"left":"center",l.fillText(o,n?8:a.width/2,r.length*100+44),c){l.font="40px Arial";let d="wordpeaks.com";p&&(d+="/#"+p),l.fillStyle="#a7a1a9",l.fillText(d,n?8:a.width/2,r.length*100+92)}}const de=a=>a.reduce((e,t)=>e===null||e.length<t.length?t:e).length,fe=()=>{const a=new Date;return a.getMonth()===3&&a.getDate()===1};export{Lt as a,bt as b,ue as c,vt as d,fe as e,_t as f,ft as g,kt as h,wt as i,pt as j,Et as k,gt as l,Pt as m,xt as n,Tt as o,jt as p,Ot as q,At as r,$t as s,lt as t,St as u,P as v};
