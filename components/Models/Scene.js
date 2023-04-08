/* eslint-disable react/no-unknown-property */
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Model from './Model';

export default function Scene() {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2}/>
        <Model />
      </Suspense>
    </Canvas>
  );
}
