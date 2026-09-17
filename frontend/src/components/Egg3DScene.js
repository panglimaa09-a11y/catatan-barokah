import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, ContactShadows } from "@react-three/drei";

function GoldenEgg() {
  const mesh = useRef();
  useFrame((state, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.45;
  });
  return (
    <mesh ref={mesh} scale={[1, 1.32, 1]} castShadow>
      <sphereGeometry args={[1, 64, 64]} />
      <meshPhysicalMaterial
        color="#fbbf24"
        metalness={0.75}
        roughness={0.22}
        clearcoat={1}
        clearcoatRoughness={0.08}
        emissive="#7c3a03"
        emissiveIntensity={0.22}
      />
    </mesh>
  );
}

function OrbitCoin({ radius, speed, phase, size, yAmp }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + phase;
    if (!ref.current) return;
    ref.current.position.set(
      Math.cos(t) * radius,
      Math.sin(t * 1.35) * yAmp,
      Math.sin(t) * radius
    );
    ref.current.rotation.x = t * 1.4;
    ref.current.rotation.y = t;
  });
  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[size, size, size * 0.2, 32]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.2} />
    </mesh>
  );
}

export default function Egg3DScene() {
  return (
    <div className="h-full w-full" data-testid="hero-3d-canvas">
      <Canvas
        camera={{ position: [0, 0.4, 5.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 6, 5]} intensity={1.4} color="#ffe8b0" />
        <pointLight position={[-4, -2, 3]} intensity={1} color="#f59e0b" />
        <pointLight position={[0, 3, -4]} intensity={0.7} color="#fde68a" />
        <Float
          speed={1.7}
          rotationIntensity={0.55}
          floatIntensity={1.7}
          floatingRange={[-0.15, 0.2]}
        >
          <GoldenEgg />
          <OrbitCoin radius={2.1} speed={0.7} phase={0} size={0.16} yAmp={0.6} />
          <OrbitCoin radius={2.5} speed={0.55} phase={2.2} size={0.12} yAmp={0.9} />
          <OrbitCoin radius={1.85} speed={0.9} phase={4.1} size={0.1} yAmp={0.5} />
        </Float>
        <Sparkles count={70} scale={[7, 5, 5]} size={2.6} speed={0.4} color="#fde68a" />
        <ContactShadows
          position={[0, -2.3, 0]}
          opacity={0.5}
          scale={10}
          blur={2.8}
          far={4.5}
          color="#78350f"
        />
      </Canvas>
    </div>
  );
}
