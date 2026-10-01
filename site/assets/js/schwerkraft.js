/* Kapitel 1 · Warum Dinge fallen
   Physik und Zeichnung unverändert aus quellen/01-warum-dinge-fallen.html übernommen. */
(function(){
const{reduce,css,$,nf,fit}=DS;
function arrow(x,x0,y0,x1,y1,c,w){x.strokeStyle=c;x.fillStyle=c;x.lineWidth=w||2.4;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();
  const a=Math.atan2(y1-y0,x1-x0),h=9;x.beginPath();x.moveTo(x1,y1);x.lineTo(x1-h*Math.cos(a-.42),y1-h*Math.sin(a-.42));x.lineTo(x1-h*Math.cos(a+.42),y1-h*Math.sin(a+.42));x.closePath();x.fill();}

/* ========== 1. Zug aller Teilchen ========== */
const NP=170, PTS=[];for(let i=0;i<NP;i++){const r=Math.sqrt((i+.5)/NP),t=i*2.399963;PTS.push([r*Math.cos(t),r*Math.sin(t)]);}
const EPS=.09;
function force(px,py){let fx=0,fy=0;for(const q of PTS){const dx=q[0]-px,dy=q[1]-py;const d2=dx*dx+dy*dy+EPS*EPS;const f=1/(d2*Math.sqrt(d2));fx+=dx*f;fy+=dy*f;}return[fx,fy];}
const FS=(()=>{const f=force(1,0);return Math.hypot(f[0],f[1]);})();
let sel=[.87,-.5], pull=null;
const POS={edge:[.87,-.5],half:[.42,.24],mid:[0,0],out:[-1.55,-.55]};
document.querySelectorAll('[data-pos]').forEach(b=>b.onclick=()=>{sel=POS[b.dataset.pos].slice();drawPull();});
$('showLines').onchange=drawPull;
function pullGeom(){const{W,H}=pull;const Rp=Math.min(W,H)*.3;return{cx:W/2,cy:H/2,Rp};}
const LIM=1.6;
function setFromEvent(e){const r=pull.cv.getBoundingClientRect();const{cx,cy,Rp}=pullGeom();
  let u=(e.clientX-r.left-cx)/Rp,v=(e.clientY-r.top-cy)/Rp;u=Math.max(-LIM,Math.min(LIM,u));v=Math.max(-LIM,Math.min(LIM,v));sel=[u,v];drawPull();}
let dragging=false;
const cvPull=$('cvPull');
cvPull.addEventListener('pointerdown',e=>{dragging=true;try{cvPull.setPointerCapture(e.pointerId);}catch(_){}setFromEvent(e);});
cvPull.addEventListener('pointermove',e=>{if(dragging)setFromEvent(e);});
['pointerup','pointercancel'].forEach(t=>cvPull.addEventListener(t,()=>dragging=false));
// Tastatur: Pfeiltasten verschieben das markierte Teilchen
cvPull.addEventListener('keydown',e=>{const k={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!k)return;
  e.preventDefault();const st=e.shiftKey?.2:.05;sel=[Math.max(-LIM,Math.min(LIM,sel[0]+k[0]*st)),Math.max(-LIM,Math.min(LIM,sel[1]+k[1]*st))];drawPull();});
function drawPull(){
  if(!pull)return;const{x,W,H}=pull;const{cx,cy,Rp}=pullGeom();
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  // Körper
  const g=x.createRadialGradient(cx,cy,0,cx,cy,Rp);g.addColorStop(0,'rgba(242,163,58,.16)');g.addColorStop(1,'rgba(242,163,58,.05)');
  x.fillStyle=g;x.beginPath();x.arc(cx,cy,Rp,0,7);x.fill();x.strokeStyle='rgba(242,163,58,.35)';x.lineWidth=1;x.stroke();
  const sx=cx+sel[0]*Rp,sy=cy+sel[1]*Rp;
  // Züge
  if($('showLines').checked){
    for(const q of PTS){const qx=cx+q[0]*Rp,qy=cy+q[1]*Rp;const dx=q[0]-sel[0],dy=q[1]-sel[1];const d2=dx*dx+dy*dy+EPS*EPS;
      const a=Math.min(.75,.025/d2+.04);x.strokeStyle='rgba(76,201,240,'+a+')';x.lineWidth=1;x.beginPath();x.moveTo(sx,sy);x.lineTo(qx,qy);x.stroke();}
  }
  // Teilchen
  x.fillStyle='rgba(235,230,220,.75)';for(const q of PTS){x.beginPath();x.arc(cx+q[0]*Rp,cy+q[1]*Rp,1.8,0,7);x.fill();}
  // Mitte
  x.strokeStyle='rgba(235,230,220,.5)';x.lineWidth=1;x.beginPath();x.moveTo(cx-6,cy);x.lineTo(cx+6,cy);x.moveTo(cx,cy-6);x.lineTo(cx,cy+6);x.stroke();
  // Summe
  const f=force(sel[0],sel[1]);const fm=Math.hypot(f[0],f[1]);const rel=fm/FS;
  const L=Math.min(Rp*.9,Rp*.75*Math.pow(rel,.55));
  const dist=Math.hypot(sel[0],sel[1]);
  if(dist>.04){x.setLineDash([4,5]);x.strokeStyle='rgba(235,230,220,.35)';x.beginPath();x.moveTo(sx,sy);x.lineTo(cx,cy);x.stroke();x.setLineDash([]);}
  if(L>6)arrow(x,sx,sy,sx+f[0]/fm*L,sy+f[1]/fm*L,css('--cyan'),3.2);
  x.fillStyle=css('--amber');x.beginPath();x.arc(sx,sy,6,0,7);x.fill();x.strokeStyle='#000';x.lineWidth=2;x.stroke();
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';
  x.fillText('Dicker Pfeil: Summe aller Züge',10,10);x.fillText('Gestrichelt: Richtung zur Mitte',10,26);
  // Werte
  $('pAmt').textContent=nf(rel*100,0)+' %';
  let dev=0;if(dist>.04){const ca=(-sel[0]*f[0]-sel[1]*f[1])/(dist*fm);dev=Math.acos(Math.max(-1,Math.min(1,ca)))*180/Math.PI;}
  $('pDir').textContent=dist<=.04?'keine':(dev<4?'zur Mitte':'≈ zur Mitte');
  let t;
  if(dist<=.06)t='Genau in der Mitte ziehen alle Teilchen gleich stark in alle Richtungen. Alles hebt sich auf: Im Zentrum eines Sterns oder Planeten wärst du schwerelos.';
  else if(dist<.9)t='Im Inneren zieht die Masse außerhalb von dir in alle Richtungen und hebt sich weitgehend auf. Was übrig bleibt, zeigt zur Mitte, ist aber schwächer als am Rand.';
  else if(dist<1.15)t='Am Rand liegt fast die ganze Masse auf einer Seite. Die seitlichen Züge heben sich auf, übrig bleibt ein kräftiger Zug zur Mitte. Das ist das, was du als Gewicht spürst.';
  else t='Von weiter weg wirkt der ganze Ball, als säße seine Masse in einem Punkt in der Mitte. Der Zug wird mit der Entfernung schnell schwächer.';
  $('pSay').textContent=t;
}

/* ========== 2. Globus ========== */
let globe=null, gMode='sphere', gP=.62, gAnim=null;
const DLON=30*Math.PI/180, RE=6371;
const gI=$('gProg');
gI.addEventListener('input',()=>{gAnim=null;gP=gI.value/1000;drawGlobe();});
$('gSphere').onclick=()=>{gMode='sphere';$('gSphere').setAttribute('aria-pressed','true');$('gFlat').setAttribute('aria-pressed','false');drawGlobe();};
$('gFlat').onclick=()=>{gMode='flat';$('gFlat').setAttribute('aria-pressed','true');$('gSphere').setAttribute('aria-pressed','false');drawGlobe();};
$('gPlay').onclick=()=>{if(reduce){gP=1;gI.value=1000;DS.syncRange(gI);drawGlobe();return;}gP=0;gAnim={t0:performance.now(),ms:5000};};
function drawGlobe(){
  if(!globe)return;const{x,W,H}=globe;x.fillStyle='#000';x.fillRect(0,0,W,H);
  const lat=gP*90*Math.PI/180;const startKm=DLON*RE;
  if(gMode==='sphere'){
    const cx=W/2,cy=H*.54,Rp=Math.min(W,H)*.4,tilt=35*Math.PI/180,rot=0;
    const P=(la,lo)=>{const X=Math.cos(la)*Math.sin(lo-rot),Y=Math.sin(la),Z=Math.cos(la)*Math.cos(lo-rot);
      const y2=Y*Math.cos(tilt)-Z*Math.sin(tilt),z2=Y*Math.sin(tilt)+Z*Math.cos(tilt);return[cx+X*Rp,cy-y2*Rp,z2];};
    const g=x.createRadialGradient(cx-Rp*.35,cy-Rp*.35,Rp*.1,cx,cy,Rp);g.addColorStop(0,'#1b2233');g.addColorStop(1,'#0b0e16');
    x.fillStyle=g;x.beginPath();x.arc(cx,cy,Rp,0,7);x.fill();x.strokeStyle='rgba(144,151,170,.45)';x.lineWidth=1;x.stroke();
    const poly=(fn,n,col,w)=>{x.strokeStyle=col;x.lineWidth=w;x.beginPath();let pen=false;for(let i=0;i<=n;i++){const[a,b,z]=fn(i/n);if(z>0){pen?x.lineTo(a,b):x.moveTo(a,b);pen=true;}else pen=false;}x.stroke();};
    for(let la=-75;la<=75;la+=15)poly(t=>P(la*Math.PI/180,t*Math.PI*2),120,la===0?'rgba(235,230,220,.45)':'rgba(144,151,170,.18)',la===0?1.4:1);
    for(let lo=0;lo<360;lo+=15)poly(t=>P(-Math.PI/2+t*Math.PI,lo*Math.PI/180),80,'rgba(144,151,170,.18)',1);
    // Wanderer
    [-1,1].forEach(s=>{const lo=s*DLON/2;poly(t=>P(t*lat,lo),60,css('--amber'),2.6);
      poly(t=>P(lat+t*(Math.PI/2-lat),lo),40,'rgba(242,163,58,.25)',1.2);});
    const A=P(lat,-DLON/2),B=P(lat,DLON/2);
    x.setLineDash([3,4]);x.strokeStyle=css('--cyan');x.lineWidth=1.4;x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0],B[1]);x.stroke();x.setLineDash([]);
    [A,B].forEach(p=>{x.fillStyle=css('--amber');x.beginPath();x.arc(p[0],p[1],5.5,0,7);x.fill();x.strokeStyle='#000';x.lineWidth=2;x.stroke();});
    const S0=P(0,-DLON/2),S1=P(0,DLON/2),N=P(Math.PI/2,0);
    x.font='11px '+css('--mono');x.textAlign='center';x.textBaseline='top';x.fillStyle=css('--mute');
    x.fillText('Start am Äquator',(S0[0]+S1[0])/2,S0[1]+10);x.textBaseline='bottom';x.fillText('Nordpol',N[0],N[1]-8);
  }else{
    const cx=W/2,top=H*.12,bot=H*.9;
    const M=(u,v)=>{const s=1/(1+v*1.1);return[cx+u*W*.42*s,bot-(bot-top)*(1-(1/(1+v*1.1)-1/2.1)/(1-1/2.1))]};
    x.strokeStyle='rgba(144,151,170,.2)';x.lineWidth=1;
    for(let i=-6;i<=6;i++){const u=i/6;const[a,b]=M(u,0),[c,d]=M(u,1);x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();}
    for(let j=0;j<=10;j++){const v=j/10;const[a,b]=M(-1,v),[c,d]=M(1,v);x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();}
    const ua=.18;[-ua,ua].forEach(u=>{x.strokeStyle='rgba(242,163,58,.25)';x.lineWidth=1.2;const[a,b]=M(u,0),[c,d]=M(u,1);x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();
      x.strokeStyle=css('--amber');x.lineWidth=2.6;const[e,f]=M(u,gP);x.beginPath();x.moveTo(a,b);x.lineTo(e,f);x.stroke();});
    const A=M(-ua,gP),B=M(ua,gP);
    x.setLineDash([3,4]);x.strokeStyle=css('--cyan');x.lineWidth=1.4;x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0],B[1]);x.stroke();x.setLineDash([]);
    [A,B].forEach(p=>{x.fillStyle=css('--amber');x.beginPath();x.arc(p[0],p[1],5.5,0,7);x.fill();x.strokeStyle='#000';x.lineWidth=2;x.stroke();});
    x.font='11px '+css('--mono');x.textAlign='center';x.textBaseline='top';x.fillStyle=css('--mute');x.fillText('Start',cx,bot+6);
  }
  x.font='11px '+css('--mono');x.textAlign='left';x.textBaseline='top';x.fillStyle=css('--mute');
  x.fillText(gMode==='sphere'?'Beide gehen exakt geradeaus nach Norden':'Beide gehen exakt geradeaus',10,10);
  const d=gMode==='sphere'?startKm*Math.cos(lat):startKm;
  $('gDist').textContent=nf(Math.round(d),0)+' km';
  $('gProgV').textContent=nf(Math.round(gP*10008),0)+' km';
  let t;
  if(gMode==='flat')t='Auf flachem Boden bleiben zwei gerade Wege für immer gleich weit auseinander. Keine Krümmung, keine scheinbare Anziehung.';
  else if(gP<.05)t='Beide starten parallel, beide gehen geradeaus. Noch passiert nichts.';
  else if(gP<.99)t='Keiner hat gelenkt, und trotzdem sind sie sich '+nf(Math.round(startKm-d),0)+' km näher gekommen. Das macht allein die Krümmung der Kugel.';
  else t='Zusammenstoß am Nordpol. Ohne jede Kraft, nur weil beide geradeaus gegangen sind.';
  $('gSay').textContent=t;
}

