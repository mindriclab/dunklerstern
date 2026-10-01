/* Kapitel 3 · Gekrümmtes Licht
   Shader, Lichtbahnen und Seitenansicht unverändert aus quellen/03-gekruemmtes-licht.html übernommen.
   Neu: Start mit niedriger Auflösung auf schwachen Handys, Pause außerhalb des Bildes,
   Neustart der Auflösungsmessung nach einer Pause, Wiederherstellung nach WebGL-Kontextverlust. */
(function(){
const RIN=3.0, ROUT=12.0, DIST=28.0;
const{reduce,css,$}=DS;
const state={g:1, elev:8, mode:0, dop:0, playing:!reduce, time:0};

/* ---------- WebGL ---------- */
const cv=$('gl');
const gl=cv.getContext('webgl',{antialias:false,preserveDrawingBuffer:false});
let prog=null, U={};
const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const fs=`precision highp float;
uniform vec2 uRes;uniform float uTime,uG,uElev,uMode,uDop,uF;
const float RIN=${RIN.toFixed(1)};const float ROUT=${ROUT.toFixed(1)};
float h31(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h31(i),h31(i+vec3(1,0,0)),f.x),mix(h31(i+vec3(0,1,0)),h31(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h31(i+vec3(0,0,1)),h31(i+vec3(1,0,1)),f.x),mix(h31(i+vec3(0,1,1)),h31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 tcol(float t){
 vec3 c=mix(vec3(.45,.05,.01),vec3(1.,.42,.08),smoothstep(.25,.75,t));
 c=mix(c,vec3(1.,.82,.55),smoothstep(.75,1.2,t));
 c=mix(c,vec3(1.,.97,.92),smoothstep(1.2,1.8,t));
 c=mix(c,vec3(.72,.82,1.),smoothstep(1.8,2.8,t));
 return c;}
float starLayer(vec2 ll,float n,float thr,float rad){
 vec2 g=ll*n;vec2 c=floor(g);vec2 f=fract(g);float h=h21(c);
 if(h<thr)return 0.;vec2 sp=vec2(h21(c+1.37),h21(c+7.11))*.6+.2;
 return smoothstep(rad,0.,length(f-sp))*(.4+.6*(h-thr)/(1.-thr));}
vec3 sky(vec3 d){
 float lon=atan(d.z,d.x);float lat=asin(clamp(d.y,-1.,1.));vec2 ll=vec2(lon,lat);
 float s=starLayer(ll,400./3.14159,.965,.2)+1.6*starLayer(ll,120./3.14159,.985,.08);
 float neb=vn(d*3.)*.6+vn(d*7.)*.4;
 vec3 c=vec3(s)+vec3(.05,.07,.12)*smoothstep(.45,.9,neb)*.5;
 if(uMode>.5){
  vec2 deg=ll*57.2958/15.;
  vec2 dd=abs(fract(deg+.5)-.5)*15.;
  float ln=smoothstep(.3,0.,min(dd.x,dd.y));
  c=c*.5+vec3(.22,.26,.36)*ln;}
 return c;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
 vec3 cam=vec3(0.,${DIST.toFixed(1)}*sin(uElev),${DIST.toFixed(1)}*cos(uElev));
 vec3 fw=normalize(-cam);vec3 rt=normalize(cross(fw,vec3(0,1,0)));vec3 up=cross(rt,fw);
 vec3 v=normalize(fw+(uv.x*rt+uv.y*up)*uF);vec3 p=cam;
 vec3 hh=cross(p,v);float h2=dot(hh,hh);
 vec3 col=vec3(0.);float al=0.;bool esc=false;
 for(int i=0;i<360;i++){
  float r=length(p);
  float dt=clamp(.08*r-.04,.025,1.5);
  float r5=r*r*r*r*r;vec3 a=-1.5*h2*uG*p/r5;
  vec3 pp=p;v+=a*.5*dt;p+=v*dt;r=length(p);r5=r*r*r*r*r;a=-1.5*h2*uG*p/r5;v+=a*.5*dt;
  if(pp.y*p.y<0.){
   float t=pp.y/(pp.y-p.y);vec3 hp=mix(pp,p,t);float rr=length(hp.xz);
   if(rr>RIN&&rr<ROUT){
    float ang=atan(hp.z,hp.x);float om=pow(rr,-1.5)*2.2;float ra=ang-uTime*om;
    vec3 q=vec3(rr*3.,cos(ra)*2.2,sin(ra)*2.2);
    float tex=.55+.45*(.65*vn(q)+.35*vn(q*2.7+5.));
    float edge=smoothstep(RIN,RIN+.35,rr)*smoothstep(ROUT,ROUT-3.,rr);
    vec3 c;
    if(uMode<.5){
     float x=rr/RIN;float I=pow(x,-2.)*(1.-.8*sqrt(1./x))*6.;
     float D=1.;
     if(uDop>.5){
      float b=sqrt(.5/(rr-1.));float gm=1./sqrt(1.-b*b);
      vec3 vel=normalize(vec3(-hp.z,0.,hp.x));vec3 n=-normalize(v);
      D=1./(gm*(1.-b*dot(vel,n)))*sqrt(1.-1./rr);}
     float t0=1.5*pow(RIN/rr,.75);
     c=tcol(t0*D)*I*tex*pow(D,3.);
    }else{
     bool front=hp.z>0.;bool top=pp.y>0.;
     vec3 k=front?(top?vec3(.949,.639,.227):vec3(.478,.843,.635)):(top?vec3(.298,.788,.941):vec3(.878,.361,.757));
     float fr=fract(rr);float ring=smoothstep(.07,0.,min(fr,1.-fr));
     float sa=ang/(3.14159/6.);float spk=smoothstep(.07,0.,abs(fract(sa+.5)-.5)*(3.14159/6.)*rr);
     float sh=.55+.45*(1.-(rr-RIN)/(ROUT-RIN));
     c=k*(.45+.55*tex)*sh;c=mix(c,vec3(1.),max(ring,spk)*.55);
    }
    col+=(1.-al)*c*edge;al+=(1.-al)*edge;
    if(al>.99)break;
   }
  }
  if(r<1.){al=1.;break;}
  if(r>40.&&dot(p,v)>0.){esc=true;break;}
 }
 if(esc)col+=(1.-al)*sky(normalize(v));
 if(uMode<.5)col=1.-exp(-col*1.1);
 gl_FragColor=vec4(pow(clamp(col,0.,1.),vec3(1./1.1)),1.);
}`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(o));return null;}return o;}
function initGL(){
  prog=null;
  if(gl&&!gl.isContextLost()){
    const a=sh(gl.VERTEX_SHADER,vs),b=sh(gl.FRAGMENT_SHADER,fs);
    if(a&&b){prog=gl.createProgram();gl.attachShader(prog,a);gl.attachShader(prog,b);gl.linkProgram(prog);
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(prog));prog=null;}}
  }
  $('nogl').hidden=!!prog;
  if(prog){
    gl.useProgram(prog);
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    ['uRes','uTime','uG','uElev','uMode','uDop','uF'].forEach(n=>U[n]=gl.getUniformLocation(prog,n));
  }
  dirty=true;
}
let dirty=true;
initGL();
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();prog=null;});
cv.addEventListener('webglcontextrestored',initGL);

