import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PC = 15000;

const generatePoints = () => {
  const human = new Float32Array(PC * 3);
  const exploding = new Float32Array(PC * 3);
  const muscle = new Float32Array(PC * 3);
  const dumbbell = new Float32Array(PC * 3);
  const kettlebell = new Float32Array(PC * 3);
  const colors = new Float32Array(PC * 3);

  const colorSage = new THREE.Color("#a8d4a0");
  const colorGold = new THREE.Color("#c9a84c");

  for (let i = 0; i < PC; i++) {
    let hx, hy, hz;
    const r = Math.random();

    if (r < 0.4) {
      hx = (Math.random() - 0.5) * 14;
      hy = (Math.random() - 0.5) * 24 + 5;
      hz = (Math.random() - 0.5) * 7;
    } else if (r < 0.6) {
      const s = Math.random() < 0.5 ? -1 : 1;
      hx = (Math.random() * 3 + 2) * s;
      hy = Math.random() * -28;
      hz = (Math.random() - 0.5) * 4;
    } else if (r < 0.8) {
      const s = Math.random() < 0.5 ? -1 : 1;
      hx = (Math.random() * 14 + 7) * s;
      hy = Math.random() * 5 + 10;
      hz = (Math.random() - 0.5) * 4;
    } else {
      hx = (Math.random() - 0.5) * 7;
      hy = Math.random() * 8 + 22;
      hz = (Math.random() - 0.5) * 5;
    }

    human[i * 3] = hx;
    human[i * 3 + 1] = hy;
    human[i * 3 + 2] = hz;

    const m = 4 + Math.random() * 12;

    exploding[i * 3] = hx * m;
    exploding[i * 3 + 1] = hy * m;
    exploding[i * 3 + 2] = hz * m;

    const strand = Math.floor(Math.random() * 5);
    const mt = (Math.random() - 0.5) * 45;
    const radius = 3.5 + Math.random() * 2.5;
    const angle = mt * 0.15 + (strand * Math.PI * 2) / 5;

    muscle[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
    muscle[i * 3 + 1] = mt + (Math.random() - 0.5) * 2;
    muscle[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;

    const dr = Math.random();
    let dx, dy, dz;

    if (dr < 0.2) {
      dx = (Math.random() - 0.5) * 32;
      const dang = Math.random() * Math.PI * 2;
      const drad = Math.random() * 0.8;
      dy = Math.cos(dang) * drad;
      dz = Math.sin(dang) * drad;
    } else if (dr < 0.6) {
      dx = -16 + (Math.random() - 0.5) * 6;
      const dang = Math.random() * Math.PI * 2;
      const drad = Math.random() * 10;
      dy = Math.cos(dang) * drad;
      dz = Math.sin(dang) * drad;
    } else {
      dx = 16 + (Math.random() - 0.5) * 6;
      const dang = Math.random() * Math.PI * 2;
      const drad = Math.random() * 10;
      dy = Math.cos(dang) * drad;
      dz = Math.sin(dang) * drad;
    }

    dumbbell[i * 3] = dx;
    dumbbell[i * 3 + 1] = dy;
    dumbbell[i * 3 + 2] = dz;

    const kr = Math.random();
    let kx, ky, kz;

    if (kr < 0.75) {
      const ku = Math.random();
      const kv = Math.random();
      const ktheta = 2 * Math.PI * ku;
      const kphi = Math.acos(2 * kv - 1);
      const krad = Math.cbrt(Math.random()) * 8;

      kx = krad * Math.sin(kphi) * Math.cos(ktheta);
      ky = krad * Math.cos(kphi) - 3;
      kz = krad * Math.sin(kphi) * Math.sin(ktheta);
    } else {
      const ku = Math.random() * Math.PI;
      const kv = Math.random() * Math.PI * 2;
      const KR = 5;
      const krw = Math.random() * 1.5;

      kx = (KR + krw * Math.cos(kv)) * Math.cos(ku);
      ky = (KR + krw * Math.cos(kv)) * Math.sin(ku) + 5;
      kz = krw * Math.sin(kv);
    }

    kettlebell[i * 3] = kx;
    kettlebell[i * 3 + 1] = ky - 5;
    kettlebell[i * 3 + 2] = kz;

    const c = Math.random() > 0.75 ? colorGold : colorSage;

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  return { human, exploding, muscle, dumbbell, kettlebell, colors };
};

function MorphedParticles() {
  const pointsRef = useRef();

  const { human, exploding, muscle, dumbbell, kettlebell, colors } =
    useMemo(() => generatePoints(), []);

  const currentPos = useMemo(() => new Float32Array(human), [human]);

  useEffect(() => {
    if (!pointsRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5
        }
      });

      tl.to(currentPos, {
        endArray: exploding,
        duration: 1,
        onUpdate: () => {
          pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }, 0);

      tl.to(currentPos, {
        endArray: muscle,
        duration: 1,
        onUpdate: () => {
          pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }, 1);

      tl.to(currentPos, {
        endArray: dumbbell,
        duration: 1,
        onUpdate: () => {
          pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }, 2);

      tl.to(currentPos, {
        endArray: kettlebell,
        duration: 1,
        onUpdate: () => {
          pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }, 3);

      tl.to(pointsRef.current.rotation, {
        y: Math.PI * 4,
        ease: "none"
      }, 0);
    });

    return () => ctx.revert();
  }, [exploding, muscle, dumbbell, kettlebell, currentPos]);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      pointsRef.current.position.y = Math.sin(t * 0.5) * 0.5;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[currentPos, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>

      <pointsMaterial
        size={0.25}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

const generateShapes = () => {
  const items = [];
  const colors = [0x3d7a41, 0x7aad6e, 0xc9a84c, 0x2d5a30];

  for (let i = 0; i < 15; i++) {
    const isDumbbell = Math.random() > 0.5;

    items.push({
      type: isDumbbell ? "dumbbell" : "plate",
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.5 + Math.random() * 1.5,
      position: [
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30 - 10
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      speed: {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01
      }
    });
  }

  return items;
};

function FloatingGymShapes() {
  const shapesRef = useRef([]);

  const shapes = useMemo(() => generateShapes(), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    shapesRef.current.forEach((mesh, i) => {
      if (!mesh || !shapes[i]) return;

      mesh.rotation.x += shapes[i].speed.x;
      mesh.rotation.y += shapes[i].speed.y;
      mesh.position.y += Math.sin(t + i) * 0.01;
    });
  });

  return (
    <group>
      {shapes.map((s, i) => (
        <group
          key={i}
          position={s.position}
          rotation={s.rotation}
          scale={s.scale}
          ref={(el) => (shapesRef.current[i] = el)}
        >
          {s.type === "dumbbell" ? (
            <>
              <mesh>
                <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
                <meshPhongMaterial color={s.color} wireframe transparent opacity={0.2} />
              </mesh>

              <mesh position={[0, 2, 0]}>
                <cylinderGeometry args={[1, 1, 0.5, 12]} />
                <meshPhongMaterial color={s.color} transparent opacity={0.3} />
              </mesh>

              <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[1, 1, 0.5, 12]} />
                <meshPhongMaterial color={s.color} transparent opacity={0.3} />
              </mesh>
            </>
          ) : (
            <mesh>
              <cylinderGeometry args={[1.5, 1.5, 0.3, 16]} />
              <meshPhongMaterial color={s.color} wireframe transparent opacity={0.2} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function SceneEffects() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame(() => {
    const newX = camera.position.x + (mouseRef.current.x * 5 - camera.position.x) * 0.02;
    const newY = camera.position.y + (mouseRef.current.y * 5 - camera.position.y) * 0.02;
    camera.position.set(newX, newY, camera.position.z);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

const PARTICLE_COUNT = 200;

const generateBackgroundParticles = () => {
  const arr = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
    arr[i] = (Math.random() - 0.5) * 80;
  }
  return arr;
};

function Particles() {
  const pointsRef = useRef();

  const positions = useMemo(() => generateBackgroundParticles(), []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const t = clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 0.02;
      pointsRef.current.rotation.x = t * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={0x7aad6e} size={0.15} transparent opacity={0.5} />
    </points>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />

        <Particles />
        <MorphedParticles />
        <FloatingGymShapes />
        <SceneEffects />
      </Canvas>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black pointer-events-none" />
    </div>
  );
}