/* eslint-disable react/no-unknown-property */
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function Model(props) {
  const mesh = useRef()
  const { nodes, materials } = useGLTF('/one.glb')
  useFrame(() => (mesh.current.rotation.y += 0.01))
  return (
    <group {...props} dispose={null}>
      <mesh ref={mesh} geometry={nodes.Torus001.geometry} material={materials['Material.001']} scale={[1*1.3, 1.52*1.3, 1*1.3]} />
    </group>
  )
}

useGLTF.preload('/one.glb')
