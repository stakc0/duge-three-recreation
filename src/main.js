import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import typeface from 'three/examples/fonts/helvetiker_bold.typeface.json';
import './world.css';

// All geometry, shaders and artwork in this implementation are authored here.
const $ = s => document.querySelector(s);
const canvas = $('#scene');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:true, powerPreference:'high-performance'}); }
catch (e) { $('#fallback').hidden=false; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();
const skyColor=new THREE.Color('#8fc5e3');
scene.background=skyColor.clone();
scene.fog=new THREE.FogExp2('#a9cfda',.025);
const camera=new THREE.PerspectiveCamera(34,innerWidth/innerHeight,.1,180);
camera.position.set(3.5,4.8,8.5);
const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.24,.6,.85);
composer.addPass(bloom);
const bokeh=new BokehPass(scene,camera,{focus:9,aperture:.00022,maxblur:.014});
composer.addPass(bokeh);
composer.addPass(new OutputPass());
const clock=new THREE.Clock();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=()=>innerWidth<640;
let seed=527;
function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const fur=mat('#c99648'), cream=mat('#dfb573'), earMat=mat('#a87635'), dark=mat('#241b15',.35), pink=mat('#d77d78');
const furCanvas=document.createElement('canvas');furCanvas.width=furCanvas.height=512;const fc=furCanvas.getContext('2d');fc.fillStyle='#a38c69';fc.fillRect(0,0,512,512);for(let i=0;i<28000;i++){const v=90+Math.floor(rand()*130);fc.strokeStyle=`rgb(${v},${v},${v})`;const x=rand()*512,y=rand()*512;fc.beginPath();fc.moveTo(x,y);fc.lineTo(x+(rand()-.5)*3,y+2+rand()*8);fc.stroke();}const furTexture=new THREE.CanvasTexture(furCanvas);furTexture.wrapS=furTexture.wrapT=THREE.RepeatWrapping;furTexture.repeat.set(3,2);for(const m of [fur,cream,earMat]){m.bumpMap=furTexture;m.bumpScale=.035;}
const land=new THREE.Group(), ocean=new THREE.Group(), falls=new THREE.Group();
scene.add(land,ocean,falls);
land.visible=false;falls.visible=false;
function mesh(geo,material,parent,p=[0,0,0],scale=[1,1,1]){const m=new THREE.Mesh(geo,material);m.position.set(...p);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function oval(parent,material,p,s){return mesh(new THREE.SphereGeometry(1,32,24),material,parent,p,s);}
function tube(parent,points,r,material){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,8,false),material,parent);}

