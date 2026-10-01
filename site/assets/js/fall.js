/* Kapitel 4 · Der Fall hinein
   Freier-Fall-Tabellen, Signale und Gezeiten unverändert aus quellen/04-der-fall-hinein.html übernommen. */
(function(){
const{reduce,css,$,nf,fit}=DS;

/* ---------- Physik: Einheiten rₛ = 1, c = 1 ---------- */
const R0=10, A=Math.sqrt(R0-1), K=Math.sqrt(R0*R0*R0/4);
const ETAH=Math.acos(2/R0-1);
const rOf=e=>R0/2*(1+Math.cos(e));
const tauOf=e=>K*(e+Math.sin(e));
const tOf=e=>{const q=Math.tan(e/2);return Math.log(Math.abs((A+q)/(A-q)))+A*(e+R0/2*(e+Math.sin(e)));};
const rstar=r=>r+Math.log(r-1);
const TAU_H=tauOf(ETAH), TAU_END=tauOf(Math.PI);
// außen: Tabelle mit feiner Auflösung kurz vor dem Horizont
const N=6000, OUT=[];
for(let i=0;i<N;i++){const u=i/N;const e=ETAH*(1-Math.pow(1-u,3));const r=rOf(e);
  OUT.push({T:tOf(e)-rstar(r)+rstar(R0),tau:tauOf(e),r});}
for(let i=0;i<N;i++){const a=OUT[Math.max(0,i-1)],b=OUT[Math.min(N-1,i+1)];OUT[i].z=Math.max(0,Math.min(1.2,(b.tau-a.tau)/(b.T-a.T||1e-9)));}
function seen(T){let lo=0,hi=N-1;if(T<=OUT[0].T)return OUT[0];if(T>=OUT[hi].T)return OUT[hi];
  while(hi-lo>1){const m=(lo+hi)>>1;OUT[m].T<=T?lo=m:hi=m;}
  const a=OUT[lo],b=OUT[hi],f=(T-a.T)/(b.T-a.T);return{T,tau:a.tau+(b.tau-a.tau)*f,r:a.r+(b.r-a.r)*f,z:a.z+(b.z-a.z)*f};}
function rAtTau(t){if(t>=TAU_END)return 0;let lo=0,hi=Math.PI;for(let i=0;i<50;i++){const m=(lo+hi)/2;tauOf(m)<t?lo=m:hi=m;}return rOf((lo+hi)/2);}
const PULSE=4, PULSES=[];for(let k=1;k*PULSE<TAU_H;k++){const tt=k*PULSE;let lo=0,hi=N-1;while(hi-lo>1){const m=(lo+hi)>>1;OUT[m].tau<=tt?lo=m:hi=m;}
  const a=OUT[lo],b=OUT[hi],f=(tt-a.tau)/(b.tau-a.tau||1);PULSES.push({tau:tt,T:a.T+(b.T-a.T)*f});}

/* ---------- Massen ---------- */
const MASS=[
 {name:'10 Sonnenmassen',rsKm:29.53},
 {name:'Sagittarius A*, 4,3 Mio. Sonnenmassen',rsKm:4.3e6*2.953},
 {name:'M87*, 6,5 Mrd. Sonnenmassen',rsKm:6.5e9*2.953}];
let mi=1;
const unitSec=()=>MASS[mi].rsKm/299792.458;
function fmtT(units){const s=units*unitSec();
  if(s<1e-3)return nf(s*1e6,0)+' µs';if(s<1)return nf(s*1e3,s<0.01?2:1)+' ms';if(s<120)return nf(s,1)+' s';
  if(s<7200)return nf(s/60,1)+' min';if(s<2*86400)return nf(s/3600,1)+' h';return nf(s/86400,1)+' Tage';}
function fmtKm(km){if(km>=1e9)return nf(km/1.496e8,1)+' AE';if(km>=1e6)return nf(km/1e6,1)+' Mio. km';return nf(Math.round(km),0)+' km';}
function tideG(r){const rs=MASS[mi].rsKm*1000;return 8.988e16*1.8/(rs*rs*Math.pow(Math.max(r,1e-3),3))/9.81;}
function fmtG(g){if(g<1e-3)return 'kaum messbar';if(g<0.1)return nf(g*1000,1)+' tausendstel g';if(g<10)return nf(g,1)+' g';if(g<1e6)return nf(Math.round(g),0)+' g';return 'über eine Million g';}

/* ---------- Zeitsteuerung ---------- */
const RATE=TAU_END/8.5;     // Einheiten pro Sekunde Echtzeit
const S_END=13;
let s=(TAU_H+0.3)/RATE, playing=false, last=performance.now();
$('play').onclick=()=>{s=0;playing=true;last=performance.now();$('pause').textContent='Anhalten';if(reduce){s=S_END;playing=false;}};
$('pause').onclick=()=>{playing=!playing;last=performance.now();$('pause').textContent=playing?'Anhalten':'Weiter';};
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mi=+b.dataset.m;document.querySelectorAll('[data-m]').forEach(z=>z.setAttribute('aria-pressed',z===b));facts();});
function facts(){$('fRs').textContent=fmtKm(MASS[mi].rsKm);$('fStart').textContent=fmtKm(MASS[mi].rsKm*R0);$('fFall').textContent=fmtT(TAU_H);}

