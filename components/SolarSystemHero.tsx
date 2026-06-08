'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ventures } from '@/lib/ventures';

type Phase = 'boot' | 'approach' | 'solar';

interface OrbitCfg {
  slug: string;
  radius: number;
  speed: number;
  tilt: number;
  start: number;
  size: number;
}

const ORBIT_CFG: OrbitCfg[] = [
  { slug: 'scoutr',          radius: 7,  speed: 0.28, tilt: 0.08, start: 0.0, size: 1.3 },
  { slug: 'the-marqet',      radius: 11, speed: 0.20, tilt: 0.13, start: 1.2, size: 1.6 },
  { slug: 'the-hyve',        radius: 16, speed: 0.14, tilt: 0.06, start: 2.5, size: 1.9 },
  { slug: 'construx-daily',  radius: 22, speed: 0.09, tilt: 0.18, start: 4.0, size: 1.2 },
  { slug: 'construx-studio', radius: 29, speed: 0.06, tilt: 0.10, start: 0.8, size: 1.4 },
];

const BOOT_LINES = [
  'CONSTRUX NAVIGATION OS v2.1.0',
  'INITIALIZING CORE SYSTEMS...',
  'BOOT: MEMORY BANKS  ██████████ OK',
  'BOOT: PROPULSION    ██████████ OK',
  'BOOT: STAR CHARTS   ██████████ LOADED',
  'BOOT: AI SUBSYSTEMS ██████████ ONLINE',
  'BOOT: VENTURE DB    ██████████ SYNCED',
  '────────────────────────────────────',
  '> SCANNING SECTOR X-11...',
  '> CONSTRUX STAR SYSTEM DETECTED',
  '> 5 PLANETARY BODIES CONFIRMED',
  '> PLOTTING INTERCEPT VECTOR...',
  '> ETA: 3 SECONDS',
  '> INITIATING BURN SEQUENCE...',
];

// ─── GLSL ─────────────────────────────────────────────────────────────────

const NOISE = `
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){
  vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float fbm(vec3 p){
  float v=0.,a=.5;mat3 rot=mat3(.8,-.6,0.,.6,.8,0.,0.,0.,1.);
  for(int i=0;i<8;i++){v+=a*n3(p);p=rot*p*2.02+vec3(31.4,17.1,24.9);a*=.5;}return v;
}
float dw(vec3 p){
  vec3 q=vec3(fbm(p),fbm(p+vec3(5.2,1.3,0.)),fbm(p+vec3(1.7,9.2,3.1)));
  return fbm(p+4.*q);
}
`;

