/* Kapitel 6 · Was niemand weiß
   Hawking-Formeln und Zeichnung unverändert aus quellen/06-was-niemand-weiss.html übernommen. */
(function(){
const{reduce,css,$,nf,fit}=DS;
const SUP=['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
const sup=n=>(n<0?'⁻':'')+String(Math.abs(n)).split('').map(c=>SUP[+c]).join('');
function sci(v,dig){if(v===0)return '0';const e=Math.floor(Math.log10(v));const m=v/Math.pow(10,e);
  if(e>=-2&&e<6)return nf(v,dig);return nf(m,1)+' · 10'+sup(e);}
const MSUN=1.989e30, AGE=1.38e10, CMB=2.725;
let lg=30.30;
const mI=$('mass');
mI.addEventListener('input',()=>{lg=mI.value/100;upd();});
document.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>{lg=+b.dataset.lg;mI.value=Math.round(lg*100);DS.syncRange(mI);upd();});
function fmtLen(m){if(m<1e-6)return sci(m*1e15,1)+' fm';if(m<1e-3)return nf(m*1e6,1)+' µm';if(m<1)return nf(m*1000,m<0.01?2:1)+' mm';if(m<1000)return nf(m,1)+' m';
  if(m<1e9)return nf(m/1000,0)+' km';return sci(m/1000,1)+' km';}
function fmtMass(kg){const s=kg/MSUN;if(s>=1e-3)return (s>=1e4?sci(s,1):nf(s,s<1?3:1))+' Sonnenmassen';return sci(kg,1)+' kg';}
function fmtT(K){if(K>=1e6)return sci(K,1)+' K';if(K>=1)return nf(K,1)+' K';return sci(K,2)+' K';}
function fmtYears(y){if(y<1/365)return nf(y*365*24*3600,0)+' s';if(y<1)return nf(y*365,0)+' Tage';if(y<1e6)return nf(y,0)+' Jahre';return sci(y,1)+' Jahre';}
let st={};
function upd(){
  const kg=Math.pow(10,lg);const rs=1.485e-27*kg;const T=1.227e23/kg;const yrs=8.41e-17*kg*kg*kg/3.156e7;
  st={kg,rs,T,yrs};
  $('massV').textContent=fmtMass(kg);$('hR').textContent=fmtLen(rs);$('hT').textContent=fmtT(T);$('hL').textContent=fmtYears(yrs);
  const ratio=yrs/AGE;
  $('hC').textContent=ratio<1?nf(ratio*100,ratio<0.01?3:1)+' % des Weltalters':sci(ratio,1)+'× Weltalter';
  let t;
  if(yrs<AGE*1.2&&yrs>AGE*.8)t='Ein Loch mit dieser Masse, entstanden kurz nach dem Urknall, würde genau jetzt verdampfen. Es wäre kleiner als ein Atomkern und heißer als jeder Stern.';
  else if(yrs<AGE)t='Dieses Loch wäre längst verdampft, wenn es beim Urknall entstanden wäre. Es ist extrem heiß und strahlt mit großer Leistung.';
  else if(T>CMB)t='Heißer als das Restlicht des Urknalls, also verdampft es tatsächlich, nur unvorstellbar langsam.';
  else t='Kälter als das Restlicht des Urknalls (2,7 K). Es schluckt mehr Strahlung, als es abgibt, und wächst deshalb heute noch. Verdampfen kann es erst, wenn das Universum noch viel kälter geworden ist.';
  $('hSay').textContent=t;draw();
}
let cvs=null,parts=[],last=performance.now();
function draw(){
  if(!cvs||!st.T)return;const{x,W,H}=cvs;x.fillStyle='#000';x.fillRect(0,0,W,H);
  // Oberer Teil: Loch mit Glühen
  const cx=W/2,cy=H*.33;const tl=Math.log10(st.T);const heat=Math.max(0,Math.min(1,(tl+8)/20));
  const rr=8+Math.max(0,Math.min(1,(lg-10)/31))*34;
  const glow=x.createRadialGradient(cx,cy,rr*.9,cx,cy,rr*(2+heat*3));
  const c=heat<.5?[200+110*heat,90+150*heat,40+80*heat]:[255,235+20*(heat-.5),180+150*(heat-.5)];
  glow.addColorStop(0,'rgba('+c.map(Math.round).join(',')+','+(.12+heat*.75)+')');glow.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=glow;x.beginPath();x.arc(cx,cy,rr*(2+heat*3),0,7);x.fill();
  x.fillStyle='#000';x.beginPath();x.arc(cx,cy,rr,0,7);x.fill();x.strokeStyle='rgba(224,92,193,.6)';x.lineWidth=1;x.stroke();
  x.fillStyle='rgba(235,230,220,.85)';parts.forEach(p=>{x.globalAlpha=Math.max(0,1-p.r/(H*.32));x.fillRect(cx+Math.cos(p.a)*p.r,cy+Math.sin(p.a)*p.r,1.6,1.6);});x.globalAlpha=1;
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';x.fillText('Punkte: Hawking-Strahlung (Rate stark übertrieben)',10,10);
  // Unterer Teil: Zeitachse, logarithmisch in Jahren
  const y0=H*.74,x0=16,x1=W-16;const LMIN=-8,LMAX=100;const X=v=>x0+(x1-x0)*(Math.log10(v)-LMIN)/(LMAX-LMIN);
  x.strokeStyle='rgba(144,151,170,.5)';x.lineWidth=1;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y0);x.stroke();
  x.fillStyle=css('--mute');x.textAlign='center';x.textBaseline='top';
  for(let e=0;e<=100;e+=20){const px=X(Math.pow(10,e));x.fillRect(px,y0-3,1,6);x.fillText('10'+sup(e),px,y0+6);}
  x.textAlign='left';x.fillText('Jahre (jeder Strich: ×10²⁰)',x0,H-16);
  const mark=(v,label,col,up)=>{const px=X(v);x.strokeStyle=col;x.lineWidth=2;x.beginPath();x.moveTo(px,y0-(up?22:-4));x.lineTo(px,y0+(up?0:26));x.stroke();
    x.fillStyle=col;x.textAlign=px>W*.7?'right':'left';x.textBaseline=up?'bottom':'top';x.fillText(label,px+(px>W*.7?-4:4),up?y0-24:y0+28);};
  mark(AGE,'Alter des Universums',css('--cyan'),true);
  const ly=Math.max(Math.pow(10,LMIN),Math.min(Math.pow(10,LMAX),st.yrs));
  x.fillStyle='rgba(242,163,58,.18)';x.fillRect(x0,y0-6,X(ly)-x0,12);
  mark(ly,'Lebensdauer'+(st.yrs>1e100?' (noch länger)':''),css('--amber'),false);
}
function loop(t){const dt=Math.min(.1,(t-last)/1000);last=t;
  if(!reduce&&cvs){const tl=Math.log10(st.T||1e-8);const rate=Math.max(0,(tl+10))*4;
    if(Math.random()<rate*dt)parts.push({a:Math.random()*Math.PI*2,r:10+Math.max(0,Math.min(1,(lg-10)/31))*34,v:40+Math.random()*40});
    parts.forEach(p=>p.r+=p.v*dt);parts=parts.filter(p=>p.r<cvs.H*.32);draw();}}
function resize(){cvs=fit($('cvH'));draw();}
DS.onResize([$('cvH')],resize);
if(!reduce)DS.animate($('cvH'),loop);
upd();resize();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(draw);
})();
