import { Suspense, useRef, useState} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from '../Loader';

const Robot = () => {
    const ref = useRef();
    
    useFrame((useState, delta) => {
      ref.current.rotation.y -= delta * 0.75;
      
    })  

    const Robot = useGLTF('./ditchColored2.glb')

    return (
      <mesh ref={ref} rotation={[0, 0, 0]}>
        

        <ambientLight 
            intensity={0.65}
            />
        <hemisphereLight intensity={1.1}
        groundColor="black"/>
        <pointLight
        position={[-3,3,0]} 
        intensity={1.3}/>
        <spotLight
          position={[15,20,5]}
          angle ={20}
          penumbra={1}
          intensity={14}
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