const PLANET_VERT = `
varying vec3 vPos;
void main(){vPos=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;

const ATM_VERT = `
varying vec3 vVN;
void main(){vVN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
`;

const ATM_FRAG = `
varying vec3 vVN;
uniform vec3 uColor;
uniform float uInt;
void main(){
  float f=pow(1.-abs(vVN.z),2.5);
  gl_FragColor=vec4(uColor,f*uInt);
}
`;

const FRAG_SCOUTR = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)+.08;
  float t1=dw(vPos*2.2+uTime*.012);
  float t2=fbm(vPos*5.+uTime*.022);
  float terrain=t1*.65+t2*.35;
  // hex-ish grid
  vec3 pn=vPos;
  vec2 gUv=vec2(atan(pn.z,pn.x)/(6.28318)+.5,acos(clamp(pn.y,-1.,1.))/3.14159)*18.;
  vec2 gL=fract(gUv)-.5;float grid=smoothstep(.455,.475,max(abs(gL.x),abs(gL.y)));
  vec2 gUv2=gUv*5.;vec2 gL2=fract(gUv2)-.5;float grid2=smoothstep(.465,.48,max(abs(gL2.x),abs(gL2.y)))*.35;
  // scan pulse
  float scan=pow(sin(pn.y*28.+uTime*3.5)*.5+.5,10.)*.2;
  float scanH=pow(sin(atan(pn.z,pn.x)*12.+uTime*2.)*.5+.5,8.)*.12;
  // data dots
  float dots=step(.92,hash(floor(vPos*9.)));
  vec3 dark=vec3(.015,.03,.01);vec3 lime=vec3(.78,.96,.047);
  vec3 col=mix(dark,lime*(.35+terrain*.65),terrain*.85);
  col=mix(col,lime,grid*.28+grid2*.14);
  col+=lime*(scan+scanH+dots*.3);
  col*=diff;
  gl_FragColor=vec4(col,1.);
}`;

const FRAG_MARQET = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)+.08;
  float o1=dw(vPos*1.6+uTime*.007);
  float o2=fbm(vPos*3.2+uTime*.013);
  float o3=fbm(vPos*6.5+uTime*.021);
  float ocean=o1*.5+o2*.3+o3*.2;
  float wave=fbm(vPos*9.+uTime*.038);
  float foam=smoothstep(.63,.73,ocean+wave*.22);
  float land=smoothstep(.73,.82,o1);
  float shore=smoothstep(.69,.74,o1)*(1.-land);
  float current=fbm(vPos*3.8+vec3(uTime*.011,0.,uTime*.009));
  current=pow(abs(current-.5)*2.,3.)*.25;
  vec3 deep=vec3(.01,.04,.18);vec3 mid=vec3(.05,.2,.62);
  vec3 shallow=vec3(.08,.38,.78);vec3 foam_c=vec3(.8,.9,1.);
  vec3 land_c=vec3(.06,.1,.03);vec3 shore_c=vec3(.55,.72,.28);
  vec3 col=mix(deep,mid,ocean);col=mix(col,shallow,ocean*ocean*.8);
  col+=vec3(.02,.06,.18)*current;
  col=mix(col,foam_c,foam);col=mix(col,shore_c,shore*.6);col=mix(col,land_c,land);
  // specular on water
  vec3 vd=normalize(-vPos);vec3 h=normalize(ld+vd);
  float spec=pow(max(dot(vPos,h),0.),52.)*(1.-land)*(.4+foam*.4);
  col+=vec3(.4,.65,1.)*spec*.5;
  col*=diff;gl_FragColor=vec4(col,1.);
}`;

const FRAG_HYVE = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));
  // banded gas giant
  float band=sin(vPos.y*6.5+fbm(vPos*.55)*.9+uTime*.004)*.5+.5;
  float turb=fbm(vPos*3.8+uTime*.006);float turb2=fbm(vPos*7.+uTime*.009);
  float ribbon=fbm(vPos*12.+uTime*.013)*.5+.5;
  float combined=band*.55+turb*.25+turb2*.12+ribbon*.08;
  // storm vortex
  vec3 sc=normalize(vec3(-.4,.15,.9));
  float sd=length(vPos-sc);
  float storm=exp(-sd*sd*9.)*.8;
  float sw=dw(vPos*5.5-uTime*.035)*storm;
  // colors
  vec3 c1=vec3(.10,.03,.25);vec3 c2=vec3(.28,.10,.55);
  vec3 c3=vec3(.52,.30,.86);vec3 c4=vec3(.16,.05,.38);
  vec3 cS=vec3(.72,.28,1.);
  vec3 col=mix(c1,c2,combined);col=mix(col,c3,pow(combined,1.8)*.6);
  col=mix(col,c4,turb2*.28);col+=cS*sw*.55;
  // limb darkening
  float limb=dot(vPos,ld);col*=.25+.75*max(limb,.0);
  gl_FragColor=vec4(col,1.);
}`;