// Schwache Handys: mit niedriger Auflösung beginnen, die Anpassung regelt danach selbst nach oben
const coarse=window.matchMedia&&window.matchMedia('(pointer: coarse)').matches;
const weak=coarse&&(Math.min(screen.width,screen.height)<500||(navigator.deviceMemory||8)<=4||(navigator.hardwareConcurrency||8)<=4);
let scale=weak?0.6:1, aspect=1.6;
function fFactor(){return Math.max(0.62, 1.0/aspect);}
function resizeGL(){
  const r=cv.getBoundingClientRect();aspect=r.width/Math.max(1,r.height);
  const dpr=Math.min(window.devicePixelRatio||1,1.5);
  if(r.width*dpr>1100&&scale===1)scale=0.75;
  cv.width=Math.max(2,Math.round(r.width*dpr*scale));cv.height=Math.max(2,Math.round(r.height*dpr*scale));
  dirty=true;
}
function resize(){resizeGL();drawSide();}
function render(){
  if(!prog)return;
  gl.viewport(0,0,cv.width,cv.height);
  gl.uniform2f(U.uRes,cv.width,cv.height);gl.uniform1f(U.uTime,state.time);
  gl.uniform1f(U.uG,state.g);gl.uniform1f(U.uElev,state.elev*Math.PI/180);
  gl.uniform1f(U.uMode,state.mode);gl.uniform1f(U.uDop,state.dop);gl.uniform1f(U.uF,fFactor());
  gl.drawArrays(gl.TRIANGLES,0,3);
}
let last=performance.now(), acc=0, frames=0;
function loop(now){
  const gap=now-last;const dt=Math.min(0.1,gap/1000);last=now;
  if(state.playing){state.time+=dt;dirty=true;}
  tick(now);
  if(dirty){render();dirty=false;
    if(gap>250){acc=0;frames=0;}   // nach einer Pause neu messen
    else{acc+=dt;frames++;
      if(frames>=12){const avg=acc/frames;
        if(avg>0.045&&scale>0.35){scale*=0.85;resizeGL();}
        else if(avg<0.02&&scale<1){scale=Math.min(1,scale*1.08);resizeGL();}
        acc=0;frames=0;}}
  }
}

