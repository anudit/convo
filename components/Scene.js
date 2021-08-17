import React, { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {  Environment, OrbitControls } from "@react-three/drei"
import dynamic from 'next/dynamic';
const Model = dynamic(() => import('./Model'));

function Box() {
  return (
    <mesh>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" transparent opacity={0.5} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas gl={{ preserveDrawingBuffer: true }} shadows dpr={[1, 1.5]}>
        <ambientLight intensity={2} />
        <Suspense fallback={<Box/>}>
          <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI/2} maxPolarAngle={Math.PI/2}/>
          <Model />
        </Suspense>
      </Canvas>
  );
}