const FRAG_DAILY = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)+.05;
  float rock=dw(vPos*3.2+uTime*.004);
  float rock2=fbm(vPos*6.8+uTime*.007);
  float craters=fbm(vPos*14.+uTime*.003);
  float terrain=rock*.55+rock2*.3+craters*.15;
  // lava channels (cracks in dark rock)
  float lava=1.-smoothstep(0.,.4,terrain);lava=pow(lava,2.2);
  float lava2=fbm(vPos*5.+uTime*.01);lava2=1.-smoothstep(.0,.38,lava2);lava2=pow(lava2,2.5)*.5;
  // hot spots (magma chambers)
  float hot=dw(vPos*1.1+uTime*.014);hot=smoothstep(.66,1.,hot);
  float pulse=sin(uTime*1.9)*.5+.5;float pulse2=sin(uTime*3.1+vPos.x*5.)*.5+.5;
  vec3 rock_c=vec3(.065,.038,.028);vec3 lava_cool=vec3(.48,.1,.0);
  vec3 lava_hot=vec3(.94,.48,.02);vec3 white_hot=vec3(1.,.92,.72);
  float lavaT=lava+lava2*.5;
  vec3 lavaCol=mix(lava_cool,lava_hot,lavaT*(.75+pulse*.25));
  vec3 col=mix(rock_c,lavaCol,min(lavaT,1.));
  col=mix(col,white_hot,hot*.55);
  // emissive glow (unlit)
  vec3 emit=lavaCol*lavaT*(.45+pulse2*.18)+white_hot*hot*.22;
  col=col*diff+emit;
  gl_FragColor=vec4(col,1.);
}`;

const FRAG_STUDIO = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)+.1;
  float ice=dw(vPos*2.2+uTime*.002);
  float crystal=fbm(vPos*5.5+uTime*.003);
  float fine=fbm(vPos*11.+uTime*.004);
  float micro=fbm(vPos*22.+uTime*.006)*.5+.5;
  // precision grid (lon/lat)
  float u=atan(vPos.z,vPos.x)/(6.28318)+.5;
  float v2=acos(clamp(vPos.y,-1.,1.))/3.14159;
  vec2 gc=vec2(u,v2)*20.;vec2 gL=fract(gc)-.5;
  float grid=smoothstep(.452,.468,max(abs(gL.x),abs(gL.y)));
  vec2 gc2=vec2(u,v2)*100.;vec2 gL2=fract(gc2)-.5;
  float grid2=smoothstep(.462,.478,max(abs(gL2.x),abs(gL2.y)))*.28;
  // crevasse fractures
  float crev=1.-smoothstep(0.,.32,fbm(vPos*9.+uTime*.003));crev=pow(crev,3.)*.35;
  vec3 iceBase=vec3(.71,.86,.94);vec3 iceDark=vec3(.35,.56,.74);
  vec3 cyan=vec3(.02,.71,.83);vec3 white=vec3(.94,.97,1.);vec3 crevC=vec3(.12,.32,.52);
  vec3 col=mix(iceDark,iceBase,ice);col=mix(col,white,crystal*.3+fine*.15);
  col=mix(col,white,micro*.12);col=mix(col,cyan,(grid+grid2)*.65);col=mix(col,crevC,crev);
  // specular highlight
  vec3 vd=normalize(-vPos);vec3 h=normalize(ld+vd);
  float spec=pow(max(dot(vPos,h),0.),80.)*(.5+crystal*.5);
  col+=white*spec*.45+cyan*spec*.28;
  col*=diff;gl_FragColor=vec4(col,1.);
}`;