/* ---------- Seitenansicht ---------- */
const sc=$('side');const sx=sc.getContext('2d');
function traceSide(s){
  const E=state.elev*Math.PI/180,F=fFactor();
  let px=DIST*Math.cos(E),py=DIST*Math.sin(E);
  const fx=-Math.cos(E),fy=-Math.sin(E),ux=-Math.sin(E),uy=Math.cos(E);
  let vx=fx+s*F*ux,vy=fy+s*F*uy;const n=Math.hypot(vx,vy);vx/=n;vy/=n;
  const h=px*vy-py*vx,h2=h*h,g=state.g;const pts=[[px,py]];
  for(let i=0;i<700;i++){
    let r=Math.hypot(px,py);const dt=Math.min(Math.max(0.08*r-0.04,0.025),1.5);
    let k=-1.5*h2*g/Math.pow(r,5);vx+=k*px*.5*dt;vy+=k*py*.5*dt;
    const ox=px,oy=py;px+=vx*dt;py+=vy*dt;
    r=Math.hypot(px,py);k=-1.5*h2*g/Math.pow(r,5);vx+=k*px*.5*dt;vy+=k*py*.5*dt;
    if(oy*py<0){const t=oy/(oy-py);const hx=ox+(px-ox)*t;const ax=Math.abs(hx);
      if(ax>RIN&&ax<ROUT){pts.push([hx,0]);return{pts,cat:(hx>0?'f':'b')+(oy>0?'t':'u')};}}
    pts.push([px,py]);
    if(r<1)return{pts,cat:'cap'};
    if(r>40&&px*vx+py*vy>0)break;
  }
  return{pts,cat:'esc'};
}
function drawSide(){
  const r=sc.getBoundingClientRect();const dpr=Math.min(window.devicePixelRatio||1,2);
  sc.width=Math.round(r.width*dpr);sc.height=Math.round(r.height*dpr);
  const W=r.width,H=r.height;sx.setTransform(dpr,0,0,dpr,0,0);
  sx.fillStyle=css('--panel');sx.fillRect(0,0,W,H);
  const span=W<500?30:32;const S=W/span;const cx=W*0.5,cy=H*0.5;
  const T=(x,y)=>[cx+x*S,cy-y*S];
  // Raster
  sx.strokeStyle='rgba(144,151,170,.10)';sx.lineWidth=1;
  for(let x=-16;x<=16;x+=2){const[a]=T(x,0);sx.beginPath();sx.moveTo(a,0);sx.lineTo(a,H);sx.stroke();}
  for(let y=-10;y<=10;y+=2){const[,b]=T(0,y);sx.beginPath();sx.moveTo(0,b);sx.lineTo(W,b);sx.stroke();}
  // Strahlen
  const C={ft:css('--amber'),fu:css('--mint'),bt:css('--cyan'),bu:css('--magenta'),cap:'rgba(144,151,170,.45)',esc:'rgba(235,230,220,.16)'};
  const N=W<500?31:45;
  for(let i=0;i<N;i++){
    const s=-0.5+i/(N-1);const{pts,cat}=traceSide(s);
    sx.strokeStyle=C[cat];sx.globalAlpha=(cat==='esc')?1:0.9;sx.lineWidth=cat==='esc'?1:1.4;
    sx.beginPath();pts.forEach((p,j)=>{const[a,b]=T(p[0],p[1]);j?sx.lineTo(a,b):sx.moveTo(a,b);});sx.stroke();
    if(cat!=='esc'&&cat!=='cap'){const p=pts[pts.length-1];const[a,b]=T(p[0],p[1]);sx.fillStyle=C[cat];sx.beginPath();sx.arc(a,b,2.6,0,7);sx.fill();}
  }
  sx.globalAlpha=1;
  // Scheibe
  const seg=(x0,x1,ct,cu)=>{const[a0,b0]=T(x0,0),[a1]=T(x1,0);
    sx.lineWidth=2.5;sx.strokeStyle=ct;sx.beginPath();sx.moveTo(a0,b0-1.4);sx.lineTo(a1,b0-1.4);sx.stroke();
    sx.strokeStyle=cu;sx.beginPath();sx.moveTo(a0,b0+1.4);sx.lineTo(a1,b0+1.4);sx.stroke();};
  seg(-ROUT,-RIN,C.bt,C.bu);seg(RIN,ROUT,C.ft,C.fu);
  // Photonensphäre
  const ps=1.5*state.g;
  if(ps>1.02){const[a,b]=T(0,0);sx.setLineDash([3,4]);sx.strokeStyle='rgba(235,230,220,.5)';sx.lineWidth=1;sx.beginPath();sx.arc(a,b,ps*S,0,7);sx.stroke();sx.setLineDash([]);}
  // Horizont
  {const[a,b]=T(0,0);sx.fillStyle='#000';sx.beginPath();sx.arc(a,b,S,0,7);sx.fill();sx.strokeStyle='rgba(235,230,220,.7)';sx.lineWidth=1;sx.stroke();}
  // Beschriftung
  sx.font='11px '+css('--mono');sx.fillStyle=css('--mute');sx.textBaseline='top';
  const lab=(t,x,y,al)=>{const[a,b]=T(x,y);sx.textAlign=al||'center';sx.fillText(t,a,b);};
  lab('Scheibe hinten',-7.5,-0.6);lab('Scheibe vorne',7.5,-0.6);
  lab('Loch',0,-1.6);
  // Auge
  const E=state.elev*Math.PI/180;const ex=Math.cos(E),ey=Math.sin(E);
  const ax=W-10;const ay=Math.max(18,cy-(ey/ex)*(W/2-10));
  sx.fillStyle=css('--ink');sx.textAlign='right';sx.textBaseline='bottom';
  sx.fillText('zum Auge →',ax,ay-6);
}

