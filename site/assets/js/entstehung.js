/* Kapitel 2 · Vom Stern zum Loch
   Physik und Zeichnung unverändert aus quellen/02-vom-stern-zum-loch.html übernommen. */
(function(){
const{reduce,css,$,nf,fit}=DS;

/* ================= 1. Stern ================= */
const EL=[
 {k:'H',name:'Wasserstoff',c:'--e-h'},{k:'He',name:'Helium',c:'--e-he'},{k:'C',name:'Kohlenstoff, Sauerstoff',c:'--e-c'},
 {k:'Ne',name:'Neon, Sauerstoff',c:'--e-ne'},{k:'Si',name:'Silizium',c:'--e-si'},{k:'Fe',name:'Eisen',c:'--e-fe'}];
const RAD=[1.0,0.64,0.46,0.34,0.24,0.15];
const STAGES=[
 {t:'Wasserstoff brennt',dur:'≈ 7 Mio. Jahre',p:1,glow:1,shells:2,inner:.55,
  txt:'Im Kern verschmilzt Wasserstoff zu Helium. Das heizt den Kern auf über 30 Millionen Grad. Das heiße Gas drückt nach außen, die Schwerkraft zieht nach innen, beide gleich stark. In der Mitte sammelt sich Helium als Asche.'},
 {t:'Helium brennt',dur:'≈ 700.000 Jahre',p:1,glow:1,shells:3,inner:.5,
  txt:'Der Wasserstoff im Kern ist aufgebraucht. Ohne Nachschub sackt der Kern zusammen, wird dabei heißer und erreicht rund 200 Millionen Grad. Jetzt zündet das Helium und wird zu Kohlenstoff und Sauerstoff. Die Asche des einen Feuers ist der Brennstoff des nächsten. Außen bläht sich der Stern zum Roten Überriesen auf.'},
 {t:'Kohlenstoff brennt',dur:'≈ 600 Jahre',p:1,glow:1,shells:4,inner:.5,
  txt:'Dasselbe Spiel, nur schneller. Jede Stufe braucht mehr Hitze und liefert weniger Energie. Der Kern muss immer gieriger fressen, um den Druck zu halten.'},
 {t:'Neon und Sauerstoff',dur:'≈ 1 Jahr',p:.98,glow:1,shells:5,inner:.55,
  txt:'Nach Millionen Jahren geht es jetzt um Monate. Von außen sieht man davon fast nichts: Die Hülle ist so riesig, dass sie vom Drama im Kern kaum etwas mitbekommt.'},
 {t:'Silizium brennt',dur:'≈ 1 Tag',p:.95,glow:1.2,shells:6,inner:.6,
  txt:'Aus Silizium wird Eisen. Diese letzte Stufe dauert gerade mal einen Tag. Die Schalen liegen jetzt wie bei einer Zwiebel: außen leichte Elemente, innen immer schwerere.'},
 {t:'Eisen: das Feuer geht aus',dur:'Stunden',p:.55,glow:0,shells:6,inner:1.05,
  txt:'Eisen ist die Endstation. Eisen zu verschmelzen kostet Energie, statt welche zu liefern. Der Eisenkern wächst, etwa 1,5 Sonnenmassen in einer Kugel von der Größe der Erde, und nichts heizt ihn mehr. Der Druck hält nur noch mit Mühe.'},
 {t:'Kollaps',dur:'< 1 Sekunde',p:0,glow:0,shells:6,inner:1.05,collapse:1,
  txt:'Der Druck bricht weg. Der Kern stürzt in Bruchteilen einer Sekunde in sich zusammen, mit bis zu einem Viertel der Lichtgeschwindigkeit. Aus einer erdgroßen Kugel wird eine von wenigen Dutzend Kilometern.'},
 {t:'Schwarzes Loch',dur:'≈ 10⁷⁰ Jahre',p:0,glow:0,shells:6,inner:1.05,bh:1,
  txt:'Ist der Rest schwer genug, gibt es keine Kraft mehr, die den Fall stoppen kann. Er rutscht unter seinen eigenen Schwarzschild-Radius (mehr dazu weiter unten). Die äußeren Schichten fliegen oft als Supernova davon, bei sehr schweren Sternen fällt fast alles direkt hinein. Bei einem leichteren Rest stoppt der Fall knapp vorher: Dann entsteht ein Neutronenstern. Ewig ist auch ein schwarzes Loch nicht: Es verdampft extrem langsam durch Hawking-Strahlung, bei rund 10 Sonnenmassen in etwa 10⁷⁰ Jahren. Mehr dazu in <a class="xref" href="/offene-fragen/">Was niemand weiß</a>.'}
];
let stage=0, stageT0=performance.now(), lifePlaying=false, lifeTimer=null;
const stOl=$('stages');
STAGES.forEach((s,i)=>{const li=document.createElement('li');const b=document.createElement('button');
  b.innerHTML='<span class="n">'+(i+1)+'</span><span>'+s.t+'</span>';b.onclick=()=>{stopLife();setStage(i);};li.appendChild(b);stOl.appendChild(li);});
$('elLegend').innerHTML=EL.map(e=>'<span><i class="dot '+e.c.slice(2)+'"></i>'+e.name+'</span>').join('');
function setStage(i){stage=i;stageT0=performance.now();
  [...stOl.querySelectorAll('button')].forEach((b,j)=>j===i?b.setAttribute('aria-current','step'):b.removeAttribute('aria-current'));
  const s=STAGES[i];$('stageSay').innerHTML='<h3>'+s.t+'</h3><div class="meta"><span class="tag">Dauer '+s.dur+'</span><span class="tag">Druck '+Math.round(s.p*100)+' %</span></div><p>'+s.txt+'</p>';
  if(i===7)burst();
}
function stopLife(){lifePlaying=false;clearTimeout(lifeTimer);$('playLife').textContent='Leben abspielen';}
$('playLife').onclick=()=>{
  if(lifePlaying){stopLife();return;}
  lifePlaying=true;$('playLife').textContent='Anhalten';setStage(0);
  const next=()=>{if(!lifePlaying)return;if(stage<7){setStage(stage+1);lifeTimer=setTimeout(next,stage===6?2200:4200);}else stopLife();};
  lifeTimer=setTimeout(next,4200);
};
const photons=[];let lastStar=performance.now();
function burst(){for(let i=0;i<160;i++){photons.push({a:Math.random()*Math.PI*2,r:.1,v:.9+Math.random()*.8,big:1});}}
let star=null;
function drawStar(now){
  if(!star)return;const{x,W,H}=star;const dt=Math.min(.1,(now-lastStar)/1000);lastStar=now;
  const cx=W/2,cy=H/2,R=Math.min(W,H)*.42;const s=STAGES[stage];const age=(now-stageT0)/1000;
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  // Kollaps-/Explosionsfortschritt
  const col=s.collapse?(reduce?1:Math.min(1,age/1.4)):(s.bh?1:0);
  const ex=s.bh?(reduce?1:Math.min(1,age/2.6)):0;
  // Schalen
  for(let i=0;i<s.shells;i++){
    let r=RAD[i]*(i===s.shells-1?s.inner:1);
    if(s.bh&&i===s.shells-1)continue;
    let sh=1;
    if(col>0){const k=i/(s.shells-1);sh=1-col*col*(.15+.82*k*k);}
    if(s.bh){sh=(1-(.15+.82*(i/(s.shells-1))**2));sh*=1+ex*2.2*(1-i*.08);}
    r*=sh;
    const c=css(EL[i].c);x.globalAlpha=s.bh?Math.max(0,.9-ex*.75):1;
    x.fillStyle=c;x.beginPath();x.arc(cx,cy,R*r,0,7);x.fill();
    x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=1;x.stroke();
  }
  x.globalAlpha=1;
  // brennende Zone
  if(s.glow){const inner=RAD[s.shells-1]*s.inner*R;const pulse=reduce?1:(.85+.15*Math.sin(now/260));
    const g=x.createRadialGradient(cx,cy,0,cx,cy,Math.max(4,inner*1.1));
    g.addColorStop(0,'rgba(255,248,225,'+(.95*pulse)+')');g.addColorStop(.5,'rgba(255,200,120,'+(.45*pulse)+')');g.addColorStop(1,'rgba(255,170,80,0)');
    x.fillStyle=g;x.beginPath();x.arc(cx,cy,inner*1.1,0,7);x.fill();}
  // Schwarzes Loch
  if(s.bh){const g=x.createRadialGradient(cx,cy,0,cx,cy,R*.12);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.6,'rgba(0,0,0,1)');g.addColorStop(.75,'rgba(242,163,58,.55)');g.addColorStop(1,'rgba(242,163,58,0)');
    x.fillStyle=g;x.beginPath();x.arc(cx,cy,R*.12,0,7);x.fill();
    if(ex<1){x.strokeStyle='rgba(255,240,210,'+(1-ex)+')';x.lineWidth=3;x.beginPath();x.arc(cx,cy,R*(.2+ex*1.4),0,7);x.stroke();}
  }
  if(col>0&&!s.bh){const rr=RAD[5]*1.05*(1-col*col*.97)*R;x.strokeStyle='rgba(76,201,240,.9)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,Math.max(2,rr),0,7);x.stroke();}
  // Kräfte
  const N=8,ra=R*.8,gl=R*.16,pl=R*.16*s.p*(col>0?Math.max(0,1-col*3):1);
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2+Math.PI/8;const ux=Math.cos(a),uy=Math.sin(a);
    const off=.05*R;
    arrow(x,cx+ux*(ra+gl/2)+(-uy)*off,cy+uy*(ra+gl/2)+ux*off,cx+ux*(ra-gl/2)+(-uy)*off,cy+uy*(ra-gl/2)+ux*off,css('--cyan'));
    if(pl>3)arrow(x,cx+ux*(ra-pl/2)-(-uy)*off,cy+uy*(ra-pl/2)-ux*off,cx+ux*(ra+pl/2)-(-uy)*off,cy+uy*(ra+pl/2)-ux*off,css('--amber'));
  }
  if(s.bh&&ex>.4){x.globalAlpha=Math.min(1,(ex-.4)*3);for(let i=0;i<N;i++){const a=i/N*Math.PI*2;const ux=Math.cos(a),uy=Math.sin(a);
    arrow(x,cx+ux*R*.42,cy+uy*R*.42,cx+ux*R*.22,cy+uy*R*.22,css('--cyan'));}x.globalAlpha=1;}
  // Licht
  const rate=s.bh?0:(s.collapse?.4:1);
  if(!reduce){const n=Math.random()<rate*dt*40?1:0;for(let i=0;i<n;i++)photons.push({a:Math.random()*Math.PI*2,r:1.0,v:.35+Math.random()*.2});}
  x.fillStyle=css('--ink');
  for(let i=photons.length-1;i>=0;i--){const p=photons[i];p.r+=p.v*dt;const px=cx+Math.cos(p.a)*p.r*R,py=cy+Math.sin(p.a)*p.r*R;
    if(px<-5||px>W+5||py<-5||py>H+5){photons.splice(i,1);continue;}
    x.globalAlpha=p.big?.9:.7;x.beginPath();x.arc(px,py,p.big?1.8:1.3,0,7);x.fill();}
  x.globalAlpha=1;
  // Beschriftung
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';
  x.fillText('Querschnitt, nicht maßstäblich',10,10);
  if(s.glow){x.textAlign='center';x.fillStyle='rgba(7,8,13,.85)';const t='Fusion';const w=x.measureText(t).width+10;x.fillRect(cx-w/2,cy+RAD[s.shells-1]*s.inner*R+6,w,16);x.fillStyle=css('--ink');x.fillText(t,cx,cy+RAD[s.shells-1]*s.inner*R+8);}
}
function arrow(x,x0,y0,x1,y1,c){x.strokeStyle=c;x.fillStyle=c;x.lineWidth=2.2;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();
  const a=Math.atan2(y1-y0,x1-x0),h=7;x.beginPath();x.moveTo(x1,y1);x.lineTo(x1-h*Math.cos(a-.45),y1-h*Math.sin(a-.45));x.lineTo(x1-h*Math.cos(a+.45),y1-h*Math.sin(a+.45));x.closePath();x.fill();}

/* ================= 2. Fusion ================= */
let fus=null,fusT0=-1,fusDone=false;
$('fuseBtn').onclick=()=>{fusT0=performance.now();fusDone=false;$('fuseBtn').textContent='Nochmal';};
function drawFus(now){
  if(!fus)return;const{x,W,H}=fus;x.fillStyle='#000';x.fillRect(0,0,W,H);
  const cx=W*.5,cy=H*.5,S=Math.min(W,H);const nr=S*.045;
  let k=fusT0<0?0:Math.min(1,(now-fusT0)/1600);if(reduce&&fusT0>=0)k=1;
  const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  const start=[[-1,-1],[1,-1],[-1,1],[1,1]];const d=S*.3;
  const merged=k>=.82;
  const P=css('--e-c'),Nn='#8b93a3';
  if(!merged){start.forEach((p,i)=>{const px=cx+p[0]*d*(1-e)+(i%2?.5:-.5)*nr*e,py=cy+p[1]*d*(1-e)+(i<2?-.5:.5)*nr*e;
      ball(x,px,py,nr,P);x.fillStyle=css('--ink');x.font='11px '+css('--mono');x.textAlign='center';x.textBaseline='top';if(k===0)x.fillText('H',px,py+nr+5);});
  }else{
    const q=[[-.5,-.5,P],[.5,-.5,Nn],[-.5,.5,Nn],[.5,.5,P]];q.forEach(p=>ball(x,cx+p[0]*nr*1.15,cy+p[1]*nr*1.15,nr,p[2]));
    const f=Math.min(1,(k-.82)/.18);const tf=fusT0<0?0:(now-fusT0-1300)/1000;
    const rr=S*.12+Math.max(0,tf)*S*.25;const al=Math.max(0,1-Math.max(0,tf)/2.2);
    if(al>0){x.strokeStyle='rgba(242,163,58,'+al+')';x.lineWidth=3;x.beginPath();x.arc(cx,cy,rr,0,7);x.stroke();
      x.strokeStyle='rgba(242,163,58,'+al*.5+')';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,rr*.7,0,7);x.stroke();}
    x.fillStyle=css('--ink');x.font='12px '+css('--mono');x.textAlign='center';x.textBaseline='top';x.fillText('Helium',cx,cy+nr*2.1);
    x.fillStyle=css('--amber');x.textBaseline='bottom';x.fillText('Energie: Licht + Wärme',cx,Math.max(18,cy-rr-6));
    if(!fusDone&&al<=0)fusDone=true;
  }
  x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';
  x.fillText(k===0?'4 Wasserstoffkerne (Protonen)':(merged?'1 Heliumkern':'Verschmelzung …'),10,10);
  x.textAlign='right';x.textBaseline='bottom';x.fillText('rot: Proton · grau: Neutron',W-10,H-8);
}
function ball(x,px,py,r,c){const g=x.createRadialGradient(px-r*.35,py-r*.35,r*.1,px,py,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.25,c);g.addColorStop(1,c);
  x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,7);x.fill();}

