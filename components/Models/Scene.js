import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import {  OrbitControls } from "@react-three/drei"
import dynamic from 'next/dynamic';
import { Tooltip } from "@chakra-ui/react";
const Model = dynamic(() => import('./Model'));

export default function Scene() {
  return (
    <Tooltip label="Click and Drag" aria-label="Click and Drag">
      <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 1.5]}>
        <ambientLight intensity={2} />
        <Suspense fallback={null}>
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2}/>
          <Model />
        </Suspense>
      </Canvas>
    </Tooltip>
  );
}
