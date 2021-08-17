import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export default function Model(props) {
    const mesh = useRef()
    const { nodes, materials } = useGLTF('/combined.glb')
    useFrame(() => (mesh.current.rotation.y += 0.01))

    return (
        <group {...props} dispose={null}>
        <mesh ref={mesh}  geometry={nodes.Torus.geometry} material={materials['Material.001']} scale={[1/1.4, 1.52/1.4, 1/1.4]} />
      </group>
  )
}

useGLTF.preload('/combined.glb')
