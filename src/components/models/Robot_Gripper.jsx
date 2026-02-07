import { useGLTF } from '@react-three/drei'

export function RobotGripper({ d = 0, x = 0, y = 0, z = 0, setSelected, ...props }) {
  const assemble = useGLTF('/models/Robot_Gripper.glb')
  const explode = useGLTF('/models/Robot_Gripper_ex.glb')
  const partNames = assemble?.nodes && explode?.nodes
    ? Object.keys(assemble.nodes).filter(name => explode.nodes[name])
    : []

  const lerpPos = (a, b, t) => [
    a[0] * (1 - t) + b[0] * 10 * t,
    a[1] * (1 - t) + b[1] * 10 * t,
    a[2] * (1 - t) + b[2] * 10 * t
  ]

  const radian = Math.PI / 180
  return (
    <group
      position={[0.3, 0.5, 0]}
      rotation={[radian * 27, radian * -27, radian * 10]}
      scale={1.5}
      >
      {partNames.map(name => {
        const assembledPos = assemble.nodes[name].position.toArray()
        const explodedPos = explode.nodes[name].position.toArray()
        const pos = lerpPos(assembledPos, explodedPos, d)

        return (
          <mesh
            scale={10}
            key={name}
            geometry={assemble.nodes[name].geometry}
            material={assemble.nodes[name].material}
            position={pos}
          />
        )
      })}
    </group>
  )
}

useGLTF.preload('/models/Robot_Gripper.glb')
useGLTF.preload('/models/Robot_Gripper_ex.glb')