// Sculpted, asymmetric retriever silhouette, drooping ears, muzzle, toes, curl and fur strokes.
function puppy(){
 const g=new THREE.Group();const forelegs=[];
 const torso=mesh(new THREE.LatheGeometry([new THREE.Vector2(.22,0),new THREE.Vector2(.39,.12),new THREE.Vector2(.43,.42),new THREE.Vector2(.35,.73),new THREE.Vector2(.29,.94),new THREE.Vector2(.16,1.04)],40),fur,g,[0,.22,0]);
 oval(g,cream,[0,.75,.27],[.27,.49,.14]);
 for(const side of [-1,1]){
  oval(g,fur,[side*.29,.22,-.05],[.24,.26,.3]);
  const arm=new THREE.Group();arm.position.set(side*.19,.72,.24);g.add(arm);forelegs.push(arm);
  oval(arm,fur,[0,-.32,0],[.13,.34,.14]);
  oval(arm,cream,[0,-.59,.11],[.16,.12,.23]);
  for(let k=-1;k<=1;k++)tube(arm,[[k*.055,-.575,.28],[k*.052,-.54,.24]],.005,earMat);
 }
 const head=new THREE.Group();head.position.set(0,1.17,.08);g.add(head);
 oval(head,fur,[0,.12,0],[.43,.43,.36]);
 oval(head,cream,[0,-.08,.29],[.25,.16,.22]);
 for(const side of [-1,1]){
  const ear=oval(head,earMat,[side*.395,.02,-.01],[.145,.32,.115]);ear.rotation.z=side*.22;
  oval(head,fur,[side*.39,.04,.045],[.115,.28,.075]);
  oval(head,earMat,[side*.175,.18,.296],[.065,.064,.035]);
  oval(head,dark,[side*.175,.17,.321],[.043,.049,.035]);
  oval(head,mat('#fff4d9',.15),[side*.175-.012,.19,.352],[.012,.014,.009]);
  oval(head,cream,[side*.19,.29,.29],[.075,.02,.015]);
 }
 const nose=oval(head,dark,[0,-.035,.489],[.105,.067,.056]);nose.rotation.z=.03;
 tube(head,[[0,-.08,.49],[0,-.14,.475],[-.09,-.155,.447]],.009,dark);
 tube(head,[[0,-.14,.475],[.09,-.155,.447]],.009,dark);
 oval(head,pink,[.045,-.19,.419],[.06,.063,.035]);
 const tail=new THREE.Group();g.add(tail);
 tube(tail,[[0,.4,-.24],[.12,.55,-.52],[.34,.8,-.58],[.49,.91,-.48]],.085,fur);
 const scarf=mesh(new THREE.TorusGeometry(.285,.038,8,48),mat('#ae4435'),g,[0,1,.08]);scarf.rotation.x=Math.PI/2;
 const shape=new THREE.Shape();shape.moveTo(-.14,0);shape.lineTo(.14,0);shape.lineTo(.04,-.23);shape.closePath();
 const bib=mesh(new THREE.ShapeGeometry(shape),mat('#b34a35'),g,[0,.99,.355]);
 const bandana=new THREE.Group();g.add(bandana);bandana.attach(scarf);bandana.attach(bib);
 // Small tapered fur strands break the otherwise perfectly smooth silhouette.
 const hairs=new THREE.BufferGeometry();const hp=[];
 for(let i=0;i<1100;i++){const a=rand()*Math.PI*2,z=rand()*2-1,r=Math.sqrt(1-z*z);const x=Math.cos(a)*r,y=z,zz=Math.sin(a)*r;const isHead=i<650;const center=isHead?[0,1.29,.08]:[0,.7,0];const s=isHead?[.429,.429,.359]:[.37,.47,.33];const p=[center[0]+x*s[0],center[1]+y*s[1],center[2]+zz*s[2]];hp.push(...p,p[0]+x*.018,p[1]+y*.025,p[2]+zz*.018);}
 hairs.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));g.add(new THREE.LineSegments(hairs,new THREE.LineBasicMaterial({color:'#dbb064',transparent:true,opacity:.25})));
 g.userData={head,tail,bandana,forelegs,torso};return g;
}
const dog=puppy();scene.add(dog);
const sun=new THREE.DirectionalLight('#fff0cb',2.8);sun.position.set(-3,8,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.1,far:40});sun.shadow.bias=-.0002;sun.shadow.normalBias=.035;scene.add(sun);
scene.add(new THREE.HemisphereLight('#c4eaff','#35491d',1.0));
function height(x,z){return -.1+Math.sin(x*.25)*.28+Math.cos(z*.32)*.18+Math.sin(x*.42+z*.21)*.15;}
const groundGeo=new THREE.PlaneGeometry(100,100,160,160);groundGeo.rotateX(-Math.PI/2);
const gp=groundGeo.attributes.position;const gc=[];
for(let i=0;i<gp.count;i++){const x=gp.getX(i),z=gp.getZ(i);gp.setY(i,height(x,z));const c=new THREE.Color().setHSL(.22+rand()*.025,.5,.19+rand()*.065);gc.push(c.r,c.g,c.b);}
groundGeo.setAttribute('color',new THREE.Float32BufferAttribute(gc,3));groundGeo.computeVertexNormals();mesh(groundGeo,new THREE.MeshStandardMaterial({color:'#557c26',vertexColors:true,roughness:1}),land);