/* ---------- UI ---------- */
const gI=$('g'),eI=$('el'),dI=$('dop'),mI=$('mid');
function sync(){
  gI.value=Math.round(state.g*100);eI.value=Math.round(state.elev);DS.syncRange(gI);DS.syncRange(eI);
  $('gv').textContent=Math.round(state.g*100)+' %';$('elv').textContent=Math.round(state.elev)+'°';
  $('chip').textContent='Schwerkraft '+Math.round(state.g*100)+' % · Blick '+Math.round(state.elev)+'°';
  $('mReal').setAttribute('aria-pressed',state.mode===0);$('mCode').setAttribute('aria-pressed',state.mode===1);
  $('key').hidden=state.mode!==1;dI.checked=!!state.dop;
  $('play').textContent=state.playing?'Rotation anhalten':'Rotation starten';
  dirty=true;
}
let sideQueued=false;
function changed(){sync();if(!sideQueued){sideQueued=true;requestAnimationFrame(()=>{sideQueued=false;drawSide();});}}
gI.addEventListener('input',()=>{tw=null;state.g=gI.value/100;changed();});
eI.addEventListener('input',()=>{tw=null;state.elev=+eI.value;changed();});
$('mReal').onclick=()=>{state.mode=0;changed();};
$('mCode').onclick=()=>{state.mode=1;changed();};
dI.addEventListener('change',()=>{state.dop=dI.checked?1:0;changed();});
mI.addEventListener('change',()=>{$('midline').hidden=!mI.checked;});
$('play').onclick=()=>{state.playing=!state.playing;sync();};

/* Tween */
let tw=null;
function tweenTo(target,ms){
  if(reduce||ms<=0){Object.assign(state,target);changed();tw=null;return;}
  tw={from:{g:state.g,elev:state.elev},to:target,t0:performance.now(),ms};
}
function tick(now){
  if(!tw)return;const k=Math.min(1,(now-tw.t0)/tw.ms);const e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  if(tw.to.g!=null)state.g=tw.from.g+(tw.to.g-tw.from.g)*e;
  if(tw.to.elev!=null)state.elev=tw.from.elev+(tw.to.elev-tw.from.elev)*e;
  changed();if(k>=1)tw=null;
}