/* ---------- Zeichnen ---------- */
let co=null,ci=null;
function scene(g,title){
  const{x,W,H}=g;x.fillStyle='#000';x.fillRect(0,0,W,H);
  const strip=34, top=8, hh=H-strip-top;const cy=top+hh/2;const cx=W*.13;const S=(W*.8)/R0;
  // Sterne
  x.fillStyle='rgba(235,230,220,.35)';for(let i=0;i<60;i++){const px=(i*97.3)%W,py=(i*53.7)%(hh);x.fillRect(px,py+top,1,1);}
  // Horizont
  x.fillStyle='#000';x.beginPath();x.arc(cx,cy,S,0,7);x.fill();
  x.strokeStyle='rgba(224,92,193,.85)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,S,0,7);x.stroke();
  // Skala
  x.strokeStyle='rgba(144,151,170,.3)';x.lineWidth=1;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+R0*S,cy);x.stroke();
  x.font='10px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='center';x.textBaseline='top';
  for(let r=0;r<=R0;r+=2){const px=cx+r*S;x.fillRect(px,cy-3,1,6);x.fillText(r===0?'Mitte':r+' rₛ',px,cy+6);}
  x.textAlign='left';x.fillStyle=css('--magenta');x.fillText('Horizont',cx+S+4,cy-S*.8);
  return{x,W,H,cx,cy,S,strip};
}
function astro(x,px,py,stretch,col,alpha){
  x.save();x.translate(px,py);x.globalAlpha=alpha;
  if(stretch>7){ // zerrissen
    x.strokeStyle=col;x.lineWidth=1.2;x.beginPath();x.moveTo(-40,0);x.lineTo(40,0);x.stroke();
    x.fillStyle=col;for(let i=0;i<14;i++){x.fillRect(-38+i*5.6,(i%2?-1:1)*1,2,1.5);}
  }else{
    const L=16*stretch,w=9/Math.sqrt(stretch);
    x.fillStyle=col;x.beginPath();x.ellipse(0,0,L/2,w/2,0,0,7);x.fill();
    x.fillStyle='rgba(7,8,13,.85)';x.beginPath();x.ellipse(L/2-w*.45,0,w*.32,w*.3,0,0,7);x.fill();
  }
  x.restore();
}
function pulses(o,list,key,now,col){
  const{x,W,H,strip}=o;const y0=H-strip+6;const x0=10,x1=W-10;const Tmax=S_END*RATE;
  x.strokeStyle='rgba(144,151,170,.35)';x.lineWidth=1;x.beginPath();x.moveTo(x0,y0+12);x.lineTo(x1,y0+12);x.stroke();
  x.strokeStyle=col;x.lineWidth=2;
  list.forEach(p=>{if(p[key]<=now){const px=x0+(x1-x0)*Math.min(1,p[key]/Tmax);x.beginPath();x.moveTo(px,y0+4);x.lineTo(px,y0+20);x.stroke();}});
  const pn=x0+(x1-x0)*Math.min(1,now/Tmax);x.fillStyle=css('--ink');x.beginPath();x.arc(pn,y0+12,2.5,0,7);x.fill();
  x.font='10px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='bottom';
  x.fillText(key==='T'?'empfangene Signale':'gesendete Signale',x0,y0+2);
}
function draw(){
  if(!co||!ci)return;const now=s*RATE;
  // außen
  const sv=seen(now);const o=scene(co);
  const z=Math.max(0,Math.min(1,sv.z));const red=Math.pow(z,.5);
  const col='rgb('+Math.round(235*(.55+.45*red)+20*(1-red))+','+Math.round(230*red*red*.9+30*(1-red))+','+Math.round(220*red*red*.85+25*(1-red))+')';
  const alpha=Math.max(0,Math.min(1,Math.pow(z,.45)));
  if(alpha>0.02)astro(o.x,o.cx+sv.r*o.S,o.cy-16,1,col,alpha);
  o.x.font='10px '+css('--mono');o.x.fillStyle=css('--mute');o.x.textAlign='right';o.x.textBaseline='top';o.x.fillText('Beobachter weit rechts →',o.W-10,12);
  pulses(o,PULSES,'T',now,css('--amber'));
  // innen
  const tau=Math.min(now,TAU_END);const r=rAtTau(tau);const i=scene(ci);
  const g=tideG(Math.max(r,.05));const st=g<0.1?1:Math.min(8,1+Math.log10(g/0.1)*0.9);
  if(tau<TAU_END)astro(i.x,i.cx+r*i.S,i.cy-16,st,css('--amber'),1);
  else{i.x.fillStyle=css('--ink');i.x.font='12px '+css('--mono');i.x.textAlign='center';i.x.textBaseline='bottom';i.x.fillText('?',i.cx,i.cy-6);}
  pulses(i,PULSES,'tau',Math.min(now,TAU_H),css('--amber'));
  // Texte
  $('cOut').textContent=fmtT(now);$('cSeen').textContent=fmtT(sv.tau);$('cIn').textContent=fmtT(tau);
  $('cTide').textContent=tau>=TAU_END?'–':fmtG(g);
  $('sayOut').textContent=sv.r>1.6?'Sie fällt und wird schneller, ganz wie erwartet.':
    (z>0.15?'Sie wird langsamer statt schneller. Ihr Bild wird röter und dunkler, die Signale kommen immer seltener.':
     'Sie klebt am Horizont und verblasst. Ihre Uhr scheint stehen zu bleiben. Den Horizont überquert sie von hier aus gesehen nie.');
  let si;
  if(tau<TAU_H)si=(g>100?'Für sie läuft die Zeit normal. Aber die Gezeitenkraft hat sie bei diesem kleinen Loch längst zerrissen.':'Für sie läuft die Zeit ganz normal. Sie fällt immer schneller.');
  else if(tau<TAU_END)si='Sie hat den Horizont überquert. Dort war nichts zu spüren, keine Wand, kein Ruck. Ab jetzt führt jeder Weg nach innen.';
  else si='In der Mitte endet die bekannte Physik. Was hier passiert, weiß niemand.';
  $('sayIn').textContent=si;
}
function loop(t){const dt=Math.min(.1,(t-last)/1000);last=t;if(playing){s+=dt;if(s>=S_END){s=S_END;playing=false;}}draw();}
function resize(){co=fit($('cvOut'));ci=fit($('cvIn'));draw();}
DS.onResize([$('cvOut'),$('cvIn')],resize);
DS.animate($('split'),loop);
facts();resize();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
})();