const FRAG_STAR = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  float t=dw(vPos*1.1+uTime*.05);
  float t2=fbm(vPos*2.4+uTime*.09);
  float t3=fbm(vPos*5.+uTime*.14);
  float pulse=sin(uTime*1.8)*.5+.5;float pulse2=sin(uTime*2.7)*.5+.5;
  vec3 c1=vec3(1.,.95,.85);vec3 c2=vec3(1.,.68,.18);vec3 c3=vec3(1.,.98,.92);
  vec3 col=mix(c1,c2,t);col=mix(col,c3,t2*.4);col+=c2*t3*.18;
  col*=.88+pulse*.12;col+=c1*t3*pulse2*.14;
  gl_FragColor=vec4(col,1.);
}`;

const CORONA_FRAG = `${NOISE}
uniform float uTime;varying vec3 vVN;
void main(){
  float f=pow(1.-abs(vVN.z),2.);
  float n=fbm(vec3(vVN.xy*2.,uTime*.08))*.4+.6;
  vec3 col=mix(vec3(1.,.78,.28),vec3(1.,.95,.8),f*n);
  gl_FragColor=vec4(col,f*0.55*n);
}`;

const PLANET_FRAGS: Record<string, string> = {
  scoutr: FRAG_SCOUTR,
  'the-marqet': FRAG_MARQET,
  'the-hyve': FRAG_HYVE,
  'construx-daily': FRAG_DAILY,
  'construx-studio': FRAG_STUDIO,
};

// ─── Three.js Components ──────────────────────────────────────────────────

function OrbitRing({ radius, tilt }: { radius: number; tilt: number }) {
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.05, side: THREE.DoubleSide }),
    []
  );
  return (
    <mesh material={mat} rotation={[Math.PI / 2, tilt, 0]}>
      <torusGeometry args={[radius, 0.013, 4, 256]} />
    </mesh>
  );
}

function CentralStar() {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const coronaRef = useRef<THREE.Mesh | null>(null);
  const elapsed = useRef(0);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PLANET_VERT,
        fragmentShader: FRAG_STAR,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  const coronaMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ATM_VERT,
        fragmentShader: CORONA_FRAG,
        uniforms: { uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((_, delta) => {
    elapsed.current += delta;
    mat.uniforms.uTime.value = elapsed.current;
    coronaMat.uniforms.uTime.value = elapsed.current;
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group>
      <mesh ref={meshRef} material={mat}>
        <sphereGeometry args={[2.5, 64, 64]} />
      </mesh>
      <mesh ref={coronaRef} material={coronaMat} scale={1.55}>
        <sphereGeometry args={[2.5, 32, 32]} />
      </mesh>
      <pointLight intensity={6} color="#ffe0a0" distance={90} decay={1.5} />
    </group>
  );
}

function Planet({
  config,
  venture,
  onHover,
}: {
  config: OrbitCfg;
  venture: (typeof ventures)[0];
  onHover: (slug: string | null) => void;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const elapsed = useRef(config.start / config.speed);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PLANET_VERT,
        fragmentShader: PLANET_FRAGS[venture.slug] ?? FRAG_SCOUTR,
        uniforms: { uTime: { value: 0 } },
      }),
    [venture.slug]
  );

  const atmMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ATM_VERT,
        fragmentShader: ATM_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(venture.accent) },
          uInt: { value: 0.8 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [venture.accent]
  );

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = elapsed.current * config.speed;
    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(t) * config.radius,
        Math.sin(t) * config.radius * config.tilt,
        Math.sin(t) * config.radius
      );
    }
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.17;
    mat.uniforms.uTime.value = elapsed.current;
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        material={mat}
        onPointerEnter={() => onHover(venture.slug)}
        onPointerLeave={() => onHover(null)}
      >
        <sphereGeometry args={[config.size, 64, 64]} />
      </mesh>
      <mesh material={atmMat} scale={1.13}>
        <sphereGeometry args={[config.size, 32, 32]} />
      </mesh>
    </group>
  );
}

function CameraRig({ phase }: { phase: Phase }) {
  const { camera } = useThree();
  const progress = useRef(0);
  const BOOT = useMemo(() => new THREE.Vector3(0, 14, 68), []);
  const SOLAR = useMemo(() => new THREE.Vector3(0, 20, 44), []);
  const TARGET = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    if (phase === 'boot') {
      camera.position.copy(BOOT);
      progress.current = 0;
    }
  }, [phase, camera, BOOT]);

  useFrame((_, delta) => {
    if (phase === 'approach') {
      progress.current = Math.min(progress.current + delta * 0.36, 1);
      const t = progress.current * progress.current * (3 - 2 * progress.current);
      camera.position.lerpVectors(BOOT, SOLAR, t);
      camera.lookAt(TARGET);
    } else if (phase === 'boot') {
      camera.position.copy(BOOT);
      camera.lookAt(TARGET);
    }
  });

  return null;
}

function SolarScene({
  phase,
  onHover,
}: {
  phase: Phase;
  onHover: (slug: string | null) => void;
}) {
  const orbitRef = useRef<any>(null);

  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.enabled = phase === 'solar';
      if (phase === 'solar') {
        orbitRef.current.target.set(0, 0, 0);
        orbitRef.current.update();
      }
    }
  }, [phase]);

  return (
    <>
      <color attach="background" args={['#000008']} />
      <ambientLight intensity={0.06} />
      <Stars radius={130} depth={65} count={7000} factor={4} saturation={0} fade />
      <CameraRig phase={phase} />
      <OrbitControls
        ref={orbitRef}
        enabled={phase === 'solar'}
        enablePan={false}
        minDistance={14}
        maxDistance={58}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 1.55}
      />
      <CentralStar />
      {ORBIT_CFG.map((cfg) => {
        const v = ventures.find((x) => x.slug === cfg.slug);
        if (!v) return null;
        return <Planet key={cfg.slug} config={cfg} venture={v} onHover={onHover} />;
      })}
      {ORBIT_CFG.map((cfg) => (
        <OrbitRing key={cfg.slug} radius={cfg.radius} tilt={cfg.tilt} />
      ))}
    </>
  );
}

// ─── Cockpit Overlay ──────────────────────────────────────────────────────

function CockpitOverlay({ phase, onSkip }: { phase: Phase; onSkip: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (phase !== 'boot') return;
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines((prev) => [...prev, BOOT_LINES[i++]]);
      }
    }, 330);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  const heading = (tick * 3) % 360;
  const alt = 2847 + Math.round(Math.sin(tick * 0.07) * 12);
  const spd = (0.31 + Math.sin(tick * 0.05) * 0.01).toFixed(2);

  return (
    <AnimatePresence>
      {phase !== 'solar' && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-14 flex items-center px-5 gap-6 pointer-events-auto"
            style={{
              background: 'rgba(4,10,4,0.92)',
              borderBottom: '1px solid rgba(34,197,94,0.18)',
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(34,197,94,0.018) 2px,rgba(34,197,94,0.018) 4px)',
            }}
          >
            <span className="font-mono text-[11px] text-green-400/80 tracking-[0.2em] uppercase">
              CONSTRUX NAV SYS v2.1
            </span>
            <div className="flex-1" />
            <div className="flex gap-5">
              {[
                { k: 'HDG', v: `${String(Math.floor(heading)).padStart(3, '0')}°` },
                { k: 'ALT', v: `${alt} AU` },
                { k: 'SPD', v: `${spd}C` },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center gap-1.5">
                  <span className="font-mono text-[9px] text-green-400/40 uppercase">{k}:</span>
                  <span className="font-mono text-[11px] text-green-400/90">{v}</span>
                </div>
              ))}
            </div>
            <button
              className="pointer-events-auto font-mono text-[10px] text-green-400/50 hover:text-green-400 transition-colors ml-4 uppercase tracking-widest"
              onClick={onSkip}
            >
              SKIP →
            </button>
          </div>

          {/* Side panels */}
          <div
            className="absolute left-0 top-14 bottom-44 w-16 hidden sm:flex flex-col justify-center px-3 gap-2.5"
            style={{
              background: 'rgba(4,10,4,0.88)',
              borderRight: '1px solid rgba(34,197,94,0.14)',
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(34,197,94,0.015) 2px,rgba(34,197,94,0.015) 4px)',
            }}
          >
            <div className="font-mono text-[8px] text-green-400/35 uppercase tracking-widest mb-1">
              Ventures
            </div>
            {ventures.map((v) => (
              <div key={v.slug} className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: v.accent, boxShadow: `0 0 4px ${v.accent}` }}
                />
                <span className="font-mono text-[7px] text-green-400/50 truncate">{v.name}</span>
              </div>
            ))}
          </div>

          <div
            className="absolute right-0 top-14 bottom-44 w-16 hidden sm:flex flex-col justify-center items-center gap-2"
            style={{
              background: 'rgba(4,10,4,0.88)',
              borderLeft: '1px solid rgba(34,197,94,0.14)',
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(34,197,94,0.015) 2px,rgba(34,197,94,0.015) 4px)',
            }}
          >
            {/* Radar circle */}
            <div
              className="relative w-10 h-10 rounded-full border"
              style={{ borderColor: 'rgba(34,197,94,0.25)' }}
            >
              <div
                className="absolute inset-1 rounded-full border"
                style={{ borderColor: 'rgba(34,197,94,0.15)' }}
              />
              <div
                className="absolute w-px h-5 bg-green-400/50 origin-bottom"
                style={{
                  bottom: '50%',
                  left: '50%',
                  transform: `translateX(-50%) rotate(${tick * 6}deg)`,
                }}
              />
            </div>
            <span className="font-mono text-[7px] text-green-400/35 uppercase">RADAR</span>
          </div>

          {/* Bottom console */}
          <div
            className="absolute bottom-0 left-0 right-0 h-44 px-5 pt-3 pb-4 overflow-hidden"
            style={{
              background: 'rgba(4,10,4,0.94)',
              borderTop: '1px solid rgba(34,197,94,0.18)',
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(34,197,94,0.018) 2px,rgba(34,197,94,0.018) 4px)',
            }}
          >
            <div className="flex flex-col gap-0.5 h-full overflow-hidden justify-end">
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-[11px] leading-relaxed"
                  style={{
                    color:
                      line.startsWith('>')
                        ? 'rgba(134,239,172,0.9)'
                        : line.startsWith('─')
                        ? 'rgba(34,197,94,0.2)'
                        : line.includes('OK') || line.includes('LOADED') || line.includes('ONLINE') || line.includes('SYNCED')
                        ? 'rgba(74,222,128,0.7)'
                        : 'rgba(34,197,94,0.55)',
                  }}
                >
                  {line}
                </motion.div>
              ))}
              {/* blinking cursor */}
              <span
                className="font-mono text-[11px] text-green-400/80"
                style={{ opacity: tick % 8 < 4 ? 1 : 0 }}
              >
                ▌
              </span>
            </div>
          </div>

          {/* Window frame border glow */}
          <div
            className="absolute top-14 bottom-44 left-0 sm:left-16 right-0 sm:right-16 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 50px rgba(34,197,94,0.04)' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Venture Info Panel ───────────────────────────────────────────────────

function VentureInfoPanel({ slug }: { slug: string | null }) {
  const venture = slug ? ventures.find((v) => v.slug === slug) : null;

  return (
    <AnimatePresence>
      {venture && (
        <motion.div
          key={venture.slug}
          className="absolute bottom-8 left-1/2 z-20 pointer-events-none"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
        >
          <div
            style={{
              background: 'rgba(6,8,6,0.9)',
              border: `1px solid ${venture.accent}28`,
              borderRadius: 8,
              padding: '14px 22px',
              minWidth: 280,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div
              className="font-mono text-[9px] uppercase tracking-widest mb-1"
              style={{ color: venture.accent }}
            >
              {venture.category}
            </div>
            <div
              className="text-white/90 text-[17px] font-bold mb-1"
              style={{ fontFamily: 'Clash Display, system-ui, sans-serif' }}
            >
              {venture.name}
            </div>
            <div className="text-white/45 text-[13px] mb-3 font-light">{venture.tagline}</div>
            <div className="flex gap-5">
              {venture.stats.slice(0, 3).map((s) => (
                <div key={s.label}>
                  <div className="text-[13px] font-bold" style={{ color: venture.accent }}>
                    {s.value}
                  </div>
                  <div className="font-mono text-[8px] uppercase tracking-wide text-white/28">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={`/ventures/${venture.slug}`}
              className="inline-block mt-3 font-mono text-[9px] uppercase tracking-widest pointer-events-auto"
              style={{ color: `${venture.accent}99` }}
            >
              View venture →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────

export default function SolarSystemHero() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>('boot');
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t1 = setTimeout(() => setPhase('approach'), 5000);
    const t2 = setTimeout(() => setPhase('solar'), 8200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [mounted]);

  if (!mounted) {
    return <div className="w-full h-screen bg-[#000008]" />;
  }

  return (
    <div className="relative w-full h-screen bg-[#000008] overflow-hidden">
      <Canvas
        camera={{ position: [0, 14, 68], fov: 58, near: 0.1, far: 400 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <SolarScene phase={phase} onHover={setHoveredSlug} />
      </Canvas>

      <CockpitOverlay phase={phase} onSkip={() => setPhase('solar')} />
      <VentureInfoPanel slug={phase === 'solar' ? hoveredSlug : null} />

      {/* Site label — visible in solar phase */}
      <AnimatePresence>
        {phase === 'solar' && (
          <motion.div
            className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-none"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/25">
              Construx Group&nbsp;&nbsp;·&nbsp;&nbsp;AI-native ventures
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll hint */}
      <AnimatePresence>
        {phase === 'solar' && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <span className="font-mono text-[8px] uppercase tracking-widest text-white/20">
              Scroll to explore
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-white/15 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