const STEPS=[
 {set:{mode:1,dop:0},tw:{g:0,elev:8},ms:1200,html:'<p><strong>Schwerkraft auf 0 %.</strong> Licht fliegt geradeaus, wie du es aus dem Alltag kennst. Du siehst eine flache Scheibe schräg von der Seite, ähnlich einem Saturnring. In der Mitte sitzt eine kleine schwarze Kugel, der Ereignishorizont. Die <span class="t-amber">orange</span> Hälfte liegt vor der Kugel, die <span class="t-cyan">cyan</span> Hälfte dahinter. Die Kugel verdeckt ein Stück der cyan Hälfte. Nichts Überraschendes.</p>'},
 {set:{mode:1,dop:0,g:0},tw:{g:1,elev:8},ms:3500,html:'<p><strong>Jetzt dreht die Schwerkraft auf.</strong> Beobachte die <span class="t-cyan">cyan</span> Hälfte. Sie liegt hinter dem Loch, und trotzdem klettert sie nach oben und legt sich wie eine Kappe über das Schwarze. Ihr Licht wird über das Loch hinweg zu dir gebogen. Der Buckel, den man von Bildern schwarzer Löcher kennt, liegt also nicht über dem Loch. Er liegt dahinter, du siehst ihn nur um die Ecke.</p>'},
 {set:{mode:1,dop:0},tw:{g:1,elev:8},ms:800,html:'<p><strong>Der Bogen unten ist</strong> <span class="t-mag">magenta</span>: die Unterseite der hinteren Hälfte. Licht, das unter dem Loch durchläuft, wird nach oben gebogen und trifft die Scheibe von unten. Du siehst dieselbe Scheibe also gleichzeitig von oben und von unten. Die feinen Linien sind Ringe im Abstand von 1 rₛ, also einem Horizont-Radius, und Speichen alle 30°, damit du die Verzerrung siehst. Auch der Sternenhimmel mit seinem Gitter wird verbogen.</p>'},
 {set:{mode:0,dop:0},tw:{g:1,elev:8},ms:800,html:'<p><strong>Dieselbe Physik, normale Farben.</strong> Jetzt ergibt das bekannte Bild Sinn: flaches Band vorne, Buckel oben, Bogen unten, alles dieselbe Scheibe. Das Schwarze ist der Schatten. Er besteht aus allen Blickrichtungen, die im Loch enden. Der dünne helle Rand direkt daran ist Licht, das einmal fast ganz um das Loch herumgeflogen ist.</p>'},
 {set:{mode:0,dop:1},tw:{g:1,elev:8},ms:800,html:'<p><strong>So sähe es wirklich aus.</strong> Das Gas kreist innen mit halber Lichtgeschwindigkeit. Die Seite, die auf dich zufliegt, wird viel heller und bläulicher, die andere dunkler und röter. Zusätzlich verliert Licht, das sich aus der Nähe des Lochs herausarbeitet, Energie und wird röter. Interstellar hat das korrekt berechnet und dann bewusst weggelassen.</p>'},
 {set:{mode:0,dop:1},tw:{g:1,elev:60},ms:2000,html:'<p><strong>Blick von schräg oben.</strong> Jetzt wird die Scheibe zum Ring um den Schatten, ähnlich dem echten Foto des Event Horizon Telescope von M87*. Der Buckel verschwindet nicht, er wird nur Teil des Rings. Zieh den Blickwinkel langsam zurück auf 0°, dann siehst du, wie er wieder entsteht.</p>'}
];
const INTRO='<p><strong>So sieht ein schwarzes Loch mit Gasscheibe aus, live berechnet.</strong> Jeder Pixel ist ein Lichtstrahl, der durch die echte Raumkrümmung verfolgt wird. Geh die Schritte von 1 bis 6 durch, dann siehst du, woher jedes Teil kommt. Die Regler kannst du jederzeit selbst bewegen.</p>';
const say=$('say');say.innerHTML=INTRO;
document.querySelectorAll('#steps button').forEach(b=>b.addEventListener('click',()=>{
  const i=+b.dataset.step;const s=STEPS[i];
  document.querySelectorAll('#steps button').forEach(x=>x.removeAttribute('aria-current'));
  b.setAttribute('aria-current','step');
  Object.assign(state,s.set);changed();tweenTo(s.tw,s.ms);
  say.innerHTML=s.html;
}));

DS.onResize([cv,sc],resize);
DS.animate($('stage'),loop);
sync();resize();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawSide);
})();
