import{t as P}from"./index-2a8aa57a.js";function D({gameWon:e,guesses:n,gameMode:d,hardMode:o,day:h}){const u=e?n.length:"X",g=d==="random"?"\u221E ":`#${h} `,s=`${u}/6${o?"*":""}`;return`${I()?"Word Leaks":"Word Peaks"} ${g}${s}`}function k({guesses:e,answer:n,guessTimes:d,hideArrows:o}){let h;d&&(h=F(d));const u=I()?"\u{1F4A7}":"\u{1F53D}";return"  "+e.map((g,s)=>[...g].map((p,w)=>p===n[w]?"\u{1F7E9}":o?"\u{1F7EA}":p>n[w]?u:"\u{1F53C}").join("")+(d?" "+d[s].padStart(h):"")).join(`
  `)}function j(e){return P.pop(),navigator.clipboard.writeText(e)}async function T(e){await navigator.clipboard.write([new ClipboardItem({[e.type]:e})])}async function W(e,n){const o={files:[new File([e],`word-peaks-${n}.png`,{type:e.type,lastModified:new Date().getTime()})]};navigator.share&&await navigator.share(o)}const S=88;function y(e,{highContrast:n,boardContent:d,guesses:o,caption:h,guessTimes:u,totalTime:g,showURL:s,hash:p,hideArrows:w,tileSharpness:A}){if(!e)return;e.width=504+(u?F(u)*28+6:0),e.style.maxWidth=`min(100%, ${Math.round(e.width/2)}px)`,e.height=o.length*100+60+(s?44:0);const t=e.getContext("2d");t.fillStyle=n?"#161a25":"#312236",t.fillRect(0,0,e.width,e.height);const R=(i,a,c,r,f,l)=>{l=l!=null?l:f,t.beginPath(),Math.max(f,l)>r*.5?l>f?(t.ellipse(i+c/2,a+(r-l),c/2,l,0,Math.PI,0,!0),t.arcTo(i+c,a,i,a,f),t.arcTo(i,a,i,a+r,f)):(t.ellipse(i+c/2,a+f,c/2,f,0,Math.PI,0),t.arcTo(i+c,a+r,i,a+r,l),t.arcTo(i,a+r,i,a,l)):(t.moveTo(i+f,a),t.arcTo(i+c,a,i+c,a+r,f),t.arcTo(i+c,a+r,i,a+r,l),t.arcTo(i,a+r,i,a,l),t.arcTo(i,a,i+c,a,f)),t.closePath(),t.fill()};t.font="50px Arial",t.textAlign="right",t.textBaseline="middle";const $=S*(A<=1?.14+A*.36:.5+(A-1)*.36);if(d.forEach((i,a)=>{a>=o.length||(i.forEach((c,r)=>{let f=S*.14,l=S*.14;const E=c.distance===0;E||w?t.fillStyle=E?n?"#64ba2e":"#15a850":"#a640c7":c.distance>0?(t.fillStyle="#567de8",l=$):(t.fillStyle=n?"#da3f8b":"#e38f2f",f=$);const x=8+r*100,M=8+a*100;R(x,M,S,S,f,l)}),u&&(t.fillStyle="#a7a1a9",t.fillText(u[a],e.width-6,a*100+55)))}),t.textBaseline="alphabetic",t.fillStyle="#cccccc",g&&t.fillText(g,e.width-6,o.length*100+44),t.font="40px Arial",t.textAlign=g?"left":"center",t.fillText(h,g?8:e.width/2,o.length*100+44),s){t.font="40px Arial";let i="wordpeaks.com";p&&(i+="/#"+p),t.fillStyle="#a7a1a9",t.fillText(i,g?8:e.width/2,o.length*100+92)}}const F=e=>e.reduce((n,d)=>n===null||n.length<d.length?d:n).length,I=()=>{const e=new Date;return e.getMonth()===3&&e.getDate()===1};export{I as a,k as b,j as c,y as d,T as e,D as g,W as s};