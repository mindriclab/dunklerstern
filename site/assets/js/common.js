/* Dunkler Stern – gemeinsame Helfer für alle Seiten.
   DS.animate(el, fn) ruft fn(now) nur auf, solange el sichtbar ist und der Tab im Vordergrund liegt.
   Alle Kapitel begrenzen ihren Zeitschritt selbst, ein Wiederanlauf nach einer Pause springt also nicht. */
(function(){
'use strict';
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const $=id=>document.getElementById(id);
const nf=(v,d)=>v.toLocaleString('de-DE',{maximumFractionDigits:d,minimumFractionDigits:0});
function fit(cv,maxDpr){const r=cv.getBoundingClientRect();const d=Math.min(window.devicePixelRatio||1,maxDpr||2);
  cv.width=Math.max(2,Math.round(r.width*d));cv.height=Math.max(2,Math.round(r.height*d));
  const x=cv.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x,W:r.width,H:r.height,cv};}

/* ---------- Animationen nur, wenn sichtbar ---------- */
const jobs=[];let raf=0;
const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{
  es.forEach(e=>jobs.forEach(j=>{if(j.el===e.target)j.vis=e.isIntersecting;}));wake();
},{rootMargin:'150px 0px'}):null;
function active(){return !document.hidden&&jobs.some(j=>j.vis);}
function frame(now){raf=0;if(!active())return;for(const j of jobs)if(j.vis)j.fn(now);raf=requestAnimationFrame(frame);}
function wake(){if(!raf&&active())raf=requestAnimationFrame(frame);}
function animate(el,fn){const j={el,fn,vis:!io};jobs.push(j);if(io)io.observe(el);wake();return j;}
document.addEventListener('visibilitychange',wake);

/* ---------- Größenänderungen ---------- */
function onResize(els,fn){window.addEventListener('resize',fn);
  if(window.ResizeObserver){const ro=new ResizeObserver(fn);els.forEach(e=>ro.observe(e));}}

/* ---------- Schieberegler: gefüllter Anteil der Spur ---------- */
function syncRange(el){const mn=+el.min||0,mx=+el.max||100;const p=mx>mn?(el.value-mn)/(mx-mn)*100:0;el.style.setProperty('--p',p+'%');}
document.addEventListener('input',e=>{if(e.target.matches&&e.target.matches('input[type=range]'))syncRange(e.target);});
document.querySelectorAll('input[type=range]').forEach(syncRange);

/* ---------- Kapitelmenü ---------- */
const menu=document.querySelector('.menu');
if(menu){
  document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
}

/* ---------- Lesefortschritt in der Kopfleiste ---------- */
const head=document.querySelector('.site-header');let sq=false;
function progress(){sq=false;const h=document.documentElement;const max=h.scrollHeight-h.clientHeight;
  head.style.setProperty('--read',max>0?Math.min(1,Math.max(0,h.scrollTop/max)).toFixed(4):0);}
if(head&&head.querySelector('.progress')){window.addEventListener('scroll',()=>{if(!sq){sq=true;requestAnimationFrame(progress);}},{passive:true});progress();}

window.DS={reduce,css,$,nf,fit,animate,onResize,syncRange};
})();
