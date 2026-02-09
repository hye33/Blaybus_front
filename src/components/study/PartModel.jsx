import { useGLTF } from '@react-three/drei'

export function PartModel({ glbUrl }) {
    const { scene } = useGLTF(`${glbUrl}`)
    
    return (
        <primitive object={scene} scale={30} position={[0, 0, 0]}/>
    )
}