// Instanced bent ribbons: a continuous meadow, not separated cone clumps.
const bladeGeo=new THREE.BufferGeometry();
bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.019,0,0,.019,0,0,-.014,.32,.015,.014,.32,.015,-.008,.65,.065,.008,.65,.065,0,1,.16],3));
bladeGeo.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6]);bladeGeo.computeVertexNormals();
const grassMat=new THREE.MeshStandardMaterial({color:'#91b83b',roughness:1,side:THREE.DoubleSide});
const wind={value:0};
grassMat.onBeforeCompile=shader=>{shader.uniforms.uTime=wind;shader.vertexShader='uniform float uTime;\nvarying float vBlade;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBlade=position.y; vec4 root=instanceMatrix*vec4(0.,0.,0.,1.); transformed.x += sin(uTime*1.5+root.x*.7+root.z*.5)*.15*position.y*position.y; transformed.z += cos(uTime+root.x*.4)*.09*position.y;');shader.fragmentShader='varying float vBlade;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= mix(vec3(.35,.48,.22),vec3(1.3,1.24,.75),vBlade);');};
const grass=new THREE.InstancedMesh(bladeGeo,grassMat,90000);const dummy=new THREE.Object3D();
for(let i=0;i<grass.count;i++){let x=(rand()-.5)*30,z=(rand()-.5)*30;const clearing=Math.exp(-(x*x+z*z)*1.8);dummy.position.set(x,height(x,z)-.025,z);dummy.rotation.set(0,rand()*Math.PI*2,(rand()-.5)*.2);const h=(.16+rand()*.29)*(1-clearing*.65);dummy.scale.set(.6+rand()*.8,h,1);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,new THREE.Color().setHSL(.20+rand()*.075,.58,.35+rand()*.12));}
land.add(grass);
const rockMat=mat('#69756a');const rockGeo=new THREE.IcosahedronGeometry(1,2);
for(let i=0;i<80;i++){const a=rand()*Math.PI*2,r=4+rand()*29;const x=Math.cos(a)*r,z=Math.sin(a)*r;const s=.2+rand()*1.1;const rock=mesh(rockGeo,rockMat,land,[x,height(x,z),z],[s,s*.65,s*.8]);rock.rotation.set(rand(),rand()*6,rand());}
// Open meadow: the reference composition is framed by hills, not foreground trees.
for(let i=0;i<13;i++)oval(land,mat('#b7c69b'),[-40+i*7,0,-36-rand()*10],[8+rand()*6,3+rand()*5,7]);
const wordGeo=new TextGeometry('duge',{font:new FontLoader().parse(typeface),size:.8,depth:.22,curveSegments:5,bevelEnabled:true,bevelThickness:.025,bevelSize:.02,bevelSegments:2});
mesh(wordGeo,mat('#eaf0d8'),land,[.5,.05,-5]);
const petals=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),mat('#fff2b7'),1000);
for(let i=0;i<1000;i++){const x=(rand()-.5)*28,z=(rand()-.5)*28;dummy.position.set(x,height(x,z)+.3+rand()*.2,z);dummy.scale.set(.035,.017,.035);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);}land.add(petals);
const motesGeo=new THREE.BufferGeometry();const mp=[];for(let i=0;i<150;i++)mp.push((rand()-.5)*20,rand()*4,(rand()-.5)*20);motesGeo.setAttribute('position',new THREE.Float32BufferAttribute(mp,3));const motes=new THREE.Points(motesGeo,new THREE.PointsMaterial({color:'#fff6bd',size:.025,transparent:true,opacity:.7}));land.add(motes);

