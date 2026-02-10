import { useBounds, useGLTF } from '@react-three/drei'
import { useEffect } from 'react';

export function PartModel({ glbUrl }) {
    const { scene } = useGLTF(glbUrl);
    const bounds = useBounds();

    useEffect(() => {
        if (bounds) {
            bounds.refresh(scene).clip().fit();
        }
    }, [scene, bounds]); 

    return <primitive object={scene} />;
}