/* Kapitel 5 · Wenn Löcher kollidieren
   Signalmodell, Audio und Zeichnung unverändert aus quellen/05-wenn-loecher-kollidieren.html übernommen.
   Neu: Stopp-Taste. Der Ton startet weiterhin nur nach Klick. */
(function(){
const{css,$,nf,fit}=DS;

/* ---------- Signalmodell ---------- */
const TS=4.925491e-6, F0=30;
let SIG=null;
function model(m1,m2){
  const M=m1+m2, eta=m1*m2/(M*M);
  const Mc=Math.pow(m1*m2,.6)/Math.pow(M,.2), McS=Mc*TS;
  const E=.0559745*eta+.580951*eta*eta-.960673*eta**3+3.35241*eta**4;
  const Mf=M*(1-E), af=2*Math.sqrt(3)*eta-3.871*eta*eta+4.028*eta**3;
  const frd=(1.5251-1.1568*Math.pow(1-af,.1292))/(2*Math.PI*Mf*TS);
  const Q=.7+1.4187*Math.pow(1-af,-.499), td=Q/(Math.PI*frd);
  const fpk=.75*frd;
  const tauOfF=f=>5/256*Math.pow(Math.PI*f,-8/3)*Math.pow(McS,-5/3);
  const fOfTau=t=>1/Math.PI*Math.pow(5/(256*t),3/8)*Math.pow(McS,-5/8);
  const tau0=tauOfF(F0), tm=tau0-tauOfF(fpk), dur=tm+7*td;
  const fAt=t=>t<tm?fOfTau(tau0-t):frd-(frd-fpk)*Math.exp(-(t-tm)/(td*.5));
  const aAt=t=>t<tm?Math.pow(fOfTau(tau0-t)/fpk,2/3):Math.exp(-(t-tm)/td);
  // Tabelle
  const n=Math.min(400000,Math.max(6000,Math.ceil(dur*frd*14)));const dt=dur/n;
  const tt=new Float32Array(n),ph=new Float64Array(n),am=new Float32Array(n);let p=0;
  for(let i=0;i<n;i++){const t=i*dt;tt[i]=t;am[i]=aAt(t);ph[i]=p;p+=2*Math.PI*fAt(t)*dt;}
  return{m1,m2,M,Mf,E,af,frd,fpk,td,tm,dur,fAt,aAt,n,dt,ph,am};
}
function at(S,t){if(t<=0)return 0;const i=Math.min(S.n-1,Math.floor(t/S.dt));return i;}

/* ---------- Audio ---------- */
let ac=null, playStart=0, stretch=1, playing=false, src=null;
function pitchFactor(S){return Math.max(1,Math.min(4,1800/S.frd));}
function play(slow){
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;}
  const S=SIG;stretch=slow?Math.max(1,Math.min(20,2.6/S.dur)):1;
  if(src){try{src.stop();}catch(e){}}
  playing=true;
  if(!ac){playStart=performance.now()/1000;return;}
  if(ac.state==='suspended')ac.resume();
  const sr=ac.sampleRate, len=Math.ceil((S.dur*stretch+.15)*sr);const buf=ac.createBuffer(1,len,sr);const d=buf.getChannelData(0);
  const pf=pitchFactor(S);let p=0;
  for(let i=0;i<len;i++){const t=i/sr/stretch;if(t>S.dur)break;const f=S.fAt(t)*pf;p+=2*Math.PI*f/sr;
    let a=S.aAt(t);const fadeIn=Math.min(1,t/(S.dur*.15+1e-6));d[i]=.55*a*fadeIn*Math.sin(p);}
  src=ac.createBufferSource();src.buffer=buf;const g=ac.createGain();g.gain.value=.9;src.connect(g);g.connect(ac.destination);
  playStart=ac.currentTime+.05;src.start(playStart);
}
function stop(){playing=false;if(src){try{src.stop();}catch(e){}src=null;}drawAll();}
function nowT(){if(!playing)return null;const c=ac?ac.currentTime:performance.now()/1000;return (c-playStart)/stretch;}
$('playSlow').onclick=()=>play(true);$('playReal').onclick=()=>play(false);$('stop').onclick=stop;
$('gw150914').onclick=()=>{$('m1').value=36;$('m2').value=29;DS.syncRange($('m1'));DS.syncRange($('m2'));update();};
['m1','m2'].forEach(id=>$(id).addEventListener('input',update));

function fmtDur(s){if(s<1)return nf(s*1000,0)+' ms';return nf(s,1)+' s';}
function update(){
  playing=false;if(src){try{src.stop();}catch(e){}}
  const m1=+$('m1').value,m2=+$('m2').value;$('m1v').textContent=m1+' M☉';$('m2v').textContent=m2+' M☉';
  SIG=model(m1,m2);
  $('rMf').textContent=nf(SIG.Mf,1)+' M☉';
  $('rE').textContent=nf(SIG.E*SIG.M,1)+' M☉ · '+nf(SIG.E*100,1)+' %';
  $('rDur').textContent=fmtDur(SIG.tm);
  $('rRd').textContent=nf(Math.round(SIG.frd),0)+' Hz';
  const pf=pitchFactor(SIG);
  $('pitchNote').textContent='Der Ton wird '+(pf>1.05?'um den Faktor '+nf(pf,1)+' höher ':'in Originalhöhe ')+'abgespielt. „Gedehnt“ zieht ihn zeitlich auf etwa 2,6 Sekunden, damit man den Verlauf hört. M☉ steht für Sonnenmassen.';
  drawAll();
}

/* ---------- Zeichnen ---------- */
let orb=null, wav=null;
function staticT(S){return Math.max(0,S.tm-Math.min(S.tm*.06,.012));}
function drawOrbit(t){
  if(!orb)return;const{x,W,H}=orb;const S=SIG;x.fillStyle='#000';x.fillRect(0,0,W,H);
  const cx=W/2,cy=H/2,maxR=Math.min(W,H)*.47;
  const sc=Math.min(W,H)*.0016;const r1=6+S.m1*sc,r2=6+S.m2*sc,rf=6+S.Mf*sc;
  const contact=(r1+r2)*1.05;const k=contact*Math.pow(S.fpk,2/3);const v=maxR/(S.dur*.35+.02);
  // Wellenringe
  for(let rho=contact*.6;rho<maxR*1.45;rho+=3){
    const tr=t-(rho-contact*.6)/v;if(tr<=0)continue;const i=at(S,tr);
    const h=S.am[i]*Math.cos(S.ph[i]);const a=Math.max(0,h)*.38*Math.min(1,S.am[i]*1.4);
    if(a<.01)continue;x.strokeStyle='rgba(76,201,240,'+a+')';x.lineWidth=1.6;x.beginPath();x.arc(cx,cy,rho,0,7);x.stroke();}
  // Löcher
  const hole=(px,py,r,col)=>{const g=x.createRadialGradient(px,py,r*.6,px,py,r*1.7);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,col);g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.beginPath();x.arc(px,py,r*1.7,0,7);x.fill();x.fillStyle='#000';x.beginPath();x.arc(px,py,r,0,7);x.fill();};
  if(t<S.tm){const i=at(S,t);const f=S.fAt(Math.max(t,0));const a=Math.min(maxR*.82,k*Math.pow(f,-2/3));const th=S.ph[i]/2;
    const d1=a*S.m2/S.M,d2=a*S.m1/S.M;
    hole(cx+Math.cos(th)*d1,cy+Math.sin(th)*d1,r1,'rgba(242,163,58,.55)');
    hole(cx-Math.cos(th)*d2,cy-Math.sin(th)*d2,r2,'rgba(224,92,193,.55)');
  }else{const u=t-S.tm;const w=Math.exp(-u/S.td)*.25;const ph=2*Math.PI*S.frd*u;
    x.save();x.translate(cx,cy);x.scale(1+w*Math.cos(ph),1-w*Math.cos(ph));hole(0,0,rf,'rgba(245,200,150,.6)');x.restore();}
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';
  const phase=t<S.tm*.97?'Umkreisen':(t<S.tm+S.td*.6?'Verschmelzen':'Nachschwingen');
  x.fillText(phase+(playing?'':' · Standbild'),10,10);
  x.textAlign='right';x.fillText('Ringe: Gravitationswellen',W-10,10);
}
function drawWave(t){
  if(!wav)return;const{x,W,H}=wav;const S=SIG;x.fillStyle=css('--panel');x.fillRect(0,0,W,H);
  const padL=12,padR=12,top=26,bot=26;const cy=top+(H-top-bot)/2;const amp=(H-top-bot)/2*.92;
  const t0=Math.max(0,S.dur-0.6);const span=S.dur-t0;const X=tt=>padL+(W-padL-padR)*((tt-t0)/span);
  x.strokeStyle='rgba(144,151,170,.25)';x.lineWidth=1;x.beginPath();x.moveTo(padL,cy);x.lineTo(W-padR,cy);x.stroke();
  // Hüllkurve oder Linie
  const cols=Math.floor(W-padL-padR);x.strokeStyle=css('--cyan');x.lineWidth=1.2;x.beginPath();
  for(let c=0;c<cols;c++){const ta=t0+span*c/cols,tb=t0+span*(c+1)/cols;const ia=at(S,ta),ib=Math.max(ia+1,at(S,tb));let mn=1,mx=-1;
    for(let i=ia;i<ib&&i<S.n;i+=Math.max(1,Math.floor((ib-ia)/40))){const h=S.am[i]*Math.cos(S.ph[i]);if(h<mn)mn=h;if(h>mx)mx=h;}
    const px=padL+c;x.moveTo(px,cy-mx*amp);x.lineTo(px,cy-mn*amp+.5);}
  x.stroke();
  // Markierungen
  const xm=X(S.tm);x.setLineDash([3,4]);x.strokeStyle='rgba(235,230,220,.45)';x.beginPath();x.moveTo(xm,top-6);x.lineTo(xm,H-bot+6);x.stroke();x.setLineDash([]);
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textBaseline='top';
  x.textAlign='left';x.fillText('Umkreisen →',padL,6);x.textAlign='center';x.fillText('Verschmelzen',Math.min(W-60,Math.max(60,xm)),6);
  x.textBaseline='bottom';x.textAlign='left';x.fillText('Dehnung des Raums (relativ)',padL,H-6);
  x.textAlign='right';x.fillText(t0>0?'gezeigt: letzte '+fmtDur(span):'gezeigt: ganzes Signal, '+fmtDur(span),W-padR,H-6);
  if(t!=null&&t>=t0&&t<=S.dur){const xp=X(t);x.strokeStyle=css('--amber');x.lineWidth=2;x.beginPath();x.moveTo(xp,top-4);x.lineTo(xp,H-bot+4);x.stroke();}
}
function drawAll(){const t=nowT();const tv=(t==null)?staticT(SIG):t;drawOrbit(Math.min(tv,SIG.dur));drawWave(t==null?null:t);}
function loop(){if(playing){const t=nowT();if(t>SIG.dur+.05)playing=false;}drawAll();}
function resize(){orb=fit($('cvOrbit'));wav=fit($('cvWave'));drawAll();}
DS.onResize([$('cvOrbit'),$('cvWave')],resize);
DS.animate($('sim'),loop);
update();resize();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawAll);
})();