// Analytic ocean normals supply moving fine ripples and broad reflected sky highlights.
const waterUniforms={uTime:{value:0},uDeep:{value:new THREE.Color('#07586f')},uShallow:{value:new THREE.Color('#4ab0c0')}};
const waterMat=new THREE.ShaderMaterial({uniforms:waterUniforms,vertexShader:`uniform float uTime; varying vec3 vWorld; varying vec2 vUv; void main(){vec3 p=position; p.y+=sin(p.x*.6+uTime*.7)*.09+cos(p.z*.8+uTime*.8)*.07;vUv=uv;vWorld=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,fragmentShader:`uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; varying vec3 vWorld; varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float waves(vec2 p){vec2 q=p+vec2(uTime*.11,uTime*.07);return noise(q*.8)*.65+noise(q*2.7-vec2(uTime*.2,0.))*.27+noise(q*8.1)*.09+noise(q*25.3)*.025;}
void main(){vec2 p=vWorld.xz;float e=.012;float h=waves(p);vec3 n=normalize(vec3((h-waves(p+vec2(e,0.)))*1.3,e,(h-waves(p+vec2(0.,e)))*1.3));vec3 v=normalize(cameraPosition-vWorld);float f=pow(1.-max(dot(n,v),0.),2.);vec3 l=normalize(vec3(-.3,1.,.5));float spec=pow(max(dot(reflect(-l,n),v),0.),95.);vec3 reflected=reflect(-v,n);vec2 sky=reflected.xz/max(.12,reflected.y);float cloud=smoothstep(.48,.94,noise(sky*1.5)+noise(sky*4.)*.3);vec3 reflection=mix(vec3(.14,.47,.62),vec3(.88,.96,1.),cloud);vec3 c=mix(uDeep,uShallow,.15);c=mix(c,reflection,.12+f*.48);c+=vec3(.8,.94,1.)*spec*.8;gl_FragColor=vec4(c,1.);#include <tonemapping_fragment>\n#include <colorspace_fragment>}`.replace(';#include',';\n#include')});
const waterGeo=new THREE.PlaneGeometry(150,150,180,180);waterGeo.rotateX(-Math.PI/2);mesh(waterGeo,waterMat,ocean,[0,-.14,0]);
const boat=new THREE.Group();ocean.add(boat);
const rindMat=new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;void main(){float stripe=sin(vUv.x*110.+sin(vUv.y*16.+vUv.x*30.)*.4);vec3 c=mix(vec3(.045,.20,.04),vec3(.40,.57,.09),smoothstep(-.3,.7,stripe));gl_FragColor=vec4(c,1.);}'});
mesh(new THREE.CylinderGeometry(.79,.68,.38,64,1,true),rindMat,boat,[0,.03,0]);
mesh(new THREE.CylinderGeometry(.76,.76,.05,64),mat('#ca7570'),boat,[0,.19,0]);
const rim=mesh(new THREE.TorusGeometry(.765,.035,12,80),cream,boat,[0,.23,0]);rim.rotation.x=Math.PI/2;
mesh(new THREE.CylinderGeometry(.012,.012,1.65,8),cream,boat,[-.55,.98,-.23]);
const flagGeo=new THREE.PlaneGeometry(.65,.39,12,5);const flag=mesh(flagGeo,new THREE.MeshStandardMaterial({color:'#172a30',side:THREE.DoubleSide}),boat,[-.86,1.57,-.23]);
// Original paw emblem (not the reference pirate artwork).
for(const [x,y,s] of [[0,0,.08],[-.1,.12,.04],[.0,.16,.04],[.1,.12,.04]])oval(boat,cream,[-.86+x,1.54+y,-.215],[s,s,.008]);

// A continuous animated sheet and spray, surrounded by irregular cliff faces.
const cliff=new THREE.Group();falls.add(cliff);
for(let i=0;i<36;i++){const side=i%2?1:-1;const x=side*(1.3+rand()*3.5);const y=rand()*5;mesh(rockGeo,mat(i%3?'#647c72':'#87968a'),cliff,[x,y,-2-rand()*2],[.8+rand(),.8+rand()*1.2,.7+rand()]);}
const fallMat=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{uTime:wind},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float uTime;void main(){float s=sin(vUv.x*110.+sin(vUv.y*9.-uTime*5.)*2.)*.5+.5;float t=sin(vUv.y*45.-uTime*12.+vUv.x*8.)*.5+.5;vec3 c=mix(vec3(.22,.60,.65),vec3(.86,.98,1.),s*.5+t*.35);float edge=smoothstep(0.,.12,vUv.x)*smoothstep(0.,.12,1.-vUv.x);gl_FragColor=vec4(c,edge*.87);}'});
mesh(new THREE.PlaneGeometry(2.6,7,30,40),fallMat,falls,[0,2.6,-2]);
mesh(rockGeo,rockMat,falls,[0,-.10,.1],[.8,.22,.7]);
const pool=mesh(new THREE.CircleGeometry(4,64),waterMat,falls,[0,-.12,0]);pool.rotation.x=-Math.PI/2;
const sprayGeo=new THREE.BufferGeometry(),sp=[];for(let i=0;i<500;i++)sp.push((rand()-.5)*3,rand()*3,-1+rand()*2);sprayGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));const spray=new THREE.Points(sprayGeo,new THREE.PointsMaterial({color:'#d6faff',size:.04,transparent:true,opacity:.6}));falls.add(spray);

const cave=new THREE.Group();scene.add(cave);cave.visible=false;
mesh(new THREE.CircleGeometry(12,64),mat('#586864'),cave,[0,-.08,0]).rotation.x=-Math.PI/2;
for(let i=0;i<52;i++){const a=i/52*Math.PI;const x=Math.cos(a)*4.3,y=Math.sin(a)*5;const rock=mesh(rockGeo,mat(i%3?'#3f575a':'#586c65'),cave,[x,y,-2.5-rand()*2],[.9+rand()*.6,.8+rand(),.7+rand()]);rock.rotation.set(rand(),rand(),rand());}
const caveLight=new THREE.PointLight('#f7cf8e',8,8,2);caveLight.position.set(-2,2,2);cave.add(caveLight);

let state='ocean',station=0,transitionStart=0,drag=0,dragTarget=0,pet=0,quality=true;
let portraitColor='#9fd6e1';
const look=new THREE.Vector3(0,.6,0),targetLook=look.clone(),targetCamera=new THREE.Vector3();
const names=['the meadow','behind the falls','the little collection','your little duge'];
function setStation(n){station=THREE.MathUtils.clamp(n,0,3);state='main';land.visible=station===0;cave.visible=station===2;falls.visible=station===1;ocean.visible=false;dog.visible=true;dog.position.set(0,height(0,0)+.01,0);dog.scale.setScalar(1);document.body.classList.add('exploring');document.body.classList.remove('travelling');document.body.dataset.station=station;$('#welcome').hidden=true;$('#stations').hidden=false;$('#gallery').hidden=station!==2;$('#portrait').hidden=station!==3;$('#place').textContent=names[station];$('#hint').textContent=station===3?'DRAG TO TURN':'SCROLL TO EXPLORE · DRAG TO LOOK';$('#journey').textContent='';document.querySelectorAll('[data-station]').forEach((b,i)=>{b.classList.toggle('active',i===station);b.setAttribute('aria-current',i===station?'step':'false');});dragTarget=0;}
function enter(){if(state!=='ocean')return;state='dive';transitionStart=clock.elapsedTime;document.body.classList.add('travelling');$('#enter').disabled=true;$('#hint').textContent='';if(reduced)setStation(0);}
$('#enter').onclick=enter;
$('.wordmark').onclick=e=>{e.preventDefault();state='ocean';land.visible=falls.visible=cave.visible=false;ocean.visible=true;$('#welcome').hidden=false;$('#enter').disabled=false;$('#stations').hidden=$('#gallery').hidden=$('#portrait').hidden=true;document.body.className='';$('#place').textContent='somewhere at sea';$('#hint').textContent='PRESS ENTER';};
document.querySelectorAll('[data-station]').forEach(b=>b.onclick=()=>setStation(Number(b.dataset.station)));
let lastWheel=0;
addEventListener('wheel',e=>{if(state==='ocean'){enter();return;}if(state!=='main'||performance.now()-lastWheel<1000||Math.abs(e.deltaY)<12)return;setStation(station+(e.deltaY>0?1:-1));lastWheel=performance.now();},{passive:true});
addEventListener('keydown',e=>{if(e.target.matches('input,button'))return;if(e.key==='Enter')enter();if(state==='main'&&['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(e.key)){e.preventDefault();setStation(station+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1));}});
let down=null;
canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,last:e.clientX};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!down)return;dragTarget+=(e.clientX-down.last)*.009;down.last=e.clientX;});
canvas.addEventListener('pointerup',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dy)>65&&Math.abs(dy)>Math.abs(dx)&&state==='main')setStation(station+(dy<0?1:-1));else if(Math.hypot(dx,dy)<8){if(state==='ocean')enter();else{pet=1;toast('a very good dog.');}}down=null;});
canvas.addEventListener('pointercancel',()=>down=null);
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2200);}
$('#quality').onclick=()=>{quality=!quality;bokeh.enabled=quality;bloom.enabled=quality;grass.count=quality?90000:40000;renderer.setPixelRatio(Math.min(devicePixelRatio,quality?1.6:1));composer.setPixelRatio(renderer.getPixelRatio());$('#quality').textContent='quality '+(quality?'high':'low');};
// Real opt-in ambient audio, synthesised locally; no fake sound toggle.
let audioCtx,audioGain;
$('#sound').onclick=async()=>{if(!audioCtx){audioCtx=new AudioContext();const buffer=audioCtx.createBuffer(1,audioCtx.sampleRate*4,audioCtx.sampleRate);const data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+(.02*(Math.random()*2-1)))/1.02;data[i]=last*3.5;}const source=audioCtx.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;audioGain=audioCtx.createGain();audioGain.gain.value=.22;source.connect(filter).connect(audioGain).connect(audioCtx.destination);source.start();}if(audioCtx.state==='suspended')await audioCtx.resume();const on=$('#sound').getAttribute('aria-pressed')!=='true';audioGain.gain.setTargetAtTime(on?.22:0,audioCtx.currentTime,.4);$('#sound').setAttribute('aria-pressed',String(on));$('#sound').setAttribute('aria-label',on?'Mute ambient sound':'Enable ambient sound');$('#sound').innerHTML=`sound ${on?'on':'off'} <span>◌</span>`;};
$('#bandana').onchange=e=>dog.userData.bandana.visible=e.target.checked;
document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{portraitColor=b.dataset.color;document.querySelectorAll('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
function download(c,name){c.toBlob(blob=>{if(!blob){toast('Unable to export this image.');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Saved. A little duge, just for you.');},'image/png');}
function capturePortrait(){const oldPosition=camera.position.clone(),oldQuat=camera.quaternion.clone(),oldAspect=camera.aspect;const oldBg=scene.background.clone(),oldFog=scene.fog;const visibility=[land.visible,ocean.visible,falls.visible,cave.visible];const oldDog=dog.position.clone();land.visible=ocean.visible=falls.visible=cave.visible=false;scene.fog=null;scene.background=new THREE.Color(portraitColor);dog.position.set(0,0,0);camera.aspect=1;camera.position.set(0,1.1,3.5);camera.lookAt(0,.86,0);camera.updateProjectionMatrix();const size=renderer.getSize(new THREE.Vector2());const ratio=renderer.getPixelRatio();renderer.setPixelRatio(1);renderer.setSize(1024,1024,false);renderer.render(scene,camera);const out=document.createElement('canvas');out.width=out.height=1024;out.getContext('2d').drawImage(canvas,0,0);renderer.setPixelRatio(ratio);renderer.setSize(size.x,size.y,false);camera.position.copy(oldPosition);camera.quaternion.copy(oldQuat);camera.aspect=oldAspect;camera.updateProjectionMatrix();scene.background=oldBg;scene.fog=oldFog;[land.visible,ocean.visible,falls.visible,cave.visible]=visibility;dog.position.copy(oldDog);return out;}
$('#save-pfp').onclick=()=>download(capturePortrait(),'little-duge.png');
let cardIndex=0;const captions=['no thoughts. just meadow.','emotionally at sea.','professional good boy.','touch grass. bring snacks.'];
function showCard(){const out=capturePortrait();const ctx=out.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,825,1024,199);ctx.fillStyle='#294a43';ctx.font='bold 43px Arial';ctx.textAlign='center';ctx.fillText(captions[cardIndex],512,931);$('#cards').replaceChildren(out);$('#page-count').textContent=`${cardIndex+1} / ${captions.length}`;}
$('#previous').onclick=()=>{cardIndex=(cardIndex+captions.length-1)%captions.length;showCard();};$('#next').onclick=()=>{cardIndex=(cardIndex+1)%captions.length;showCard();};$('#save-meme').onclick=()=>download($('#cards canvas'),'duge-postcard.png');
showCard();
const shortcutImage=capturePortrait().toDataURL('image/png');document.querySelectorAll('.shortcut-art').forEach(el=>{const image=new Image();image.src=shortcutImage;image.alt='';el.append(image);});document.querySelectorAll('[data-jump]').forEach(b=>b.onclick=()=>setStation(Number(b.dataset.jump)));

function frame(){requestAnimationFrame(frame);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;wind.value=reduced?0:t;waterUniforms.uTime.value=t;drag=THREE.MathUtils.damp(drag,dragTarget,5,dt);pet=Math.max(0,pet-dt);dog.userData.forelegs[1].rotation.z=THREE.MathUtils.damp(dog.userData.forelegs[1].rotation.z,(state==='ocean'||pet>0)?2+Math.sin(t*4)*.13:0,5,dt);dog.userData.tail.rotation.y=Math.sin(t*(pet>0?17:4))*.24;dog.userData.head.rotation.z=Math.sin(t*.7)*.035;dog.userData.head.rotation.x=Math.sin(t*1.3)*.018;dog.rotation.y=drag;dog.userData.torso.scale.y=1+Math.sin(t*2)*.012;
 if(state==='ocean'||state==='dive'){
  ocean.visible=true;dog.position.set(0,.22+Math.sin(t*.8)*.06,0);dog.scale.setScalar(.73);boat.position.y=Math.sin(t*.8)*.06;boat.rotation.z=Math.sin(t*.65)*.025;dog.rotation.z=boat.rotation.z;
  const fp=flagGeo.attributes.position;for(let i=0;i<fp.count;i++)fp.setZ(i,Math.sin(fp.getX(i)*9+t*3)*.035);fp.needsUpdate=true;
  targetCamera.set(mobile()?1.8:2.8,mobile()?4.6:4.5,mobile()?8.5:7.4);targetLook.set(0,.25,0);
  scene.background.copy(skyColor);scene.fog.color.set('#9ecdd7');scene.fog.density=.017;
  if(state==='dive'){const p=(t-transitionStart)/2.8;targetCamera.set(2.8*(1-p),4.5-p*3,7.4-p*6);if(p>=1){state='falls';transitionStart=t;ocean.visible=false;falls.visible=true;dog.visible=false;$('#journey').textContent='a little further';camera.position.set(0,4.5,6);}}
 }else if(state==='falls'){
  targetCamera.set(0,1.2,3.5);targetLook.set(0,1,-2);scene.fog.color.set('#9fcbd0');scene.fog.density=.045;
  if(t-transitionStart>3.3)setStation(0);
 }else{
  dog.rotation.z=0;dog.position.y=station===1?.12:station===2?-.08:height(0,0)+.01;dog.scale.setScalar(1);
  scene.background.lerp(new THREE.Color(station===3?portraitColor:station===1?'#b5d1d3':station===2?'#29444c':'#8fc5e3'),.05);scene.fog.color.copy(scene.background);scene.fog.density=station===3?0:.025;
  if(station===0){const a=.65+drag*.24;const r=mobile()?6.3:6.4;targetCamera.set(Math.sin(a)*r,1.38,Math.cos(a)*r);targetLook.set(mobile()?0:-.42,.85,0);}
  if(station===1){targetCamera.set(3+Math.sin(drag)*1.2,1.7,6);targetLook.set(0,1,-.7);}
  if(station===2||station===3){targetCamera.set(mobile()?0:2.1,mobile()?1.75:1.3,mobile()?5.8:4.5);targetLook.set(mobile()?0:.95,mobile()?.3:.85,0);}
 }
 camera.position.lerp(targetCamera,1-Math.exp(-dt*2.8));look.lerp(targetLook,1-Math.exp(-dt*3));camera.lookAt(look);
 bokeh.uniforms.focus.value=camera.position.distanceTo(new THREE.Vector3(0,.85,0));bokeh.uniforms.aperture.value=state==='main'?.00075:.0012;
 motes.rotation.y=t*.015;
 const positions=sprayGeo.attributes.position;for(let i=0;i<positions.count;i++){let y=positions.getY(i)-dt*(.5+i%5*.15);if(y<0)y=2.5;positions.setY(i,y);}positions.needsUpdate=true;
 composer.render();
}
frame();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);});
// Small read-only diagnostics for browser QA; no production test control hooks.
window.__duge={get state(){return state;},get station(){return station;},get grassCount(){return grass.count;},get rotation(){return dog.rotation.y;},get drawCalls(){return renderer.info.render.calls;}};
