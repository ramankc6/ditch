import React, { useState, useRef, Suspense, memo } from 'react'; // Import memo
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import '../../index.css';

const Stars = memo((props) => { // Wrap your Stars component in memo
  const ref = useRef();
  const sphere = random.inSphere(new Float32Array(3000), {radius: 1.25})

  useFrame((useState, delta) => {
    ref.current.rotation.x -= delta/20;
    ref.current.rotation.y -= delta/35;
  })  

  return (
    <group rotation={[0, 0, Math.PI/4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial 
          transparent
          color="#f272c0"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
});

const StarCanvas = () => {
  return (
    <div className='w-full h-auto absolute inset-0 z-[-1]'>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars/> 
        </Suspense>
        <Preload all/>
      </Canvas>
    </div>
  );
};

export default StarCanvas;
