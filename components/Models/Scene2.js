import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import {  OrbitControls } from "@react-three/drei"
import dynamic from 'next/dynamic';
const Model = dynamic(() => import('./Model2'));

export default function Scene() {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 1.5]}>
        <ambientLight intensity={2} />
        <Suspense fallback={null}>
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2}/>
          <Model />
        </Suspense>
      </Canvas>
  );
}
