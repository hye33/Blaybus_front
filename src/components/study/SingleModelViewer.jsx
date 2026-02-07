import React, { useState } from 'react'
import { TransformControls, OrbitControls } from '@react-three/drei'
import { Environment } from '@react-three/drei'
import './ModelViewer.css'
import resetIcon from '../../assets/icons/resetButton.png';
import { Canvas } from '@react-three/fiber'
import { useRef } from 'react'

export default function SingleModelViewer({ selectedModel, setIsSelected }) {

    const [selected, setSelected] = useState(null)
    const transformRef = useRef()

    const controlsRef = useRef()
    return (
        <div className='viewer'>
            <div>
                <button
                    className='reset-button'
                    onClick={() => controlsRef.current?.reset()}
                >
                    <img src={resetIcon} alt="icon" />
                </button>

                <button
                    className='back-button'
                    style={{ color: '#78E875'}}
                    onClick={() => setIsSelected(false)}
                >
                    뒤로가기
                </button>

                <button
                    className='zoom-button zoom-in-button'
                    onClick={() => controlsRef.current?.dollyOut(1.2)}
                >
                    +
                </button>

                <button
                    className='zoom-button zoom-out-button'
                    onClick={() => controlsRef.current?.dollyIn(1.2)}
                >
                    -
                </button>

                <button
                    className='description-button'
                    onClick={() => controlsRef.current?.reset()}
                >
                    부품명
                </button>
            </div>

            <Canvas camera={{ position: [2, 1, 2] }}>
                <OrbitControls ref={controlsRef} target={[0, 0, 0]} maxDistance={5} />
                {/* <color attach="background" args={['#141414']} /> */}
                <axesHelper args={[200, 200, 200]} />
                <Environment preset="apartment" />

                <ambientLight intensity={1} />

                {selected && (
                    <TransformControls
                        ref={transformRef}
                        object={selected}
                        mode="translate"
                        onMouseUp={() => {
                            console.log('pos', selected.position)
                            console.log('rot', selected.rotation)
                        }}
                    />
                )}

            </Canvas>
        </div >
    )
}