import { useGLTF } from '@react-three/drei'

export function AssembleModel({ d = 0, model, ...props }) {
  const assemble = useGLTF(`${model.assetAssembledGlbUrl}`)
  const explode = useGLTF(`${model.assetExplodedGlbUrl}`)
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
      position={[model.position.x, model.position.y, model.position.z]}
      rotation={[radian * model.rotation.x, radian * model.rotation.y, radian * model.rotation.z]}
      scale={0.7}
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