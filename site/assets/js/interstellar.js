/* Extra · Interstellar im Faktencheck – Millers-Planet-Rechner
   Zeitdehnung auf der innersten stabilen Kreisbahn (Äquatorebene, mitlaufend) eines rotierenden Lochs
   nach Bardeen, Press & Teukolsky (1972). Einheiten G = c = M = 1, eps = 1 − a = Abstand zur größtmöglichen Drehung.
   Die Formeln sind so umgestellt, dass nahe a = 1 nichts ausgelöscht wird. Geprüft gegen eine Rechnung mit
   60 Stellen Genauigkeit: Abweichung unter 3 · 10⁻¹¹. Ohne Drehung ergibt sich exakt √2. */
(function(){
const{reduce,css,$,nf,fit}=DS;
const YEAR_H=365.25*24, FILM_F=7*YEAR_H, EPS_FILM=1.333e-14, PLANET_H_PER_S=1/8;

/* ---------- Physik ---------- */
function kerr(eps){
  const a=1-eps;
  const c=Math.cbrt(eps*(2-eps));                       // (1 − a²)^(1/3)
  const Z1=1+c*(Math.cbrt(2-eps)+Math.cbrt(eps));
  const Z2=Math.sqrt(3*a*a+Z1*Z1);
  const rm1=2+Z2-Math.sqrt((3-Z1)*(3+Z1+2*Z2));        // Bahnradius − 1
  const r=1+rm1, x=Math.sqrt(r), xm1=rm1/(x+1);
  const D=xm1*xm1*(x+2)-2*eps;                          // = r^1,5 − 3 r^0,5 + 2a
  return{a,r,rh:1+Math.sqrt(eps*(2-eps)),f:(r*x+a)/(Math.pow(r,.75)*Math.sqrt(D))};
}

/* ---------- Anzeige ---------- */
const SUP=['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
const sup=n=>(n<0?'⁻':'')+String(Math.abs(n)).split('').map(c=>SUP[+c]).join('');
function sci(v){const e=Math.floor(Math.log10(v));const m=v/Math.pow(10,e);return nf(m,1)+' · 10'+sup(e);}
function fmtDur(h){
  const s=h*3600;
  if(s<60)return nf(s,0)+' s';
  if(s<3600){const S=Math.floor(s);return Math.floor(S/60)+' min '+String(S%60).padStart(2,'0')+' s';}
  if(h<48){const tm=Math.round(h*60);return Math.floor(tm/60)+' h '+String(tm%60).padStart(2,'0')+' min';}
  if(h<24*730)return nf(h/24,1)+' Tage';
  return nf(h/YEAR_H,1)+' Jahre';
}
function fmtClock(h){const S=Math.floor(h*3600);const p=n=>String(n).padStart(2,'0');return p(Math.floor(S/3600))+':'+p(Math.floor(S/60)%60)+':'+p(S%60);}
function fmtSpin(eps){
  if(eps>=1e-3)return nf((1-eps)*100,1)+' %';
  return '99,'+'9'.repeat(Math.max(1,Math.floor(-Math.log10(eps))-2))+'… %';
}

/* ---------- Zustand ---------- */
const sI=$('spin');
let eps=EPS_FILM, K=kerr(eps), tau=0;
const epsOf=v=>Math.pow(10,-16*v/1000);
const vOf=e=>Math.round(-Math.log10(e)/16*1000);
function setEps(e,fromSlider){eps=e;K=kerr(eps);tau=0;if(!fromSlider){sI.value=vOf(e);DS.syncRange(sI);}upd();}
sI.addEventListener('input',()=>setEps(epsOf(+sI.value),true));
$('noSpin').onclick=()=>setEps(1);
$('film').onclick=()=>setEps(EPS_FILM);
$('restart').onclick=()=>{tau=0;upd();};

function upd(){
  const f=K.f;
  $('spinV').textContent=fmtSpin(eps);
  $('rSpin').textContent=eps>=1e-3?nf(K.a,3):'1 − '+sci(eps);
  $('rFactor').textContent=nf(f,f<10?2:0)+' ×';
  $('rHour').textContent=fmtDur(f);
  $('rFilm').textContent=f>=FILM_F*0.97?'erreicht':nf(f/FILM_F*100,f/FILM_F<0.01?3:1)+' %';
  sI.setAttribute('aria-valuetext','Drehung '+fmtSpin(eps)+', eine Stunde auf dem Planeten entspricht '+fmtDur(f)+' auf der Erde');
  let t;
  if(eps>0.999)t='Ohne Drehung liegt die innerste stabile Bahn beim Dreifachen des Horizont-Radius. Die Zeit läuft dort nur um den Faktor 1,4 langsamer: Aus einer Stunde auf dem Planeten werden auf der Erde knapp 85 Minuten.';
  else if(f<10)t='Die Drehung zieht den Raum mit und erlaubt stabile Bahnen näher am Loch. Der Effekt bleibt aber klein.';
  else if(f<FILM_F*0.97)t='Erst wenn die Drehung extrem nah am Maximum liegt, rückt die Bahn bis fast an den Horizont. Zu den 7 Jahren aus dem Film fehlt aber noch einiges.';
  else if(f<=FILM_F*1.1)t='Das ist Millers Planet: Eine Stunde dort, und auf der Erde vergehen rund 7 Jahre. Dafür darf Gargantua nur um 1,3 · 10⁻¹⁴ von der größtmöglichen Drehung entfernt sein.';
  else t='Noch extremer als im Film. Je näher die Drehung am Maximum liegt, desto stärker wird die Zeit gedehnt. Unendlich wird sie aber nie, solange der Planet auf einer stabilen Bahn bleibt.';
  $('mSay').textContent=t;
  clocks();
  draw(performance.now());
}
function clocks(){
  const th=reduce?1:tau;
  $('cPlanet').textContent=fmtClock(th);
  $('cEarth').textContent=th>0?fmtDur(th*K.f):'0 s';
}

/* ---------- Bild: Blick von oben, schematisch ---------- */
let cv=null, last=performance.now(), orbit=0, drag=0;
const STARS=[];for(let i=0;i<90;i++)STARS.push([(i*73.13)%1,(i*41.7)%1,(i%7)/10+.15]);
function draw(now){
  if(!cv)return;const{x,W,H}=cv;const dt=Math.min(.1,(now-last)/1000);last=now;
  if(!reduce){orbit+=dt*.9;drag+=dt*1.4*K.a;tau+=dt*PLANET_H_PER_S;}
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  x.fillStyle='rgba(235,230,220,1)';STARS.forEach(s=>{x.globalAlpha=s[2];x.fillRect(s[0]*W,s[1]*H,1,1);});x.globalAlpha=1;
  const cx=W/2,cy=H/2,S=Math.min(W,H)*.43/6.4;
  // mitgezogener Raum
  if(K.a>.01){
    x.lineWidth=1.4;
    for(let j=0;j<8;j++){x.beginPath();
      for(let i=0;i<=60;i++){const s=i/60;const r=K.rh+s*(6.6-K.rh);const ang=drag+j*Math.PI/4+K.a*2.4/r;
        const px=cx+Math.cos(ang)*r*S,py=cy+Math.sin(ang)*r*S;i?x.lineTo(px,py):x.moveTo(px,py);}
      const g=x.createRadialGradient(cx,cy,K.rh*S,cx,cy,6.6*S);g.addColorStop(0,'rgba(76,201,240,'+(.15+.45*K.a)+')');g.addColorStop(1,'rgba(76,201,240,0)');
      x.strokeStyle=g;x.stroke();}
  }
  // innerste stabile Bahn
  x.setLineDash([4,5]);x.strokeStyle='rgba(242,163,58,.75)';x.lineWidth=1.3;x.beginPath();x.arc(cx,cy,K.r*S,0,7);x.stroke();x.setLineDash([]);
  // Horizont
  const g=x.createRadialGradient(cx,cy,K.rh*S*.9,cx,cy,K.rh*S*1.6);g.addColorStop(0,'rgba(224,92,193,.35)');g.addColorStop(1,'rgba(224,92,193,0)');
  x.fillStyle=g;x.beginPath();x.arc(cx,cy,K.rh*S*1.6,0,7);x.fill();
  x.fillStyle='#000';x.beginPath();x.arc(cx,cy,K.rh*S,0,7);x.fill();
  x.strokeStyle=css('--magenta');x.lineWidth=1.5;x.stroke();
  // Planet
  const px=cx+Math.cos(orbit)*K.r*S,py=cy+Math.sin(orbit)*K.r*S;
  x.fillStyle=css('--ink');x.beginPath();x.arc(px,py,6,0,7);x.fill();
  x.strokeStyle='#000';x.lineWidth=2;x.stroke();
  // Beschriftung
  x.font='11px '+css('--mono');x.textAlign='left';x.textBaseline='top';x.fillStyle=css('--mute');
  x.fillText('Blick von oben, schematisch',10,10);
  const leg=[['--magenta','Horizont'],['--amber','innerste stabile Bahn']];if(K.a>.01)leg.push(['--cyan','mitgezogener Raum']);
  leg.forEach((l,i)=>{const y=H-16-(leg.length-1-i)*16;x.fillStyle=css(l[0]);x.fillRect(10,y+4,14,3);x.fillStyle=css('--mute');x.fillText(l[1],30,y);});
  x.textAlign='right';x.fillStyle=css('--ink');x.fillText('Millers Planet',W-10,10);
  if(!reduce)clocks();
}
function resize(){cv=fit($('cvMiller'));draw(performance.now());}
DS.onResize([$('cvMiller')],resize);
DS.animate($('cvMiller'),draw);
sI.value=vOf(eps);DS.syncRange(sI);resize();upd();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>draw(performance.now()));
})();
