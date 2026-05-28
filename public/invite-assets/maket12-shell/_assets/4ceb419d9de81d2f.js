(globalThis["webpackChunk_canva_web"] = globalThis["webpackChunk_canva_web"] || []).push([[77828],{

/***/ 385379:
function(_, __, __webpack_require__) {__webpack_require__.n_x = __webpack_require__.n;const __web_req__ = __webpack_require__;__web_req__(905716);globalThis._5f74ec40302898c5a55451c9fbd04240 = globalThis._5f74ec40302898c5a55451c9fbd04240 || {};(function(__c) {var qxc=async function(a,b,c){const d=pxc()();try{const e=__c.y(a.zl.context),f=d.r(await d.s(a.fetch(b.url,{signal:c})));if(!f.ok)throw Error(`Audio file fetch failed with ${f.status}`);const g=d.r(await d.s(f.arrayBuffer()));return new Promise((h,k)=>{e.decodeAudioData(g,h,k)})}finally{d.s()}},sxc=function(a,b,c,d){if(d){var e=a.cache.get(b);e||(e={buffer:c,rZ:new Set},c.catch(rxc.wrap(()=>{a.cache.delete(b)})),a.cache.set(b,e));e.rZ.add(d);d.addEventListener("abort",()=>{e?.rZ.delete(d);e&&e.rZ.size===
0&&a.cache.delete(b);e=void 0},{once:!0})}},rxc=__webpack_require__(245307).Fm;var pxc=__webpack_require__(75402)._;var txc,uxc;txc=(...a)=>fetch(...a);
uxc=class{async mc(a,b,c){const d=pxc()();try{__c.v(b.fa>=0&&b.J>=0);const m=__c.pp(this.Yk,a);if(m){var e=this.cache.get(a)?.buffer||qxc(this,m,c);sxc(this,a,e,c);var f=d.r(await d.s(e)),g=b.J-f.duration*1E6;if(b.fa===0&&(g>=0||Math.abs(g)<=100))return f;var h=b.J/1E6*f.sampleRate;if(h<=0)return f;var k=new AudioBuffer({length:h,numberOfChannels:f.numberOfChannels,sampleRate:f.sampleRate}),l=Math.floor(f.sampleRate*b.fa/1E6);for(a=0;a<f.numberOfChannels;a++){const n=f.getChannelData(a).subarray(l,
l+h);k.copyToChannel(n,a)}return k}}finally{d.s()}}constructor(a,b,c=txc){this.zl=a;this.Yk=b;this.fetch=c;this.cache=new Map}};__c.Jza={};__c.Jza.brb=uxc;
}).call(globalThis, globalThis._5f74ec40302898c5a55451c9fbd04240);}

}])
//# sourceMappingURL=sourcemaps/4ceb419d9de81d2f.js.map