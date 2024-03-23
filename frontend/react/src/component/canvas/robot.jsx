import { Suspense, useRef, useEffect, useState} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from '../Loader';

const Robot = () => {
    const ref = useRef();
    
    useFrame((state, delta) => {
      ref.current.rotation.y -= delta * 0.75;
      
    })  

    const Robot = useGLTF('./ditchColored.glb')

    return (
      <mesh ref={ref} rotation={[0, 0, 0]}>
        

        <ambientLight 
            intensity={0.2}
            />
        <hemisphereLight intensity={1.9}
        groundColor="black"/>
        <pointLight
        position={[1,-2.5,0]} 
        intensity={0.5}/>
        <spotLight
          position={[15,20,5]}
          angle ={20}
          penumbra={1}
          intensity={10}
          castShadow
          shadow-mapSize={1024}
        />
        <primitive
          object={Robot.scene}
          position= {[0,-2,0]}
          
          />
      </mesh>
      
    )
  }
  
  const RobotCanvas = () => {
    return (
      
      <Canvas
        frameloop = "always"
        shadows
        camera= {{position: [10,-8, 0], fov: 30, rotateX: -Math.PI/8, rotateY: Math.PI/2.25 }}
      >
        <Suspense fallback={ <CanvasLoader/>}>
          
        <Robot/>
        
        </Suspense>
        <OrbitControls 
            
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI/2}
            minPolarAngle={Math.PI/2}
            
          />
        <Preload all />
      </Canvas>
    )
  }
  
  export default RobotCanvas