/* ================= 3. Quetschen ================= */
const PRE=[
 {name:'Erde',rs:0.00887,R:6371,fun:'Die Erde müsste auf etwa 9 Millimeter Radius schrumpfen, also ungefähr Murmelgröße, mit der gesamten Masse der Erde darin.'},
 {name:'Sonne',rs:2.953,R:696000,fun:'Die Sonne müsste von 1,4 Millionen Kilometern Durchmesser auf knapp 6 Kilometer schrumpfen. Das passiert ihr nie: Sie ist zu leicht und endet als Weißer Zwerg.'},
 {name:'Sternrest (10 Sonnenmassen)',rs:29.53,R:6400,fun:'Ein ausgebrannter Kern mit 10 Sonnenmassen, hier etwa erdgroß angenommen. Er muss unter 30 Kilometer Radius fallen. Genau das passiert oben beim Kollaps, in weniger als einer Sekunde.'}];
let pre=1, sq=null;
const sqI=$('sq');
function rOverRs(){const p=PRE[pre];const a=Math.log(p.R/p.rs),b=Math.log(0.6);const t=sqI.value/1000;return Math.exp(a*(1-t)+b*t);}
function setT(rTarget){const p=PRE[pre];const a=Math.log(p.R/p.rs),b=Math.log(0.6);sqI.value=Math.round((a-Math.log(rTarget))/(a-b)*1000);DS.syncRange(sqI);}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{pre=+b.dataset.p;
  document.querySelectorAll('.seg button').forEach(z=>z.setAttribute('aria-pressed',z===b));sqI.value=0;DS.syncRange(sqI);updSq();});
