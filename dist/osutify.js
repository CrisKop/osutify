(async()=>{for(;!Spicetify.React||!Spicetify.ReactDOM;)await new Promise(t=>setTimeout(t,10));var t,e,H,s,U,L,j,r,o,q,n,B,i,g,F,a,l,u,V,h,_,c,d,p,f,m,b,v,K,x,y,w,M,S,W,k,$,J,G,P,O,X,Z,I,Y,Q,tt,et,E,at,ot,it,st,rt,nt,T,lt,ut,ht,z,ct,dt;function pt(t){try{localStorage.setItem(b,t)}catch(t){}}function ft(t){try{localStorage.setItem(v,t?"true":"false")}catch(t){}}function mt(t){return Array.isArray(t)?t.map(t=>Math.round(1e3*(null!=(t=t.start)?t:0))).filter(t=>Number.isFinite(t)):[]}async function gt(t){var e;if(t){if(w.has(t))return w.get(t);try{var a,o=await Spicetify.CosmosAsync.get("https://api.spotify.com/v1/audio-analysis/"+t),i=mt(null==o?void 0:o.beats),s=mt(null==o?void 0:o.tatums),r=mt(null==o?void 0:o.bars),n=(t=>{if(!Array.isArray(t)||0===t.length)return[];var e,a=[];for(e of t){var o=Math.round(1e3*(null!=(o=e.start)?o:0)),i="number"==typeof e.loudness_max?e.loudness_max:-60;Number.isFinite(o)&&a.push({time:o,loudness:i})}if(0===a.length)return a;let s=(t=a.map(t=>t.loudness).sort((t,e)=>t-e))[Math.floor(.55*t.length)];return a.filter(t=>t.loudness>=s)})(null==o?void 0:o.segments),l="number"==typeof(null==(e=null==o?void 0:o.track)?void 0:e.tempo)&&0<o.track.tempo?o.track.tempo:0;return 0===i.length&&0===l?null:(a={bpm:l||y,beats:i,tatums:s,bars:r,peaks:n},w.set(t,a),a)}catch(t){console.warn("[Osutify] audio-analysis fetch failed",t)}try{var u,h=await Spicetify.CosmosAsync.get("https://api.spotify.com/v1/audio-features/"+t);if("number"==typeof(null==h?void 0:h.tempo)&&0<h.tempo)return u={bpm:h.tempo,beats:[],tatums:[],bars:[],peaks:[]},w.set(t,u),u}catch(t){console.warn("[Osutify] audio-features fallback failed",t)}}return null}async function bt(){var t,e,a,o,i,s="undefined"!=typeof Spicetify&&null!=(t=null==(t=Spicetify.Player)?void 0:t.data)&&t.item?(i=(i=null!=(i=(a=null!=(a=(t=Spicetify.Player.data.item).metadata)?a:{})["audio-attributes.tempo"])?i:a.tempo)?parseFloat(i):NaN,s=null!=(s=null!=(s=null!=(s=null==(s=null==(s=t.artists)?void 0:s[0])?void 0:s.name)?s:a.artist_name)?s:a.artist)?s:"Unknown",e=null!=(e=null!=(e=null!=(e=null!=(e=null==(e=null==(e=null==(e=t.album)?void 0:e.images)?void 0:e[0])?void 0:e.url)?e:a.image_xlarge_url)?e:a.image_large_url)?e:a.image_url)?e:a.image_small_url,{uri:t.uri,trackId:(o=(a=t.uri).match(/spotify:track:([a-zA-Z0-9]+)/))?o[1]:a,name:null!=(o=t.name)?o:"Unknown",artist:s,bpm:Number.isFinite(i)&&0<i?i:y,durationMs:null!=(o=null==(a=t.duration)?void 0:a.milliseconds)?o:0,imageUrl:e}):null;return s?((i=await gt(s.trackId))&&(s.bpm=i.bpm,0<i.beats.length&&(s.beats=i.beats),0<i.tatums.length&&(s.tatums=i.tatums),0<i.bars.length&&(s.bars=i.bars),0<i.peaks.length)&&(s.peaks=i.peaks),s):null}function vt(t,e=M){return Math.max(e,Math.min(1-e,t))}function xt(t,e){var a=e()*Math.PI*2,e=k+e()*($-k);return{x:vt(t.x+Math.cos(a)*e),y:vt(t.y+Math.sin(a)*e)}}function C(t,e,a,o){var i=6e4/t/o,s=e-1e3,r=[];for(let t=a;t<s;t+=i)r.push(Math.round(t));return r}function A(t,e,a){var o,i=[];for(o of[...t,...e].sort((t,e)=>t-e))(0===i.length||o-i[i.length-1]>=a)&&i.push(o);return i}function yt(t){var{trackId:e,title:a,artist:o,bpm:i,durationMs:s}=t,r=null!=(r=t.difficulty)?r:"normal",n=(t=>{let e=t>>>0;return()=>{var t=e=(e|=0)+1831565813|0,t=Math.imul(t^t>>>15,1|t);return(((t^=t+Math.imul(t^t>>>7,61|t))^t>>>14)>>>0)/4294967296}})(null!=(u=t.seed)?u:(e=>{let a=2166136261;for(let t=0;t<e.length;t++)a^=e.charCodeAt(t),a=Math.imul(a,16777619);return a>>>0})(e+":"+r)),{times:l,reportedHalfTempo:u}=(t=>{var e=null!=(e=t.difficulty)?e:"normal",a=null!=(l=t.beats)?l:[],o=null!=(l=t.tatums)?l:[],i=null!=(l=t.bars)?l:[],s=(null!=(l=t.peaks)?l:[]).map(t=>t.time),r=null!=(l=t.startOffsetMs)?l:2e3,n=t.durationMs||18e4,l=s.length/(n/1e3),u=(u=a).length<2?500:(u[u.length-1]-u[0])/(u.length-1),h=0<a.length&&380<u&&4<l;switch(e){case"easy":return 4<=i.length?{times:i,reportedHalfTempo:h}:0<a.length?{times:a.filter((t,e)=>e%2==0),reportedHalfTempo:h}:{times:C(t.bpm,n,r,.5),reportedHalfTempo:!1};case"normal":return 0<a.length?{times:a,reportedHalfTempo:h}:{times:C(t.bpm,n,r,1),reportedHalfTempo:!1};case"hard":return h&&0<o.length?{times:A(o,s,90),reportedHalfTempo:!0}:{times:A(0<a.length?a:C(t.bpm,n,r,1),s,120),reportedHalfTempo:h};case"expert":return 0<o.length?{times:A(o,s,70),reportedHalfTempo:h}:{times:A(0<a.length?a:C(t.bpm,n,r,2),s,80),reportedHalfTempo:h}}})(t),h=J[r],c=[];let d=0,p=0;for(;d<l.length;){var f=l.length-d;if(f<=0)break;var m,g,b,v,x,y,w=l[d],f=(f=f,k=h,g=(g=n)(),3<=f&&g<k.drag3?"hold-drag-3":2<=f&&g<k.drag3+k.drag2?"hold-drag-2":g<k.drag3+k.drag2+k.hold?"hold-static":"single"),k={x:M+(g=n)()*(1-2*M),y:M+g()*(1-2*M)};"single"==f?(c.push({id:"auto-"+p++,type:"single",time:w,x:k.x,y:k.y,size:1}),d+=1):"hold-static"==f?(g=(d+1<l.length?l[d+1]:w+6e4/i)-w,m=S+n()*(W-S),g=Math.round(w+g*m),c.push({id:"auto-"+p++,type:"hold",time:w,x:k.x,y:k.y,size:1,points:[{x:k.x,y:k.y,time:w},{x:k.x,y:k.y,time:g}]}),d+=1):"hold-drag-2"==f?(m=xt(k,n),g=l[d+1],f=n()<.4,f=[{x:k.x,y:k.y,time:w,smooth:f},{x:m.x,y:m.y,time:g,smooth:!1}],c.push({id:"auto-"+p++,type:"hold",time:w,x:k.x,y:k.y,size:1,points:f}),d+=2):(g=xt(k,n),f=xt(g,n),b=l[d+1],v=l[d+2],y=n()<.5,x=n()<.5,y=[{x:k.x,y:k.y,time:w,smooth:y},{x:g.x,y:g.y,time:b,smooth:x},{x:f.x,y:f.y,time:v,smooth:!1}],c.push({id:"auto-"+p++,type:"hold",time:w,x:k.x,y:k.y,size:1,points:y}),d+=3)}t=((e,t)=>{if(0===e.length||0===t)return 0;let a=e.length/t*1e3,o=e.filter(t=>"hold"===t.type).length,i=o/e.length,s=0;for(let t=1;t<e.length;t++){var r=e[t-1],n=e[t];s+=Math.hypot(n.x-r.x,n.y-r.y)}return s/=Math.max(1,e.length-1),t=1.5*a+.8*s+.7*i,Math.max(0,Math.min(10,t))})(c,s),s=(t=>{switch(t){case"easy":return"Easy";case"normal":return"Normal";case"hard":return"Hard";case"expert":return"Expert"}})(r);return{trackId:e,title:a+` (${s})`+(u?" (½-tempo fix)":""),artist:o,songName:a,bpm:i,difficulty:t,difficultyName:s,notes:c,isRated:!1,source:"auto"}}async function wt(t,e="normal"){var a;return console.log("[Osutify] generating map bpm=",t.bpm,"duration=",t.durationMs,"beats=",null!=(a=null==(a=t.beats)?void 0:a.length)?a:0,"tatums=",null!=(a=null==(a=t.tatums)?void 0:a.length)?a:0,"peaks=",null!=(a=null==(a=t.peaks)?void 0:a.length)?a:0,"difficulty=",e),yt({trackId:t.trackId,title:t.name,artist:t.artist,bpm:t.bpm,durationMs:t.durationMs||18e4,beats:t.beats,tatums:t.tatums,bars:t.bars,peaks:t.peaks,difficulty:e})}function kt(){return{score:0,combo:0,maxCombo:0,perfect:0,good:0,ok:0,miss:0,hits:0,weightedAccSum:0}}function Mt(t,e){var a;"miss"===e?(t.miss++,t.combo=0):(t[e]++,t.score+=Math.round(Y[e]*(a=t.combo,Math.min(3,1+.01*a))),t.combo++,t.maxCombo<t.combo&&(t.maxCombo=t.combo)),t.hits++,t.weightedAccSum+=Q[e]}function St(t,e,a){return t+(e-t)*a}function N(e,a){if(0===e.length)return{x:0,y:0};if(a<=e[0].time)return{x:e[0].x,y:e[0].y};var t=e[e.length-1];if(!(a>=t.time))for(let t=0;t<e.length-1;t++){var o,i=e[t],s=e[t+1];if(a>=i.time&&a<=s.time)return o=s.time-i.time||1,o=(a-i.time)/o,i.smooth&&3<=e.length?Pt(e,t,o):{x:St(i.x,s.x,o),y:St(i.y,s.y,o)}}return{x:t.x,y:t.y}}function Pt(t,e,a){var o=null!=(o=t[e-1])?o:t[e],i=t[e],s=t[e+1],r=null!=(r=t[e+2])?r:t[e+1],t=a*a,e=t*a;return{x:.5*(2*i.x+(-o.x+s.x)*a+(2*o.x-5*i.x+4*s.x-r.x)*t+(3*i.x-o.x-3*s.x+r.x)*e),y:.5*(2*i.y+(-o.y+s.y)*a+(2*o.y-5*i.y+4*s.y-r.y)*t+(3*i.y-o.y-3*s.y+r.y)*e)}}function Ot(e){if(!(e.length<2)){var a=e[0];for(let t=1;t<e.length;t++)if(1e-4<Math.abs(e[t].x-a.x)||1e-4<Math.abs(e[t].y-a.y))return}return 1}function It(t){return"perfect"===t?"#FFD166":"good"===t?"#1DB954":"ok"===t?"#9D4EDD":"#FF4D4D"}async function Et(){var t;if(z&&!z.win.closed)z.win.focus();else{var a=x.getState().popupSize,o=Math.max(80,a.w),a=Math.max(80,a.h);let e=null!=(t=await(async(t,e)=>{var a=window.documentPictureInPicture;if(null==a||!a.requestWindow)return null;try{return await a.requestWindow({width:t,height:e,disallowReturnToOpener:!0,preferInitialWindowPlacement:!1})}catch(t){return console.warn("[Osutify] PiP request failed",t),null}})(o,a))?t:window.open("about:blank","osutify-popout",`width=${o},height=${a},popup=yes,resizable=yes`);if(e)try{e.document.title="Osutify",e.document.body.className="osu-popout-body";var i=e.document.createElement("style"),s=(i.textContent=ht+ct,e.document.head.appendChild(i),e.document.createElement("div"));s.id="osutify-popout-root",e.document.body.appendChild(s);let t=Spicetify.ReactDOM.createRoot(s);t.render(G.default.createElement(ut));e.addEventListener("resize",()=>{x.getState().setPopupSize({w:e.innerWidth,h:e.innerHeight})});var r=()=>{x.getState().setOpen(!1),z=null};e.addEventListener("pagehide",r),e.addEventListener("beforeunload",r),z={win:e,close:()=>{try{t.unmount()}catch(t){}try{e.close()}catch(t){}z=null}}}catch(t){console.error("[Osutify] popout setup failed",t);try{e.close()}catch(t){}x.getState().setOpen(!1)}else console.warn("[Osutify] popout failed (PiP + window.open blocked)"),x.getState().setOpen(!1)}}function R(t,e,a){var o=t=>Math.round(Math.max(0,Math.min(255,t))).toString(16).padStart(2,"0");return"#"+o(t)+o(e)+o(a)}async function Tt(t){console.log("[Osutify] extract start",t);let e=t;var o,t=await(async t=>{try{var e=await fetch(t,{mode:"cors",credentials:"omit"});if(!e.ok)return console.warn("[Osutify] image fetch HTTP",e.status,t),null;let a=await e.blob();return await new Promise(t=>{let e=new FileReader;e.onload=()=>t("string"==typeof e.result?e.result:null),e.onerror=()=>t(null),e.readAsDataURL(a)})}catch(t){return console.warn("[Osutify] image fetch threw",t),null}})(t);t?(e=t,console.log("[Osutify] image fetched as dataUrl")):console.warn("[Osutify] dataUrl fetch failed, trying direct img load");let a;try{a=(o=e,await new Promise((t,e)=>{let a=new Image;a.onload=()=>t(a),a.onerror=t=>e(t),a.src=o}))}catch(t){return console.warn("[Osutify] img load failed",t),null}console.log("[Osutify] img loaded",a.naturalWidth,"x",a.naturalHeight);t=document.createElement("canvas"),t.width=60,t.height=60,t=t.getContext("2d",{willReadFrequently:!0});if(!t)return console.warn("[Osutify] no 2d ctx"),null;try{t.drawImage(a,0,0,60,60)}catch(t){return console.warn("[Osutify] drawImage failed",t),null}let i;try{i=t.getImageData(0,0,60,60).data}catch(t){return console.warn("[Osutify] getImageData failed (CORS taint?)",t),null}var s,r,n,l,u,h=new Map;for(let t=0;t<i.length;t+=4){var c,d,p=i[t],f=i[t+1],m=i[t+2];i[t+3]<128||(c=Math.max(p,f,m),d=Math.min(p,f,m),c<15)||245<d||((d=h.get(c=p>>4<<8|f>>4<<4|m>>4))?(d.r+=p,d.g+=f,d.b+=m,d.count++):h.set(c,{r:p,g:f,b:m,count:1}))}return console.log("[Osutify] palette buckets",h.size),0===h.size?null:(s=null!=(s=[...t=Array.from(h.values()).map(t=>({r:t.r/t.count,g:t.g/t.count,b:t.b/t.count,count:t.count})).sort((t,e)=>e.count-t.count).slice(0,24).map(t=>{return F(g({},t),{lum:(e=t.r,a=t.g,o=t.b,(Math.max(e,a,o)+Math.min(e,a,o))/2),sat:(e=t.r,a=t.g,o=t.b,t=Math.max(e,a,o),e=Math.min(e,a,o),0===t?0:(t-e)/t)});var e,a,o})].filter(t=>40<t.lum&&t.lum<220).sort((t,e)=>e.sat*Math.sqrt(e.count)-t.sat*Math.sqrt(t.count))[0])?s:t[0],r=null!=(r=[...t].filter(t=>.1<t.sat).sort((t,e)=>t.lum-e.lum)[0])?r:t[t.length-1],n=null!=(n=[...t].filter(t=>.1<t.sat).sort((t,e)=>e.lum-t.lum)[0])?n:t[0],l=t[0],u=null!=(u=[...t].sort((t,e)=>t.sat-e.sat)[0])?u:t[0],t={vibrant:R(s.r,s.g,s.b),darkVibrant:R(r.r,r.g,r.b),lightVibrant:R(n.r,n.g,n.b),prominent:R(l.r,l.g,l.b),desaturated:R(u.r,u.g,u.b)},console.log("[Osutify] extracted colors",t),t)}async function D(){var t=await bt();if(console.log("[Osutify] refresh track",t),x.getState().setTrack(t),t){(async t=>{var e,a,o,i,s,r,n,l;try{var u=await Spicetify.colorExtractor(t.uri);if(u&&"string"==typeof u.VIBRANT)return console.log("[Osutify] colors via Spicetify API",u),!x.getState().setAlbumColors({vibrant:null!=(e=null!=(l=u.VIBRANT)?l:u.PROMINENT)?e:"#f0ffbc",darkVibrant:null!=(a=u.DARK_VIBRANT)?a:"#1e2a31",lightVibrant:null!=(i=null!=(o=u.LIGHT_VIBRANT)?o:u.VIBRANT)?i:"#bcfffc",prominent:null!=(r=null!=(s=u.PROMINENT)?s:u.VIBRANT)?r:"#dbdd78",desaturated:null!=(n=u.DESATURATED)?n:"#bebfab"})}catch(t){console.warn("[Osutify] colorExtractor API failed, fallback to canvas",t)}t.imageUrl?(l=await Tt(t.imageUrl))?(console.log("[Osutify] colors via canvas",l),x.getState().setAlbumColors(l)):console.warn("[Osutify] canvas extract returned null"):console.warn("[Osutify] no album image URL — colors unavailable")})(t);try{var e=await wt(t,x.getState().difficulty);console.log("[Osutify] map ready",e.title,"notes:",e.notes.length,"bpm:",e.bpm),x.getState().setMap(e)}catch(t){console.error("[Osutify] map load failed",t),x.getState().setMap(null)}}else x.getState().setMap(null),x.getState().setAlbumColors(null)}H=Object.create,s=Object.defineProperty,U=Object.defineProperties,L=Object.getOwnPropertyDescriptor,j=Object.getOwnPropertyDescriptors,r=Object.getOwnPropertyNames,o=Object.getOwnPropertySymbols,q=Object.getPrototypeOf,n=Object.prototype.hasOwnProperty,B=Object.prototype.propertyIsEnumerable,i=(t,e,a)=>e in t?s(t,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):t[e]=a,g=(t,e)=>{for(var a in e=e||{})n.call(e,a)&&i(t,a,e[a]);if(o)for(var a of o(e))B.call(e,a)&&i(t,a,e[a]);return t},F=(t,e)=>U(t,j(e)),t={"external-global-plugin:react"(t,e){e.exports=Spicetify.React}},u=t=>{let o,i=new Set;var e=(t,a)=>{t="function"==typeof t?t(o):t;if(!Object.is(t,o)){let e=o;o=(null!=a?a:"object"!=typeof t||null===t)?t:Object.assign({},o,t),i.forEach(t=>t(o,e))}},a=()=>o,s={setState:e,getState:a,getInitialState:()=>r,subscribe:t=>(i.add(t),()=>i.delete(t))};let r=o=t(e,a,s);return s},V=t=>t?u(t):u,h=(a=(t,e,a)=>(a=null!=t?H(q(t)):{},((e,a,o,i)=>{if(a&&"object"==typeof a||"function"==typeof a)for(let t of r(a))n.call(e,t)||t===o||s(e,t,{get:()=>a[t],enumerable:!(i=L(a,t))||i.enumerable});return e})(!e&&t&&t.__esModule?a:s(a,"default",{value:t,enumerable:!0}),t)))((l=function(){return e||(0,t[r(t)[0]])((e={exports:{}}).exports,e),e.exports})(),1),_=t=>t,c=t=>{let o=V(t);t=t=>{return[e,a=_]=[o,t],t=h.default.useSyncExternalStore(e.subscribe,h.default.useCallback(()=>a(e.getState()),[e,a]),h.default.useCallback(()=>a(e.getInitialState()),[e,a])),h.default.useDebugValue(t),t;var e,a};return Object.assign(t,o),t},d=["easy","normal","hard","expert"],p={easy:"Easy",normal:"Normal",hard:"Hard",expert:"Expert"},f={score:0,combo:0,maxCombo:0,accuracy:1,grade:"S",perfect:0,good:0,ok:0,miss:0,totalNotes:0,processedNotes:0},m="osutify:popupSize",b="osutify:difficulty",v="osutify:adaptiveTheme",x=(K=(a,e)=>({open:!1,popupSize:(()=>{var t,e;try{var a,o=localStorage.getItem(m);if(o)return a=JSON.parse(o),{w:Math.max(80,null!=(t=a.w)?t:80),h:Math.max(80,null!=(e=a.h)?e:80)}}catch(t){}return{w:80,h:80}})(),track:null,map:null,score:f,difficulty:(()=>{try{var t=localStorage.getItem(b);if(t&&d.includes(t))return t}catch(t){}return"normal"})(),setOpen:t=>a({open:t}),toggleOpen:()=>a(t=>({open:!t.open})),setPopupSize:t=>{var t={w:Math.max(80,t.w),h:Math.max(80,t.h)},e=t;try{localStorage.setItem(m,JSON.stringify(e))}catch(t){}a({popupSize:t})},setTrack:t=>a({track:t}),setMap:t=>a({map:t}),setScore:t=>a({score:t}),resetScore:()=>a({score:f}),setDifficulty:t=>{pt(t),a({difficulty:t})},cycleDifficulty:()=>{var t=e().difficulty,t=d.indexOf(t),t=d[(t+1)%d.length];pt(t),a({difficulty:t})},adaptiveTheme:(()=>{try{var t=localStorage.getItem(v);if("false"===t)return!1;if("true"===t);}catch(t){}return!0})(),albumColors:null,setAdaptiveTheme:t=>{ft(t),a({adaptiveTheme:t})},toggleAdaptiveTheme:()=>{var t=!e().adaptiveTheme;ft(t),a({adaptiveTheme:t})},setAlbumColors:t=>a({albumColors:t})}))?c(K):c,y=120,w=new Map,M=.13,S=.2,k=.18,$=W=.45,J={easy:{drag3:0,drag2:.06,hold:.5},normal:{drag3:.08,drag2:.22,hold:.4},hard:{drag3:.12,drag2:.26,hold:.36},expert:{drag3:.16,drag2:.3,hold:.32}},G=a(l()),P=a(l()),O=a(l()),X=70,Z=160,I=260,Y={perfect:300,good:200,ok:100,miss:0},Q={perfect:1,good:.66,ok:.33,miss:0},tt="#f0ffbc",et="#bcfffc",E="#dbdd78",at="rgba(240,255,188,0.75)",ot=class{constructor(t){this.canvas=t,this.dpr=1,this.width=0,this.height=0;t=t.getContext("2d");if(!t)throw new Error("2d context unavailable");this.ctx=t}resize(){var t=this.canvas.getBoundingClientRect(),e=null!=(e=null==(e=this.canvas.ownerDocument)?void 0:e.defaultView)?e:window;this.dpr=e.devicePixelRatio||1,this.width=t.width,this.height=t.height,this.canvas.width=Math.floor(t.width*this.dpr),this.canvas.height=Math.floor(t.height*this.dpr),this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}render(e,t){this.ctx.clearRect(0,0,this.width,this.height);for(let t=e.visibleNotes.length-1;0<=t;t--){var a=e.visibleNotes[t];a.dimmed&&(this.ctx.save(),this.ctx.globalAlpha=.28),this.drawNote(a),a.dimmed&&this.ctx.restore()}for(var o of e.feedback)this.drawFeedback(o,t);e.cursor&&this.drawCursor(e.cursor.x,e.cursor.y)}baseRadius(){return.06*Math.min(this.width,this.height)}toPx(t,e){return[t*this.width,e*this.height]}drawNote(t){var e,a,o,i,s,{note:r,msUntilHit:n,songMs:l}=t,u=this.baseRadius()*r.size,h=this.ctx;"hold"===r.type&&r.points&&2<=r.points.length?(o=(s=!Ot(r.points))?E:et,s&&this.drawPath(r.points,o,.85*u),e=r.points[0].x,a=r.points[0].y,[e,a]=this.toPx(e,a),"active"===t.holdState||"broken"===t.holdState?(l=N(r.points,l),[l,i]=this.toPx(l.x,l.y),h.save(),h.fillStyle="broken"===t.holdState?"#FF4D4D":o,h.shadowColor="broken"===t.holdState?"rgba(255,77,77,0.5)":s?"rgba(219,221,120,0.45)":"rgba(188,255,252,0.45)",h.shadowBlur=14,h.beginPath(),h.arc(l,i,.95*u,0,2*Math.PI),h.fill(),h.restore(),0<r.points[r.points.length-1].time-r.points[0].time&&null!=t.holdProgress&&(h.save(),h.strokeStyle="#dbdd78",h.lineWidth=3,h.beginPath(),h.arc(l,i,1.15*u,-Math.PI/2,-Math.PI/2+2*Math.PI*t.holdProgress),h.stroke(),h.restore())):(h.save(),h.fillStyle=o,h.shadowColor=s?"rgba(219,221,120,0.5)":"rgba(188,255,252,0.5)",h.shadowBlur=12,h.beginPath(),h.arc(e,a,u,0,2*Math.PI),h.fill(),h.restore(),s?(l=r.points[1],i=Math.atan2(l.y-r.points[0].y,l.x-r.points[0].x),h.save(),h.translate(e,a),h.rotate(i),h.strokeStyle="rgba(31,31,27,0.9)",h.lineWidth=Math.max(2.5,.22*u),h.lineCap="round",h.lineJoin="round",t=.5*u,h.beginPath(),h.moveTo(.55*-t,.6*-t),h.lineTo(.55*t,0),h.lineTo(.55*-t,.6*t),h.stroke()):(h.save(),h.strokeStyle=o,h.globalAlpha=.55,h.lineWidth=Math.max(2,.18*u),h.beginPath(),h.arc(e,a,1.28*u,0,2*Math.PI),h.stroke(),h.restore(),h.save(),h.fillStyle="rgba(31,31,27,0.85)",s=Math.max(2,.16*u),l=.6*u,i=.28*u,t=Math.min(s/2,2),this.roundRect(e-i-s/2,a-l/2,s,l,t),h.fill(),this.roundRect(e+i-s/2,a-l/2,s,l,t),h.fill()),h.restore(),0<n&&(o=u+1.8*u*Math.max(0,Math.min(1,n/950)),h.save(),h.strokeStyle=at,h.lineWidth=2.5,h.beginPath(),h.arc(e,a,o,0,2*Math.PI),h.stroke(),h.restore()))):([i,s]=this.toPx(r.x,r.y),h.save(),h.shadowColor="rgba(240,255,188,0.55)",h.shadowBlur=14,h.fillStyle=tt,h.beginPath(),h.arc(i,s,u,0,2*Math.PI),h.fill(),h.restore(),h.save(),h.fillStyle="rgba(31,31,27,0.85)",h.beginPath(),h.arc(i,s,.22*u,0,2*Math.PI),h.fill(),h.restore(),0<n&&(l=u+1.8*u*Math.max(0,Math.min(1,n/950)),h.save(),h.strokeStyle=at,h.lineWidth=2.5,h.beginPath(),h.arc(i,s,l,0,2*Math.PI),h.stroke(),h.restore()))}drawPath(a,t,e){var o=this.ctx,[t,i]=(o.save(),o.strokeStyle=t,o.globalAlpha=.5,o.lineWidth=e,o.lineCap="round",o.lineJoin="round",o.beginPath(),this.toPx(a[0].x,a[0].y));o.moveTo(t,i);for(let e=0;e<a.length-1;e++){var s=a[e],r=a[e+1];if(s.smooth&&3<=a.length)for(let t=1;t<=24;t++){var n=t/24,n=Pt(a,e,n),[n,l]=this.toPx(n.x,n.y);o.lineTo(n,l)}else{var[s,r]=this.toPx(r.x,r.y);o.lineTo(s,r)}}o.stroke(),o.restore();var t=a[a.length-1],i=a[a.length-2],[t,u]=this.toPx(t.x,t.y),[i,h]=this.toPx(i.x,i.y);this.drawArrowhead(t,u,i,h,.65*e)}drawArrowhead(t,e,a,o,i){var s=this.ctx,o=Math.atan2(e-o,t-a);s.save(),s.fillStyle=E,s.beginPath(),s.moveTo(t,e),s.lineTo(t-i*Math.cos(o-Math.PI/6),e-i*Math.sin(o-Math.PI/6)),s.lineTo(t-i*Math.cos(o+Math.PI/6),e-i*Math.sin(o+Math.PI/6)),s.closePath(),s.fill(),s.restore()}drawFeedback(t,e){var a,o,i,s,e=e-t.spawnedAt;600<=e||(a=1-(e=e/600),[o,i]=this.toPx(t.x,t.y),(s=this.ctx).save(),s.globalAlpha=a,s.fillStyle=t.color,s.font=`bold ${Math.round(.05*Math.min(this.width,this.height))}px sans-serif`,s.textAlign="center",s.textBaseline="middle",s.fillText(t.text,o,i-20*e),s.restore())}roundRect(t,e,a,o,i){var s=this.ctx,i=Math.min(i,a/2,o/2);s.beginPath(),s.moveTo(t+i,e),s.lineTo(t+a-i,e),s.quadraticCurveTo(t+a,e,t+a,e+i),s.lineTo(t+a,e+o-i),s.quadraticCurveTo(t+a,e+o,t+a-i,e+o),s.lineTo(t+i,e+o),s.quadraticCurveTo(t,e+o,t,e+o-i),s.lineTo(t,e+i),s.quadraticCurveTo(t,e,t+i,e),s.closePath()}drawCursor(t,e){var[t,e]=this.toPx(t,e),a=this.ctx,o=.012*Math.min(this.width,this.height);a.save(),a.fillStyle="rgba(240,255,188,0.9)",a.shadowColor="rgba(240,255,188,0.6)",a.shadowBlur=8,a.beginPath(),a.arc(t,e,o,0,2*Math.PI),a.fill(),a.restore()}},it=new Set(["KeyZ","KeyX"]),st=class{constructor(t){var e;this.element=t,this.listeners={down:[],up:[],move:[]},this.pointerActive=!1,this.keysHeld=new Set,this.lastPos={x:.5,y:.5},this.hasPointer=!1,this.disposed=!1,this.preventCtx=t=>t.preventDefault(),this.handleDown=t=>{var e,a;0===t.button&&(this.pointerActive=!0,null!=(a=(e=this.element).setPointerCapture)&&a.call(e,t.pointerId),a=this.toRelative(t),this.lastPos=a,this.hasPointer=!0,this.fire(this.listeners.down,a))},this.handleUp=t=>{this.pointerActive&&(this.pointerActive=!1,t=this.toRelative(t),this.lastPos=t,0===this.keysHeld.size)&&this.fire(this.listeners.up,t)},this.handleMove=t=>{t=this.toRelative(t);this.lastPos=t,this.hasPointer=!0,this.fire(this.listeners.move,t)},this.handleEnter=t=>{this.hasPointer=!0,this.lastPos=this.toRelative(t)},this.handleLeave=()=>{this.hasPointer=!1},this.handleKeyDown=t=>{var e;it.has(t.code)&&!t.repeat&&this.hasPointer&&(e=0<this.keysHeld.size||this.pointerActive,this.keysHeld.add(t.code),t.preventDefault(),e||this.fire(this.listeners.down,this.lastPos))},this.handleKeyUp=t=>{it.has(t.code)&&this.keysHeld.has(t.code)&&(this.keysHeld.delete(t.code),0!==this.keysHeld.size||this.pointerActive||this.fire(this.listeners.up,this.lastPos))},this.win=null!=(e=null==(e=t.ownerDocument)?void 0:e.defaultView)?e:window,t.addEventListener("pointerdown",this.handleDown),t.addEventListener("pointerup",this.handleUp),t.addEventListener("pointercancel",this.handleUp),t.addEventListener("pointermove",this.handleMove),t.addEventListener("pointerenter",this.handleEnter),t.addEventListener("pointerleave",this.handleLeave),t.addEventListener("contextmenu",this.preventCtx),this.win.addEventListener("keydown",this.handleKeyDown),this.win.addEventListener("keyup",this.handleKeyUp)}dispose(){this.disposed||(this.disposed=!0,this.element.removeEventListener("pointerdown",this.handleDown),this.element.removeEventListener("pointerup",this.handleUp),this.element.removeEventListener("pointercancel",this.handleUp),this.element.removeEventListener("pointermove",this.handleMove),this.element.removeEventListener("pointerenter",this.handleEnter),this.element.removeEventListener("pointerleave",this.handleLeave),this.element.removeEventListener("contextmenu",this.preventCtx),this.win.removeEventListener("keydown",this.handleKeyDown),this.win.removeEventListener("keyup",this.handleKeyUp))}onDown(t){this.listeners.down.push(t)}onUp(t){this.listeners.up.push(t)}onMove(t){this.listeners.move.push(t)}isHeld(){return this.pointerActive||0<this.keysHeld.size}getCursor(){return this.hasPointer?this.lastPos:null}toRelative(t){var e=this.element.getBoundingClientRect();return{x:(t.clientX-e.left)/e.width,y:(t.clientY-e.top)/e.height}}fire(t,e){for(var a of t)a(e)}},rt=class{constructor(t,e,a){this.canvas=t,this.cb=a,this.nextIdx=0,this.score=kt(),this.feedback=[],this.rafId=null,this.active=null,this.running=!1,this.disposed=!1,this.lastReportedScore=-1,this.lastReportedHits=-1,this.loop=()=>{if(this.running){var t=this.cb.getSongTimeMs();let e=performance.now();this.autoStartDrags(t),this.processMisses(t),this.updateActiveHold(t);t=this.collectVisible(t);this.feedback=this.feedback.filter(t=>e-t.spawnedAt<600),this.renderer.render({visibleNotes:t,feedback:this.feedback,cursor:this.input.getCursor()},e),this.score.score===this.lastReportedScore&&this.score.hits===this.lastReportedHits||this.reportScore(),this.nextIdx>=this.map.notes.length&&null==this.active?(this.running=!1,this.cb.onMapEnd()):this.rafId=requestAnimationFrame(this.loop)}},this.handlePointerDown=t=>{var e,a,o;this.active||(e=this.cb.getSongTimeMs(),(a=this.findHittable(e,t))&&(o=e-a.time,o=o,"miss"!==(o=(o=Math.abs(o))<=X?"perfect":o<=Z?"good":o<=I?"ok":"miss"))&&("single"===a.type?(this.judge(a,a.x,a.y,o),this.consumeUpTo(this.map.notes.indexOf(a))):null!=a.points&&2<=a.points.length&&!Ot(a.points)||(this.active={note:a,state:"active",lastPointer:t,auto:!1,inRangeMs:0,outOfRangeMs:0,lastUpdateMs:e},"perfect"!==o&&this.feedback.push({x:a.x,y:a.y-.05,text:o.toUpperCase(),color:It(o),spawnedAt:performance.now()}),this.consumeUpTo(this.map.notes.indexOf(a)))))},this.handlePointerUp=t=>{this.active&&!this.active.auto&&this.resolveActive(this.cb.getSongTimeMs(),!0)},this.handlePointerMove=t=>{this.active&&(this.active.lastPointer=t)},this.map=e,this.renderer=new ot(t),this.input=new st(t),this.input.onDown(this.handlePointerDown),this.input.onUp(this.handlePointerUp),this.input.onMove(this.handlePointerMove),this.renderer.resize()}start(){this.running||(this.skipPastNotes(),this.running=!0,console.log("[Osutify] engine start notes=",this.map.notes.length,"nextIdx=",this.nextIdx,"songMs=",this.cb.getSongTimeMs()),this.loop())}stop(){this.running=!1,null!=this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=null}dispose(){this.disposed||(this.disposed=!0,this.stop(),this.input.dispose())}resize(){this.renderer.resize()}setMap(t){this.map=t,this.nextIdx=0,this.score=kt(),this.feedback=[],this.active=null,this.lastReportedScore=-1,this.lastReportedHits=-1,this.reportScore()}skipPastNotes(){for(var t=this.cb.getSongTimeMs();this.nextIdx<this.map.notes.length&&this.map.notes[this.nextIdx].time<t-I;)this.nextIdx++}collectVisible(e){var a=[],o=null!=this.active;for(let t=this.nextIdx;t<this.map.notes.length;t++){var i=this.map.notes[t],s=i.time-e;if(950<s)break;s<-I||a.push({note:i,msUntilHit:s,songMs:e,dimmed:o})}if(this.active){var r,n,l=this.active.note,u=l.points&&2<=l.points.length?l.points[l.points.length-1].time-l.points[0].time:0,u=0<u?Math.min(1,(e-l.time)/u):0;let t="broken"===this.active.state?"broken":"active";this.active.auto&&l.points&&2<=l.points.length&&(n=this.input.getCursor(),r=N(l.points,e),n=!!n&&Math.hypot(n.x-r.x,n.y-r.y)<=.09*l.size*1.5,t=n?"active":"broken"),a.push({note:l,msUntilHit:0,holdState:t,holdProgress:u,songMs:e})}return a}autoStartDrags(t){var e;this.active||this.nextIdx>=this.map.notes.length||"hold"!==(e=this.map.notes[this.nextIdx]).type||!e.points||e.points.length<2||Ot(e.points)||e.time<=t&&(this.active={note:e,state:"active",auto:!0,inRangeMs:0,outOfRangeMs:0,lastUpdateMs:t},this.nextIdx++)}processMisses(t){for(;this.nextIdx<this.map.notes.length;){var e=this.map.notes[this.nextIdx],a=t-e.time;if(!(I<a))break;this.judge(e,e.x,e.y,"miss"),this.nextIdx++}}updateActiveHold(t){if(this.active){var e=this.active.note,a=e.points;if(!a||a.length<2)this.resolveActive(t,!1);else{var o,i=("hold"===(i=e).type&&i.points&&0!==i.points.length?i.points[i.points.length-1]:i).time;if(this.active.auto)o=Math.max(0,t-this.active.lastUpdateMs),this.active.lastUpdateMs=t,r=this.input.getCursor(),s=N(a,Math.min(t,i)),r&&Math.hypot(r.x-s.x,r.y-s.y)<=.09*e.size*1.5?this.active.inRangeMs+=o:this.active.outOfRangeMs+=o;else if("active"===this.active.state){var s,r=this.input.getCursor();if(r&&(s=N(a,t),Math.hypot(r.x-s.x,r.y-s.y)>.09*e.size*1.5)&&(this.active.state="broken",this.active.brokenAt=t),!this.input.isHeld())return void this.resolveActive(t,!0)}i<=t&&this.resolveActive(t,!1)}}}resolveActive(a,o){if(this.active){var i,s=this.active,r=s.note,n=r.points,l=n[0].time,u=n[n.length-1].time,h=u-l;let t,e;e=s.auto?(i=0<(i=s.inRangeMs+s.outOfRangeMs)?s.inRangeMs/i:0,t=.92<=i?"perfect":.75<=i?"good":.5<=i?"ok":"miss",N(n,Math.min(a,u))):(i="broken"===s.state?null!=(i=s.brokenAt)?i:a:Math.min(a,u),a=0<h?Math.max(0,Math.min(1,(i-l)/h)):1,t="broken"===s.state?.4<=a?"ok":"miss":!o&&.95<=a||.9<=a?"perfect":.7<=a?"good":.4<=a?"ok":"miss",N(n,i)),this.judge(r,e.x,e.y,t),this.active=null}}findHittable(e,a){for(let t=this.nextIdx;t<this.map.notes.length;t++){var o=this.map.notes[t];if(950<o.time-e)break;var i=e-o.time;if(!(I<i)&&!(i<-I)){var i=(o.points?o.points[0]:o).x,s=(o.points?o.points[0]:o).y;if(Math.hypot(a.x-i,a.y-s)<=.1*o.size*1.4)return o}}return null}consumeUpTo(t){for(;this.nextIdx<=t;){var e=this.map.notes[this.nextIdx];this.nextIdx<t&&this.judge(e,e.x,e.y,"miss"),this.nextIdx++}}judge(t,e,a,o){Mt(this.score,o),this.feedback.push({x:e,y:a-.05,text:"perfect"===o?"PERFECT":"good"===o?"GOOD":"ok"===o?"OK":"MISS",color:It(o),spawnedAt:performance.now()})}reportScore(){this.lastReportedScore=this.score.score,this.lastReportedHits=this.score.hits;var t=0===(t=this.score).hits?1:t.weightedAccSum/t.hits;this.cb.onScoreChange({score:this.score.score,combo:this.score.combo,maxCombo:this.score.maxCombo,accuracy:t,grade:.95<=(t=t)?"S":.85<=t?"A":.7<=t?"B":.55<=t?"C":"D",perfect:this.score.perfect,good:this.score.good,ok:this.score.ok,miss:this.score.miss,totalNotes:this.map.notes.length,processedNotes:this.score.hits})}},nt=()=>{let o=(0,O.useRef)(null),i=(0,O.useRef)(null),s=x(t=>t.map),r=x(t=>t.setScore),n=x(t=>t.resetScore);return(0,O.useEffect)(()=>{if(o.current&&s){var a=o.current;console.log("[Osutify] mounting engine with map",s.title,"notes:",s.notes.length),n();let t=new rt(a,s,{getSongTimeMs:()=>{try{return Spicetify.Player.getProgress()}catch(t){return 0}},onScoreChange:t=>r(t),onMapEnd:()=>{}}),e=((i.current=t).start(),new ResizeObserver(()=>t.resize()));return e.observe(a),()=>{e.disconnect(),t.dispose(),i.current=null}}console.log("[Osutify] GameCanvas skip mount",{hasCanvas:!!o.current,hasMap:!!s})},[s,r,n]),O.default.createElement("canvas",{ref:o,className:"osu-canvas"})},T=a(l()),lt=()=>{var t=x(t=>t.score),e=x(t=>t.map);return T.default.createElement("div",{className:"osu-hud"},T.default.createElement("div",{className:"osu-hud-row osu-hud-top"},T.default.createElement("div",{className:"osu-hud-score"},t.score.toLocaleString()),T.default.createElement("div",{className:"osu-hud-acc"},(100*t.accuracy).toFixed(2),"%")),T.default.createElement("div",{className:"osu-hud-row osu-hud-bottom"},T.default.createElement("div",{className:"osu-hud-combo"},t.combo,"x"),T.default.createElement("div",{className:"osu-hud-grade osu-grade-"+t.grade},t.grade)),e&&T.default.createElement("div",{className:"osu-hud-mapinfo"},T.default.createElement("span",{className:"osu-hud-mapname"},e.title),T.default.createElement("span",{className:"osu-hud-mapdiff"},"★ ",e.difficulty.toFixed(1)," · ",e.difficultyName)))},ut=()=>{var t=x(t=>t.open);let e=x(t=>t.setOpen);var a=x(t=>t.difficulty);let o=x(t=>t.cycleDifficulty);var i,s,r,n=x(t=>t.adaptiveTheme),l=x(t=>t.albumColors);let u=x(t=>t.toggleAdaptiveTheme);return t?(i=(t=n&&null!=l)?l.vibrant:"#f0ffbc",s=t?l.prominent:"#bcfffc",r=t?l.lightVibrant:"#dbdd78",l=t?{"--ck-a1":l.vibrant,"--ck-a2":l.darkVibrant,"--ck-a3":l.prominent,"--ck-a4":l.lightVibrant}:{},P.default.createElement("div",{className:"osu-popup osu-popout "+(t?"osu-adaptive":""),style:g({position:"fixed",inset:0,width:"100vw",height:"100vh",zIndex:1},l)},P.default.createElement("div",{className:"osu-popup-header"},P.default.createElement("div",{className:"osu-popup-titlebar"},P.default.createElement("span",{className:"osu-popup-title"},"Osutify"),P.default.createElement("a",{className:"osu-watermark",href:"https://criskop.com",target:"_blank",rel:"noopener noreferrer",title:"Hecho por CrisKop — criskop.com"},"by ",P.default.createElement("span",{className:"osu-watermark-name"},"CrisKop"))),P.default.createElement("div",{className:"osu-popup-actions"},P.default.createElement("button",{type:"button",className:"osu-theme-btn "+(n?"osu-theme-on":"osu-theme-off"),title:n?"Tema adaptativo (colores de la canción) — click para volver al tema CrisKop":"Tema CrisKop — click para usar colores de la canción",onClick:()=>u()},P.default.createElement("span",{className:"osu-theme-swatch",style:{background:i}}),P.default.createElement("span",{className:"osu-theme-swatch",style:{background:s}}),P.default.createElement("span",{className:"osu-theme-swatch",style:{background:r}})),P.default.createElement("button",{type:"button",className:"osu-diff-btn osu-diff-"+a,title:`Dificultad: ${p[a]} (click para cambiar)`,onClick:()=>o()},p[a]),P.default.createElement("button",{type:"button",title:"Cerrar",onClick:()=>e(!1)},"✕"))),P.default.createElement("div",{className:"osu-popup-body"},P.default.createElement(nt,null),P.default.createElement(lt,null)))):null},ht=`
.osu-popup {
  background: linear-gradient(135deg, #1e2a31 0%, #1f1f1b 100%);
  border: 1px solid rgba(190, 191, 171, 0.18);
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(240, 255, 188, 0.04);
  color: #fff;
  font-family: var(--font-family, "Spotify Mix", system-ui, sans-serif);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  backdrop-filter: blur(12px);
}
.osu-popup.osu-fullscreen, .osu-popup.osu-popout {
  border-radius: 0;
  border: none;
  background: linear-gradient(135deg, #1e2a31 0%, #1f1f1b 100%);
  position: relative;
  overflow: hidden;
}
.osu-popup.osu-adaptive {
  background:
    radial-gradient(ellipse 100% 80% at 20% 15%, var(--ck-a1, #354a55) 0%, transparent 70%),
    radial-gradient(ellipse 90% 90% at 85% 85%, var(--ck-a3, #1e2a31) 0%, transparent 70%),
    radial-gradient(ellipse 80% 100% at 50% 110%, var(--ck-a4, #bcfffc) 0%, transparent 65%),
    linear-gradient(160deg, var(--ck-a2, #1e2a31) 0%, #08080a 100%);
  transition: background 0.8s ease;
}
.osu-popup.osu-adaptive::before {
  content: "";
  position: absolute;
  inset: -25%;
  background:
    radial-gradient(circle 45% at 25% 30%, var(--ck-a1, transparent) 0%, transparent 60%),
    radial-gradient(circle 40% at 75% 65%, var(--ck-a4, transparent) 0%, transparent 60%),
    radial-gradient(circle 35% at 50% 90%, var(--ck-a3, transparent) 0%, transparent 60%);
  opacity: 0.85;
  filter: blur(45px) saturate(1.3);
  animation: osu-mesh-shift 18s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}
.osu-popup.osu-adaptive::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 25%, rgba(8, 8, 10, 0.6) 95%);
  pointer-events: none;
  z-index: 0;
}
.osu-popup.osu-adaptive .osu-popup-header,
.osu-popup.osu-adaptive .osu-popup-body {
  position: relative;
  z-index: 1;
}
.osu-popup.osu-adaptive .osu-popup-header {
  background: rgba(31, 31, 27, 0.55);
  backdrop-filter: blur(8px);
}
@keyframes osu-mesh-shift {
  0%, 100% {
    transform: translate(0%, 0%) scale(1) rotate(0deg);
  }
  33% {
    transform: translate(6%, -4%) scale(1.12) rotate(8deg);
  }
  66% {
    transform: translate(-5%, 6%) scale(1.08) rotate(-6deg);
  }
}
.osu-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: rgba(65, 65, 65, 0.38);
  border-bottom: 1px solid rgba(190, 191, 171, 0.1);
  cursor: move;
  flex: 0 0 auto;
  font-size: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.osu-popup.osu-fullscreen .osu-popup-header,
.osu-popup.osu-popout .osu-popup-header {
  cursor: default;
}
.osu-popup-title { font-weight: 700; color: #f0ffbc; }
.osu-popup-actions { display: flex; gap: 4px; }
.osu-popup-actions button {
  background: transparent;
  color: rgba(190, 191, 171, 0.8);
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.osu-popup-actions button:hover {
  background: rgba(240, 255, 188, 0.1);
  color: #f0ffbc;
}
.osu-popup-actions .osu-btn-active {
  background: rgba(240, 255, 188, 0.18);
  color: #f0ffbc;
}
.osu-popup-actions .osu-diff-btn {
  width: auto;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  border: 1px solid rgba(190, 191, 171, 0.18);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.osu-popup-actions .osu-diff-btn:hover {
  background: rgba(240, 255, 188, 0.12);
}
.osu-diff-easy { color: #bcfffc; border-color: rgba(188, 255, 252, 0.35) !important; }
.osu-diff-easy:hover { background: rgba(188, 255, 252, 0.12) !important; }
.osu-diff-normal { color: #f0ffbc; border-color: rgba(240, 255, 188, 0.35) !important; }
.osu-diff-normal:hover { background: rgba(240, 255, 188, 0.12) !important; }
.osu-diff-hard { color: #dbdd78; border-color: rgba(219, 221, 120, 0.45) !important; }
.osu-diff-hard:hover { background: rgba(219, 221, 120, 0.15) !important; }
.osu-diff-expert {
  color: #ffb4a2;
  border-color: rgba(255, 180, 162, 0.5) !important;
  text-shadow: 0 0 6px rgba(255, 180, 162, 0.5);
}
.osu-diff-expert:hover { background: rgba(255, 180, 162, 0.15) !important; }
.osu-popup-actions .osu-theme-btn {
  width: auto;
  padding: 0 6px;
  gap: 3px;
  border: 1px solid rgba(190, 191, 171, 0.18);
}
.osu-theme-btn .osu-theme-swatch {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
  transition: filter 0.2s, transform 0.2s;
}
.osu-theme-btn.osu-theme-off .osu-theme-swatch {
  filter: grayscale(1) brightness(0.7);
}
.osu-theme-btn:hover .osu-theme-swatch {
  transform: scale(1.15);
  filter: none;
}
.osu-theme-btn.osu-theme-on {
  border-color: rgba(240, 255, 188, 0.35) !important;
  background: rgba(240, 255, 188, 0.06);
}
.osu-resize { position: absolute; z-index: 10; }
.osu-resize-n { top: 0; left: 8px; right: 8px; height: 6px; }
.osu-resize-s { bottom: 0; left: 8px; right: 8px; height: 6px; }
.osu-resize-e { top: 8px; bottom: 8px; right: 0; width: 6px; }
.osu-resize-w { top: 8px; bottom: 8px; left: 0; width: 6px; }
.osu-resize-ne { top: 0; right: 0; width: 12px; height: 12px; }
.osu-resize-nw { top: 0; left: 0; width: 12px; height: 12px; }
.osu-resize-se { bottom: 0; right: 0; width: 14px; height: 14px; }
.osu-resize-sw { bottom: 0; left: 0; width: 12px; height: 12px; }
.osu-resizable {
  outline: 2px dashed rgba(240, 255, 188, 0.7);
  outline-offset: -2px;
  box-shadow: 0 0 0 1px rgba(240, 255, 188, 0.2), 0 10px 40px rgba(0, 0, 0, 0.7);
}
.osu-resizable .osu-resize { background: rgba(240, 255, 188, 0.08); }
.osu-resizable .osu-resize:hover { background: rgba(240, 255, 188, 0.25); }
.osu-resizable .osu-resize-se {
  background: linear-gradient(135deg, transparent 0%, transparent 40%,
    rgba(240, 255, 188, 0.85) 40%, rgba(240, 255, 188, 0.85) 100%);
}
.osu-popup-body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  container-type: size;
  container-name: osubody;
}
.osu-canvas {
  width: 100%; height: 100%; display: block; touch-action: none;
}
.osu-hud {
  position: absolute; inset: 0; pointer-events: none;
  padding: clamp(2px, 2cqw, 8px) clamp(3px, 2.5cqw, 10px);
  display: flex; flex-direction: column;
  justify-content: space-between; font-variant-numeric: tabular-nums;
}
.osu-hud-row {
  display: flex; align-items: center; justify-content: space-between;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
}
.osu-hud-score {
  font-size: clamp(10px, 5cqw, 18px);
  font-weight: 700;
  color: #f0ffbc;
  text-shadow: 0 0 12px rgba(240, 255, 188, 0.4), 0 1px 6px rgba(0, 0, 0, 0.9);
}
.osu-hud-acc {
  font-size: clamp(8px, 3.6cqw, 13px);
  opacity: 0.75;
  color: #bebfab;
}
.osu-hud-combo {
  font-size: clamp(12px, 6cqw, 22px);
  font-weight: 700;
  color: #dbdd78;
  text-shadow: 0 0 10px rgba(219, 221, 120, 0.5), 0 1px 6px rgba(0, 0, 0, 0.9);
}
.osu-hud-grade {
  font-size: clamp(12px, 6cqw, 22px);
  font-weight: 800;
  padding: 0 clamp(3px, 2cqw, 8px);
  border-radius: 6px;
  background: rgba(31, 31, 27, 0.6);
  border: 1px solid rgba(190, 191, 171, 0.15);
}
.osu-grade-S { color: #dbdd78; text-shadow: 0 0 10px rgba(219, 221, 120, 0.6); }
.osu-grade-A { color: #f0ffbc; text-shadow: 0 0 10px rgba(240, 255, 188, 0.6); }
.osu-grade-B { color: #bcfffc; text-shadow: 0 0 10px rgba(188, 255, 252, 0.6); }
.osu-grade-C { color: #f29e4c; }
.osu-grade-D { color: #ff4d4d; }
.osu-hud-mapinfo {
  position: absolute;
  bottom: clamp(2px, 1.5cqw, 6px);
  left: clamp(4px, 2.5cqw, 10px);
  right: clamp(4px, 2.5cqw, 10px);
  display: flex; justify-content: space-between;
  font-size: clamp(7px, 2.8cqw, 10px);
  color: rgba(190, 191, 171, 0.6);
  pointer-events: none;
  white-space: nowrap; overflow: hidden;
}
.osu-popup-titlebar {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
  flex: 1 1 auto;
}
.osu-watermark {
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.4px;
  text-transform: none;
  color: rgba(190, 191, 171, 0.55);
  text-decoration: none;
  user-select: none;
  white-space: nowrap;
  transition: color 0.2s, text-shadow 0.2s;
}
.osu-watermark:hover {
  color: #f0ffbc;
  text-shadow: 0 0 6px rgba(240, 255, 188, 0.5);
}
.osu-watermark-name {
  color: rgba(240, 255, 188, 0.85);
  font-weight: 700;
}
.osu-watermark:hover .osu-watermark-name {
  color: #f0ffbc;
}
body.osu-popout-body {
  margin: 0; padding: 0; overflow: hidden;
  background: linear-gradient(135deg, #1e2a31 0%, #1f1f1b 100%);
  height: 100vh; width: 100vw;
}
`,z=null,ct=`
.osu-drag-region {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 0;
  -webkit-app-region: drag;
  z-index: 99999;
  pointer-events: none;
}
.osu-popup-header { -webkit-app-region: drag; }
.osu-popup-header button { -webkit-app-region: no-drag; }
.osu-canvas, .osu-resize, .osu-popup-actions {
  -webkit-app-region: no-drag;
}
`,dt=async function(){{for(var e,a;!(null!=Spicetify&&Spicetify.showNotification&&null!=Spicetify&&Spicetify.Player&&null!=(e=null==Spicetify?void 0:Spicetify.Playbar)&&e.Button&&null!=(e=Spicetify.ReactDOM)&&e.createRoot);)await new Promise(t=>setTimeout(t,200));let t=0;for(;(null==(a=Spicetify.Player.data)||!a.item)&&t<50;)await new Promise(t=>setTimeout(t,200)),t++}await 0;let o=new Spicetify.Playbar.Button("Osutify",'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3.25" y="0.5" width="1.5" height="5" rx="0.75" transform="rotate(-25 4 3)"/><rect x="7.25" y="0.5" width="1.5" height="5" rx="0.75"/><rect x="11.25" y="0.5" width="1.5" height="5" rx="0.75" transform="rotate(25 12 3)"/><path fill-rule="evenodd" d="M8 7.4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6zm0 1.7a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z"/></svg>',()=>{x.getState().toggleOpen()},!1,x.getState().open),i=(o.register(),x.getState().open),s=x.getState().difficulty;x.subscribe(t=>{o.active=t.open,t.open!==i&&(i=t.open,t.open?(Et(),t.map||D()):z&&(z.close(),z=null)),t.difficulty!==s&&(s=t.difficulty,(async()=>{var t=x.getState().track;if(t)try{var e=await wt(t,x.getState().difficulty);console.log("[Osutify] map regenerated",e.title,"notes:",e.notes.length),x.getState().setMap(e),x.getState().resetScore()}catch(t){console.error("[Osutify] regen failed",t)}else await D()})())});{var r=()=>{D()};let t=()=>r();Spicetify.Player.addEventListener("songchange",t)}await D(),Spicetify.showNotification("Osutify ready")},(async()=>{await dt()})()})();