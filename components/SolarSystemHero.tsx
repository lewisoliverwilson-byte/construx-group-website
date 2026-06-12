'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { ventures } from '@/lib/ventures';

interface OrbitCfg {
  slug: string;
  radius: number;
  speed: number;
  tilt: number;
  start: number;
  size: number;
}

const ORBIT_CFG: OrbitCfg[] = [
  { slug: 'scoutr',          radius: 6,   speed: 0.32, tilt: 0.08, start: 0.0,  size: 1.25 },
  { slug: 'the-marqet',      radius: 9.5, speed: 0.22, tilt: 0.13, start: 1.2,  size: 1.55 },
  { slug: 'the-hyve',        radius: 13,  speed: 0.16, tilt: 0.06, start: 2.5,  size: 1.85 },
  { slug: 'construx-daily',  radius: 17,  speed: 0.11, tilt: 0.18, start: 4.0,  size: 1.15 },
  { slug: 'construx-studio', radius: 22,  speed: 0.07, tilt: 0.10, start: 0.8,  size: 1.35 },
];

// ─── GLSL ─────────────────────────────────────────────────────────────────

const NOISE = `
float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n3(vec3 x){
  vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(
    mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
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

const VERT = `
varying vec3 vPos;varying vec3 vN;
void main(){
  vPos=normalize(position);
  vN=normalize(normalMatrix*normal);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;

const ATM_VERT = `
varying vec3 vVN;
void main(){vVN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;

const ATM_FRAG = `
varying vec3 vVN;uniform vec3 uColor;uniform float uInt;
void main(){float f=pow(1.-abs(vVN.z),2.2);gl_FragColor=vec4(uColor,f*uInt);}`;

// ─── Scoutr: lime data-scan world ─────────────────────────────────────────
const FRAG_SCOUTR = `${NOISE}
uniform float uTime;uniform float uOp;
varying vec3 vPos;varying vec3 vN;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)*.85+.15;
  float t1=dw(vPos*2.4+uTime*.012);float t2=fbm(vPos*5.5+uTime*.02);
  float terrain=clamp(t1*.7+t2*.3,0.,1.);
  // major grid
  vec2 gUv=vec2(atan(vPos.z,vPos.x)/(6.28318)+.5,acos(clamp(vPos.y,-1.,1.))/3.14159)*16.;
  vec2 gL=fract(gUv)-.5;float grid=smoothstep(.44,.46,max(abs(gL.x),abs(gL.y)));
  // minor grid
  vec2 gUv2=gUv*6.;vec2 gL2=fract(gUv2)-.5;float grid2=smoothstep(.455,.47,max(abs(gL2.x),abs(gL2.y)))*.4;
  // scan line
  float scan=pow(sin(vPos.y*32.+uTime*4.)*.5+.5,8.)*.3;
  float scanH=pow(sin(atan(vPos.z,vPos.x)*14.+uTime*2.5)*.5+.5,8.)*.18;
  // data nodes (bright dots at grid intersections)
  float node=step(.95,hash(vec3(floor(gUv),0.)))*.6;
  vec3 dark=vec3(.01,.025,.005);vec3 lime=vec3(.78,.96,.047);vec3 midGreen=vec3(.35,.65,.02);
  vec3 col=mix(dark,midGreen*(.5+terrain*.5),terrain);
  col=mix(col,lime,(grid*.45+grid2*.2));
  col+=lime*(scan+scanH);col+=lime*node;
  col*=diff;
  gl_FragColor=vec4(col,uOp);
}`;

// ─── The Marqet: deep blue ocean world ────────────────────────────────────
const FRAG_MARQET = `${NOISE}
uniform float uTime;uniform float uOp;
varying vec3 vPos;varying vec3 vN;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)*.85+.15;
  float o1=dw(vPos*1.5+uTime*.007);float o2=fbm(vPos*3.+uTime*.012);
  float o3=fbm(vPos*6.5+uTime*.02);float ocean=o1*.52+o2*.3+o3*.18;
  float wave=fbm(vPos*10.+uTime*.04);
  float foam=smoothstep(.62,.72,ocean+wave*.2);
  float land=smoothstep(.74,.82,o1);float shore=smoothstep(.7,.75,o1)*(1.-land)*.7;
  float currentLines=fbm(vPos*4.5+vec3(uTime*.01,0.,uTime*.008));
  currentLines=pow(abs(currentLines-.5)*2.,3.)*.25;
  vec3 abyssal=vec3(.008,.028,.14);vec3 deep=vec3(.02,.08,.38);
  vec3 mid=vec3(.04,.18,.68);vec3 shallow=vec3(.07,.32,.82);
  vec3 foamC=vec3(.78,.88,1.);vec3 landC=vec3(.055,.09,.03);vec3 shoreC=vec3(.45,.65,.22);
  vec3 col=mix(abyssal,deep,ocean);col=mix(col,mid,ocean*ocean);
  col=mix(col,shallow,pow(ocean,3.)*.8);col+=vec3(.01,.04,.15)*currentLines;
  col=mix(col,foamC,foam);col=mix(col,shoreC,shore);col=mix(col,landC,land);
  vec3 vd=normalize(-vPos);vec3 h=normalize(ld+vd);
  float spec=pow(max(dot(vN,h),0.),64.)*(1.-land)*(foam*.5+.1);
  col+=vec3(.35,.6,1.)*spec*.6;
  col*=diff;gl_FragColor=vec4(col,uOp);
}`;

// ─── The Hyve: purple gas giant ────────────────────────────────────────────
const FRAG_HYVE = `${NOISE}
uniform float uTime;uniform float uOp;
varying vec3 vPos;varying vec3 vN;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));
  float band=sin(vPos.y*7.+fbm(vPos*.5)*.8+uTime*.004)*.5+.5;
  float turb1=fbm(vPos*3.5+uTime*.006);float turb2=fbm(vPos*7.+uTime*.009);
  float detail=fbm(vPos*14.+uTime*.011)*.5+.5;
  float combined=band*.5+turb1*.28+turb2*.14+detail*.08;
  // storm
  vec3 sc=normalize(vec3(-.4,.15,.9));float sd=length(vPos-sc);
  float storm=exp(-sd*sd*8.)*.9;float sw=dw(vPos*5.-uTime*.04)*storm;
  // belts
  float belt=smoothstep(.35,.5,abs(sin(vPos.y*4.+fbm(vPos*.3)*.6)));
  vec3 c1=vec3(.09,.02,.22);vec3 c2=vec3(.22,.08,.48);
  vec3 c3=vec3(.48,.28,.82);vec3 c4=vec3(.62,.35,.95);
  vec3 beltC=vec3(.14,.04,.35);vec3 stormC=vec3(.72,.22,1.);
  vec3 col=mix(c1,c2,combined);col=mix(col,c3,pow(combined,1.6)*.7);
  col=mix(col,c4,turb2*.3+detail*.15);col=mix(col,beltC,belt*.35);
  col+=stormC*sw*.6;
  float limb=dot(vPos,ld);col*=.2+.8*max(limb,.0);
  gl_FragColor=vec4(col,uOp);
}`;

// ─── Construx Daily: volcanic/lava world ──────────────────────────────────
const FRAG_DAILY = `${NOISE}
uniform float uTime;uniform float uOp;
varying vec3 vPos;varying vec3 vN;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)*.7+.1;
  float rock=dw(vPos*3.+uTime*.004);float rock2=fbm(vPos*6.5+uTime*.007);
  float cracks=fbm(vPos*12.+uTime*.005)*.5+.5;
  float terrain=rock*.5+rock2*.32+cracks*.18;
  float lava=1.-smoothstep(0.,.38,terrain);lava=pow(lava,2.4);
  float lava2=1.-smoothstep(.0,.35,fbm(vPos*5.5+uTime*.009));lava2=pow(lava2,2.6)*.55;
  float hot=dw(vPos*1.2+uTime*.015);hot=smoothstep(.65,.95,hot);
  float pulse=sin(uTime*2.)*.5+.5;float pulse2=sin(uTime*3.2+vPos.x*6.)*.5+.5;
  float lavaTotal=clamp(lava+lava2*.55,0.,1.);
  vec3 rockC=vec3(.055,.032,.022);vec3 lava_dark=vec3(.52,.1,.0);
  vec3 lava_bright=vec3(1.,.42,.0);vec3 white_hot=vec3(1.,.9,.65);
  vec3 lavaC=mix(lava_dark,lava_bright,lavaTotal*(.7+pulse*.3));
  vec3 col=mix(rockC,lavaC,lavaTotal);col=mix(col,white_hot,hot*.6);
  // strong emissive glow from lava
  vec3 emit=lavaC*lavaTotal*(.65+pulse2*.25)+white_hot*hot*.35;
  col=col*diff+emit*1.2;
  gl_FragColor=vec4(col,uOp);
}`;

// ─── Construx Studio: ice/crystal world ───────────────────────────────────
const FRAG_STUDIO = `${NOISE}
uniform float uTime;uniform float uOp;
varying vec3 vPos;varying vec3 vN;
void main(){
  vec3 ld=normalize(vec3(1.,.5,.8));float diff=max(dot(vPos,ld),0.)*.8+.2;
  float ice=dw(vPos*2.2+uTime*.002);float crystal=fbm(vPos*5.5+uTime*.003);
  float fine=fbm(vPos*12.+uTime*.004);float micro=fbm(vPos*24.)*.5+.5;
  // precision grid
  float u2=atan(vPos.z,vPos.x)/(6.28318)+.5;float v2=acos(clamp(vPos.y,-1.,1.))/3.14159;
  vec2 gc=vec2(u2,v2)*20.;vec2 gL=fract(gc)-.5;
  float grid=smoothstep(.44,.46,max(abs(gL.x),abs(gL.y)));
  vec2 gc2=vec2(u2,v2)*80.;vec2 gL2=fract(gc2)-.5;
  float grid2=smoothstep(.455,.47,max(abs(gL2.x),abs(gL2.y)))*.3;
  float crev=pow(1.-smoothstep(0.,.3,fbm(vPos*9.+uTime*.003)),3.)*.35;
  vec3 iceBase=vec3(.72,.88,.96);vec3 iceDark=vec3(.32,.55,.74);
  vec3 cyan=vec3(.02,.72,.84);vec3 white=vec3(.92,.97,1.);vec3 crevC=vec3(.1,.3,.52);
  vec3 col=mix(iceDark,iceBase,ice);col=mix(col,white,crystal*.38+fine*.18+micro*.1);
  col=mix(col,cyan,(grid+grid2)*.75);col=mix(col,crevC,crev);
  vec3 vd=normalize(-vPos);vec3 h=normalize(ld+vd);
  float spec=pow(max(dot(vN,h),0.),96.)*(.5+crystal*.5);
  col+=white*spec*.5+cyan*spec*.35;
  col*=diff;gl_FragColor=vec4(col,uOp);
}`;

const FRAG_STAR = `${NOISE}
uniform float uTime;varying vec3 vPos;
void main(){
  float t=dw(vPos*1.1+uTime*.05);float t2=fbm(vPos*2.5+uTime*.09);
  float t3=fbm(vPos*5.+uTime*.14);float pulse=sin(uTime*1.8)*.5+.5;
  vec3 c1=vec3(1.,.95,.85);vec3 c2=vec3(1.,.68,.18);vec3 c3=vec3(1.,.98,.92);
  vec3 col=mix(c1,c2,t);col=mix(col,c3,t2*.4);col+=c2*t3*.2;col*=.86+pulse*.14;
  gl_FragColor=vec4(col,1.);
}`;

const CORONA_FRAG = `
varying vec3 vVN;uniform float uTime;
void main(){
  float f=pow(1.-abs(vVN.z),2.2);
  gl_FragColor=vec4(1.,.88,.55,f*0.52);
}`;

const PLANET_FRAGS: Record<string, string> = {
  scoutr: FRAG_SCOUTR,
  'the-marqet': FRAG_MARQET,
  'the-hyve': FRAG_HYVE,
  'construx-daily': FRAG_DAILY,
  'construx-studio': FRAG_STUDIO,
};

// ─── Scene components ──────────────────────────────────────────────────────

function OrbitRing({ radius, tilt }: { radius: number; tilt: number }) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.045,
        side: THREE.DoubleSide,
      }),
    []
  );
  return (
    <mesh material={mat} rotation={[Math.PI / 2, tilt, 0]}>
      <torusGeometry args={[radius, 0.012, 4, 256]} />
    </mesh>
  );
}

function CentralStar() {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const elapsed = useRef(0);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
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
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.04;
  });

  return (
    <group>
      <mesh ref={meshRef} material={mat}>
        <sphereGeometry args={[2.5, 64, 64]} />
      </mesh>
      <mesh material={coronaMat} scale={1.55}>
        <sphereGeometry args={[2.5, 32, 32]} />
      </mesh>
      <Html center position={[0, 3.4, 0]} distanceFactor={14} zIndexRange={[0, 10]}>
        <div
          style={{
            color: 'rgba(255,240,200,0.7)',
            fontFamily: 'Courier New, monospace',
            fontSize: 9,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            pointerEvents: 'none',
          }}
        >
          Construx Group
        </div>
      </Html>
      <pointLight intensity={6} color="#ffe0a0" distance={95} decay={1.5} />
    </group>
  );
}

function Planet({
  config,
  venture,
  onEnter,
  onLeave,
}: {
  config: OrbitCfg;
  venture: (typeof ventures)[0];
  onEnter: (slug: string) => void;
  onLeave: () => void;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const elapsed = useRef(config.start / config.speed);
  const opacity = useRef(0);
  const opDelay = config.radius / 35;

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: PLANET_FRAGS[venture.slug] ?? FRAG_SCOUTR,
        uniforms: { uTime: { value: 0 }, uOp: { value: 0 } },
        transparent: true,
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
          uInt: { value: 0.9 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [venture.accent]
  );

  // Rings for The Hyve
  const ringMat = useMemo(() => {
    if (venture.slug !== 'the-hyve') return null;
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(venture.accent),
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
  }, [venture.slug, venture.accent]);

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
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.18;
    mat.uniforms.uTime.value = elapsed.current;
    // fade in staggered
    if (elapsed.current > opDelay && opacity.current < 1) {
      opacity.current = Math.min(opacity.current + delta * 1.0, 1);
      mat.uniforms.uOp.value = opacity.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Planet surface */}
      <mesh
        ref={meshRef}
        material={mat}
        onPointerEnter={() => onEnter(venture.slug)}
        onPointerLeave={onLeave}
      >
        <sphereGeometry args={[config.size, 128, 128]} />
      </mesh>

      {/* Atmosphere */}
      <mesh material={atmMat} scale={1.14}>
        <sphereGeometry args={[config.size, 32, 32]} />
      </mesh>

      {/* Saturn rings for Hyve */}
      {ringMat && (
        <mesh material={ringMat} rotation={[Math.PI * 0.38, 0, Math.PI * 0.12]}>
          <torusGeometry args={[config.size * 1.75, config.size * 0.32, 3, 64]} />
        </mesh>
      )}

      {/* Accent glow halo below planet */}
      <mesh rotation-x={-Math.PI / 2} position-y={-(config.size + 0.05)}>
        <circleGeometry args={[config.size * 1.6, 24]} />
        <meshBasicMaterial
          color={new THREE.Color(venture.accent)}
          transparent
          opacity={0.055}
        />
      </mesh>

      {/* Label */}
      <Html center position={[0, config.size + 0.55, 0]} distanceFactor={13} zIndexRange={[0, 10]}>
        <div
          style={{
            color: venture.accent,
            fontFamily: 'Courier New, monospace',
            fontSize: 9,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            opacity: 0.82,
            pointerEvents: 'none',
          }}
        >
          {venture.name}
        </div>
      </Html>
    </group>
  );
}

function SolarScene({
  onEnter,
  onLeave,
}: {
  onEnter: (slug: string) => void;
  onLeave: () => void;
}) {
  return (
    <>
      <color attach="background" args={['#000008']} />
      <ambientLight intensity={0.05} />
      <Stars radius={130} depth={60} count={6000} factor={4} saturation={0} fade />
      <OrbitControls
        enablePan={false}
        minDistance={12}
        maxDistance={60}
        enableDamping
        dampingFactor={0.04}
        maxPolarAngle={Math.PI / 1.6}
        rotateSpeed={0.6}
      />
      <CentralStar />
      {ORBIT_CFG.map((cfg) => {
        const v = ventures.find((x) => x.slug === cfg.slug);
        if (!v) return null;
        return <Planet key={cfg.slug} config={cfg} venture={v} onEnter={onEnter} onLeave={onLeave} />;
      })}
      {ORBIT_CFG.map((cfg) => (
        <OrbitRing key={cfg.slug} radius={cfg.radius} tilt={cfg.tilt} />
      ))}
    </>
  );
}

// ─── Info Panel ────────────────────────────────────────────────────────────

function VenturePanel({
  slug,
  onMouseEnter,
  onMouseLeave,
}: {
  slug: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const venture = slug ? ventures.find((v) => v.slug === slug) : null;

  return (
    <AnimatePresence>
      {venture && (
        <motion.div
          key={venture.slug}
          className="absolute bottom-8 left-1/2 z-20"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            style={{
              background: 'rgba(5,7,5,0.92)',
              border: `1px solid ${venture.accent}30`,
              borderRadius: 10,
              padding: '16px 22px 18px',
              minWidth: 300,
              maxWidth: 360,
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div
                  className="font-mono text-[9px] uppercase tracking-widest mb-1"
                  style={{ color: venture.accent }}
                >
                  {venture.category}
                </div>
                <div
                  className="text-white/92 text-[18px] font-bold leading-none"
                  style={{ fontFamily: 'Clash Display, system-ui, sans-serif' }}
                >
                  {venture.name}
                </div>
              </div>
              <div
                className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                style={{ background: venture.accent, boxShadow: `0 0 8px ${venture.accent}` }}
              />
            </div>

            <p className="text-white/45 text-[13px] font-light mb-4 leading-relaxed">
              {venture.tagline}
            </p>

            {/* Stats */}
            <div className="flex gap-5 mb-4">
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

            {/* Actions */}
            <div
              className="flex items-center gap-4 pt-3"
              style={{ borderTop: `1px solid ${venture.accent}18` }}
            >
              {venture.url && (
                <a
                  href={venture.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest transition-opacity hover:opacity-80"
                  style={{ color: venture.accent }}
                >
                  Visit site <ArrowUpRight size={10} />
                </a>
              )}
              <Link
                href={`/ventures/${venture.slug}`}
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-white/35 hover:text-white/65 transition-colors"
              >
                Learn more <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────

export default function SolarSystemHero() {
  const [mounted, setMounted] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePlanetEnter = useCallback((slug: string) => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setHoveredSlug(slug);
  }, []);

  const handlePlanetLeave = useCallback(() => {
    clearTimerRef.current = setTimeout(() => setHoveredSlug(null), 500);
  }, []);

  const handlePanelEnter = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
  }, []);

  const handlePanelLeave = useCallback(() => {
    clearTimerRef.current = setTimeout(() => setHoveredSlug(null), 200);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  return (
    <section id="venture-map" className="relative w-full h-screen overflow-hidden bg-[#000008]">
      {/* Section label */}
      <div className="absolute top-7 left-6 lg:top-9 lg:left-10 z-10 pointer-events-none">
        <p className="t-eyebrow mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Venture Map
        </p>
        <div className="w-9 h-px" style={{ background: 'rgba(255,255,255,0.14)' }} />
      </div>

      {/* 3D Canvas */}
      {mounted && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <Canvas
            camera={{ position: [0, 22, 46], fov: 54, near: 0.1, far: 400 }}
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <SolarScene onEnter={handlePlanetEnter} onLeave={handlePlanetLeave} />
            </Suspense>
          </Canvas>
        </motion.div>
      )}

      {/* Hover info panel */}
      <VenturePanel
        slug={hoveredSlug}
        onMouseEnter={handlePanelEnter}
        onMouseLeave={handlePanelLeave}
      />

      {/* Bottom hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="font-mono text-[8px] uppercase tracking-widest text-white/15 text-center">
          Hover to explore&nbsp;&nbsp;·&nbsp;&nbsp;Drag to orbit
        </p>
      </div>
    </section>
  );
}