/* ========== 3. Zeitfeld ========== */
let tf=null, trails=[], car=null, tClock=0;
const tM=$('tMass');
function G(){return tM.value/100;}
function tau(hn){return 1-.45*G()*(1-hn);} // hn: Höhe 0 (Boden) .. 1 (oben)
tM.addEventListener('input',()=>{updT();});
$('tGo').onclick=launch;$('tClear').onclick=()=>{trails=[];};
function geomT(){const{W,H}=tf;const ground=H*.86;return{W,H,ground,top:H*.06};}
function launch(){const{W,ground,top}=geomT();const y=top+(ground-top)*.28;
  car={x:W*.08,y,th:0,pts:[[W*.08,y]],done:false,phase:0,phaseT:0,phaseB:0};trails.push(car.pts);if(trails.length>4)trails.shift();
  if(reduce){while(!car.done)stepCar(1/60);}}
function stepCar(dt){
  const{W,ground,top}=geomT();const hOf=y=>Math.max(0,Math.min(1,(ground-y)/(ground-top)));
  const v0=W*.2,w=24;
  const yt=car.y-Math.cos(car.th)*w/2,yb=car.y+Math.cos(car.th)*w/2;
  const vt=v0*tau(hOf(yt)),vb=v0*tau(hOf(yb));
  const K=3.2;car.th+=K*(vt-vb)/w*dt; // untere Kette langsamer -> Drehung nach unten (y wächst)
  const v=(vt+vb)/2;car.x+=v*Math.cos(car.th)*dt;car.y+=v*Math.sin(car.th)*dt;
  car.phaseT+=vt*dt;car.phaseB+=vb*dt;
  car.pts.push([car.x,car.y]);
  if(car.y>=ground-10||car.x>W+30||car.y<-30)car.done=true;
}
function updT(){
  $('tMassV').textContent=Math.round(G()*100)+' %';
  $('tTop').textContent='100 %';$('tBot').textContent=nf(tau(0)*100,0)+' %';
  $('tSay').textContent=G()<.02?'Keine Masse, also läuft die Zeit überall gleich schnell. Beide Ketten laufen gleich, das Fahrzeug fährt schnurgerade.':
    'Die untere Kette läuft in langsamerer Zeit, die obere in schnellerer. Das Fahrzeug biegt deshalb von selbst nach unten ab, ohne dass jemand lenkt. Mehr Masse, steilerer Unterschied, schärfere Kurve.';
}
let lastT=performance.now();
function drawTime(now){
  if(!tf)return;const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  const{x,W,H}=tf;const{ground,top}=geomT();
  if(car&&!car.done&&!reduce){for(let i=0;i<3;i++)if(!car.done)stepCar(dt/3);}
  tClock+=dt;
  // Hintergrund: Zeitfeld
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  const bands=14;for(let i=0;i<bands;i++){const h0=i/bands;const y0=ground-(ground-top)*(h0+1/bands),y1=ground-(ground-top)*h0;
    const slow=1-tau(h0+.5/bands);const a=Math.min(.55,slow*1.4);x.fillStyle='rgba(224,92,193,'+a+')';x.fillRect(0,y0,W,y1-y0+1);}
  // Boden
  const gg=x.createLinearGradient(0,ground,0,H);gg.addColorStop(0,'#3a2c22');gg.addColorStop(1,'#1a140f');x.fillStyle=gg;x.fillRect(0,ground,W,H-ground);
  x.strokeStyle='rgba(242,163,58,.6)';x.lineWidth=1.5;x.beginPath();x.moveTo(0,ground);x.lineTo(W,ground);x.stroke();
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';x.fillText('Masse (Planet)',10,ground+8);
  // Uhren
  const clocks=[.88,.5,.12];const rr=Math.max(11,Math.min(18,H*.045));
  clocks.forEach(h=>{const y=ground-(ground-top)*h;const cx=W-rr-14;const r=tau(h);
    x.fillStyle='rgba(7,8,13,.85)';x.beginPath();x.arc(cx,y,rr,0,7);x.fill();x.strokeStyle='rgba(235,230,220,.7)';x.lineWidth=1.2;x.stroke();
    const a=(reduce?0:tClock*r*2.2)-Math.PI/2;x.strokeStyle=css('--amber');x.lineWidth=2;x.beginPath();x.moveTo(cx,y);x.lineTo(cx+Math.cos(a)*rr*.78,y+Math.sin(a)*rr*.78);x.stroke();
    x.fillStyle=css('--ink');x.textAlign='right';x.textBaseline='middle';x.fillText('Uhr '+nf(r*100,0)+' %',cx-rr-6,y);});
  x.textAlign='left';x.textBaseline='top';x.fillStyle=css('--mute');x.fillText('Rosa: hier läuft die Zeit langsamer',10,10);
  // Spuren
  trails.forEach((pts,i)=>{x.strokeStyle='rgba(242,163,58,'+(pts===(car&&car.pts)?.9:.35)+')';x.lineWidth=2;x.setLineDash([5,5]);x.beginPath();pts.forEach((p,j)=>j?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.setLineDash([]);});
  // Fahrzeug
  if(car){x.save();x.translate(car.x,car.y);x.rotate(car.th);
    const L=34,w=24;x.fillStyle='#1d2433';x.fillRect(-L/2,-w/2+5,L,w-10);
    const track=(yy,ph,col)=>{x.fillStyle='#0c0f16';x.fillRect(-L/2-2,yy-4,L+4,8);x.strokeStyle=col;x.lineWidth=2;
      for(let k=0;k<6;k++){const xx=-L/2+((k*7-ph)%42+42)%42;if(xx<=L/2)x.beginPath(),x.moveTo(xx,yy-4),x.lineTo(xx,yy+4),x.stroke();}};
    track(-w/2,car.phaseT*.6,css('--amber'));track(w/2,car.phaseB*.6,css('--magenta'));
    x.restore();
  }
}

/* ========== Animation und Größen ========== */
function resizeAll(){pull=fit($('cvPull'));globe=fit($('cvGlobe'));tf=fit($('cvTime'));drawPull();drawGlobe();
  if(!car){launch();if(!reduce){while(!car.done)stepCar(1/60);}}}
DS.onResize([$('cvPull'),$('cvGlobe'),$('cvTime')],resizeAll);
DS.animate($('cvGlobe'),now=>{
  if(gAnim){const k=Math.min(1,(now-gAnim.t0)/gAnim.ms);gP=k;gI.value=Math.round(k*1000);DS.syncRange(gI);drawGlobe();if(k>=1)gAnim=null;}});
DS.animate($('cvTime'),drawTime);
updT();resizeAll();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawPull();drawGlobe();});
})();
