import{S as k,i as E,s as x,e as h,t as m,k as v,c as _,a as b,h as g,d as n,m as y,b as f,g as u,L as d,E as p,$ as T,M as C}from"../chunks/index-3a3d0142.js";import{a as O}from"../chunks/index-4e7af7b8.js";import"../chunks/preload-helper-b55195a1.js";function S(c){let e,l,o,s,a,r;return{c(){e=h("button"),l=m("Copy"),o=v(),s=h("textarea"),this.h()},l(t){e=_(t,"BUTTON",{class:!0});var i=b(e);l=g(i,"Copy"),i.forEach(n),o=y(t),s=_(t,"TEXTAREA",{"aria-label":!0,rows:!0,class:!0}),b(s).forEach(n),this.h()},h(){f(e,"class","svelte-6bbd8h"),f(s,"aria-label","Debug text"),f(s,"rows","10"),s.readOnly=!0,s.value=c[0],f(s,"class","svelte-6bbd8h")},m(t,i){u(t,e,i),d(e,l),u(t,o,i),u(t,s,i),a||(r=C(e,"click",c[1]),a=!0)},p,d(t){t&&n(e),t&&n(o),t&&n(s),a=!1,r()}}}function D(c){let e,l,o,s,a=S(c);return{c(){e=h("section"),l=h("h1"),o=m("Wordle Peaks Debug Info"),s=v(),a&&a.c(),this.h()},l(r){e=_(r,"SECTION",{class:!0});var t=b(e);l=_(t,"H1",{});var i=b(l);o=g(i,"Wordle Peaks Debug Info"),i.forEach(n),s=y(t),a&&a.l(t),t.forEach(n),this.h()},h(){f(e,"class","svelte-6bbd8h")},m(r,t){u(r,e,t),d(e,l),d(l,o),d(e,s),a&&a.m(e,null)},p(r,[t]){a.p(r,t)},i:p,o:p,d(r){r&&n(e),a&&a.d()}}}function P(c){const e=Object.entries(O).filter(([s,a])=>typeof a!="function"&&"update"in a&&s!=="boardContent").map(([s,a])=>[s,T(a)]);console.log(e);const l=JSON.stringify(e);return[l,()=>navigator.clipboard.writeText(l)]}class $ extends k{constructor(e){super(),E(this,e,P,D,x,{})}}export{$ as default};
