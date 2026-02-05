import { Canvas } from '@react-three/fiber'
import React, { useState } from 'react'
import { OrbitControls } from '@react-three/drei'
import { Environment } from '@react-three/drei'
import { BASE } from './models/suspension/BASE'
import { SPRING } from './models/suspension/SPRING'
import { NUT } from './models/suspension/NUT'
import { ROD } from './models/suspension/ROD'
import { useRef } from 'react'
import './ModelViewer.css'

export default function ModelViewer() {
    const [d, setD] = useState(0)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)
    const [selected, setSelected] = useState(null)
    const radian = Math.PI / 180

    const controlsRef = useRef()

    return (
        <div className='viewer'>
            <div className='range-container'>
                분해도
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={d}
                    onChange={(e) => setD(parseFloat(e.target.value))}
                    className="range-slider"
                    style={{ width: 308, height: 4 }}
                />
            </div>

            <button
                className='reset-button'
                onClick={() => controlsRef.current?.reset()}
            >
                Reset Camera
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
                모델명
            </button>

            {/* x y z 조절용 슬라이더 */}
            <div style={{ position: 'absolute', top: 40, left: 10, zIndex: 1, color: 'white' }}>
                <br />
                <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={x}
                    onChange={(e) => setX(parseFloat(e.target.value))}
                    style={{
                        width: 200,
                    }}
                />
                x: {x}
                <br />
                <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={y}
                    onChange={(e) => setY(parseFloat(e.target.value))}
                    style={{
                        width: 200,
                    }}
                />
                y: {y}
                <br />
                <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={z}
                    onChange={(e) => setZ(parseFloat(e.target.value))}
                    style={{
                        width: 200,
                    }}
                />
                z: {z}
            </div>

            <div
                style={{
                    position: 'absolute',
                    top: 120,
                    left: 20,
                    zIndex: 1,
                    color: 'white'
                }}
            >
                Selected: {selected ?? 'None'}
            </div>

            <Canvas camera={{ position: [0, 1, 2] }}>
                <OrbitControls ref={controlsRef} target={[0, 0, 0]} maxDistance={5} />
                {/* <color attach="background" args={['#141414']} /> */}
                <axesHelper args={[200, 200, 200]} />

                <Environment preset="apartment" />

                <ambientLight intensity={1} />

                {/* <group rotation={[radian * x, radian * y, radian * z]}> */}
                <group rotation={[radian * -63, radian * -45, radian * -57]}>
                    <BASE position={[0, -0.51 - d * 1.5, 0]} setSelected={setSelected} />
                    <SPRING position={[0, -0.5 - d * 0.5, 0]} setSelected={setSelected} />
                    <NUT position={[0, 0.5 + - d * 0.2, 0]} setSelected={setSelected} />
                    <ROD position={[0, 0.5 + d * 0.7, 0]} setSelected={setSelected} />
                </group>
            </Canvas>
        </div>
    )
}