sqI.addEventListener('input',updSq);
function fmtKm(km){if(km>=100)return nf(Math.round(km),0)+' km';if(km>=1)return nf(km,1)+' km';if(km>=0.001)return nf(km*1000,km*1000>=10?0:1)+' m';return nf(km*1e6,1)+' mm';}
function updSq(){
  const p=PRE[pre];const r=rOverRs();const km=r*p.rs;
  $('rRad').textContent=fmtKm(km);$('rRs').textContent=fmtKm(p.rs);
  if(r>1){const f=Math.sqrt(1/r);$('rEsc').textContent=nf(Math.round(299792*f),0)+' km/s';$('rPct').textContent=(f<0.01?nf(f*100,2):nf(f*100,1))+' %';}
  else{$('rEsc').textContent='mehr als Licht';$('rPct').textContent='> 100 %';}
  const st=$('sqStatus');st.className='status';
  if(r>10)st.textContent='Ganz normal. Licht fliegt praktisch geradeaus davon.';
  else if(r>3){st.textContent='Licht wird schon sichtbar gebogen.';st.classList.add('warn');}
  else if(r>1.5){st.textContent='Seitlich abgestrahltes Licht wird stark gebogen, kommt aber noch raus.';st.classList.add('warn');}
  else if(r>1){const pc=Math.asin(Math.min(1,2.598*Math.sqrt(1-1/r)/r))*180/Math.PI;st.textContent='Nur Licht in einem engen Kegel nach oben entkommt (± '+Math.round(pc)+'°). Alles andere fällt zurück.';st.classList.add('warn');}
  else{st.textContent='Schwarzes Loch. Kein Licht kommt mehr heraus, auch nicht senkrecht nach oben.';st.classList.add('bh');}
  $('sqFun').textContent=p.fun;
  drawSq();
}
function traceRay(r0,psi,viewR){
  // exakte Photonenbahn, Einheiten rₛ = 1, Start oben auf der Oberfläche
  const u0=1/r0;const sgn=psi<0?-1:1;const s=Math.abs(psi);
  const b=Math.max(1e-5,r0*Math.sin(s)/Math.sqrt(1-u0));
  const vr=Math.sqrt(Math.max(0,1/(b*b)-u0*u0*(1-u0))),vt=u0;
  let px=0,py=r0,vx=sgn*vt,vy=vr;const pts=[[px,py]];const ds=viewR*.004;let out=false;
  for(let i=0;i<5000;i++){
    let r=Math.hypot(px,py);let sp=Math.hypot(vx,vy);const dt=ds/sp;
    let k=-1.5/Math.pow(r,5);vx+=k*px*.5*dt;vy+=k*py*.5*dt;px+=vx*dt;py+=vy*dt;
    r=Math.hypot(px,py);k=-1.5/Math.pow(r,5);vx+=k*px*.5*dt;vy+=k*py*.5*dt;
    pts.push([px,py]);
    if(r>r0*1.0005)out=true;
    if(out&&r<r0)return{pts,esc:false};
    if(r>viewR*1.6)return{pts,esc:true};
  }
  return{pts,esc:true};
}
function drawSq(){
  if(!sq)return;const{x,W,H}=sq;x.fillStyle='#000';x.fillRect(0,0,W,H);
  const r0=rOverRs();const viewR=Math.max(3.2,r0*2.2);const S=Math.min(W,H)/2/viewR;
  const cx=W/2,cy=H*.62;const T=(a,b)=>[cx+a*S,cy-b*S];
  // Hilfskreise
  x.setLineDash([3,4]);x.lineWidth=1;
  [[1,'rₛ'],[1.5,'1,5 rₛ']].forEach(([rr,l])=>{if(rr*S<2)return;x.strokeStyle='rgba(144,151,170,.6)';x.beginPath();x.arc(cx,cy,rr*S,0,7);x.stroke();
    x.fillStyle=css('--mute');x.font='11px '+css('--mono');x.textAlign='left';x.textBaseline='middle';x.fillText(l,cx+rr*S*.72+4,cy+rr*S*.72);});
  x.setLineDash([]);
  if(1*S<2){x.fillStyle=css('--mute');x.font='11px '+css('--mono');x.textAlign='left';x.textBaseline='middle';x.fillText('rₛ ist hier nur ein Punkt',cx+8,cy);x.fillStyle='rgba(144,151,170,.8)';x.beginPath();x.arc(cx,cy,1.5,0,7);x.fill();}
  // Körper
  if(r0>1){
    const g=x.createRadialGradient(cx-r0*S*.3,cy-r0*S*.3,r0*S*.1,cx,cy,r0*S);
    const glow=Math.min(1,Math.max(.15,(r0-1)/2));
    g.addColorStop(0,'rgba(255,214,150,'+glow+')');g.addColorStop(1,'rgba(200,100,40,'+glow*.8+')');
    x.fillStyle=g;x.beginPath();x.arc(cx,cy,r0*S,0,7);x.fill();
    // Strahlen
    const N=W<500?15:21;
    for(let i=0;i<N;i++){const psi=(-88+176*i/(N-1))*Math.PI/180;const{pts,esc}=traceRay(r0,psi,viewR);
      x.strokeStyle=esc?css('--amber'):css('--magenta');x.lineWidth=1.6;x.globalAlpha=.95;
      x.beginPath();pts.forEach((p,j)=>{const[a,b]=T(p[0],p[1]);j?x.lineTo(a,b):x.moveTo(a,b);});x.stroke();}
    x.globalAlpha=1;
    const[ea,eb]=T(0,r0);x.fillStyle=css('--ink');x.beginPath();x.arc(ea,eb,3.2,0,7);x.fill();
    x.font='11px '+css('--mono');x.fillStyle=css('--mute');x.textAlign='left';x.textBaseline='top';
    x.fillText('Lichtquelle auf der Oberfläche',10,10);
  }else{
    x.fillStyle='#000';x.beginPath();x.arc(cx,cy,S,0,7);x.fill();
    x.strokeStyle='rgba(224,92,193,.85)';x.lineWidth=1.5;x.beginPath();x.arc(cx,cy,S,0,7);x.stroke();
    x.fillStyle='rgba(255,214,150,.35)';x.beginPath();x.arc(cx,cy,Math.max(2,r0*S),0,7);x.fill();
    // ein paar Strahlen, die nicht rauskommen
    x.strokeStyle=css('--magenta');x.lineWidth=1.6;
    for(let i=0;i<7;i++){const a=Math.PI/2+(-60+20*i)*Math.PI/180;const[sx0,sy0]=T(Math.cos(a)*r0,Math.sin(a)*r0);
      const L=(1-r0)*S*.85;x.beginPath();x.moveTo(sx0,sy0);x.quadraticCurveTo(sx0+Math.cos(a)*L,sy0-Math.sin(a)*L,sx0+Math.cos(a)*L*.2,sy0-Math.sin(a)*L*.2);x.stroke();}
    x.font='11px '+css('--mono');x.textAlign='center';x.textBaseline='top';x.fillStyle=css('--ink');
    x.fillText('Ereignishorizont',cx,cy+S+8);
    x.fillStyle=css('--mute');x.textAlign='left';x.fillText('Die Masse liegt jetzt innerhalb von rₛ',10,10);
  }
}

/* ================= Animation und Größen ================= */
function resizeAll(){star=fit($('cvStar'));fus=fit($('cvFus'));sq=fit($('cvSq'));drawSq();}
DS.onResize([$('cvStar'),$('cvFus'),$('cvSq')],resizeAll);
DS.animate($('cvStar'),drawStar);
DS.animate($('cvFus'),drawFus);
resizeAll();setStage(0);setT(2.4);updSq();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{resizeAll();});
})();
