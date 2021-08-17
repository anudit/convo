import React, { useRef, useEffect, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function Model(props) {
  const mesh = useRef()
  const { nodes, materials } = useGLTF('/PLZD.glb')
  useFrame((state, delta) => (mesh.current.rotation.y += 0.01))

  return (
    <group  {...props} dispose={null}>
      <mesh
        ref={mesh}
        geometry={nodes.Torus004.geometry}
        material={materials['Material.002']}
        rotation={[0, 0, Math.PI/2]}
        scale={[1.62/12, 0.96/12, 1/12]}
      />
    </group>
  )
}

useGLTF.preload('/PLZD.glb')
