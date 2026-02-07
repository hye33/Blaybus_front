import { Canvas } from '@react-three/fiber'
import React, { useState } from 'react'
import { TransformControls, OrbitControls } from '@react-three/drei'
import { Environment } from '@react-three/drei'
import { useRef } from 'react'
import './ModelViewer.css'
import resetIcon from '../../assets/icons/resetButton.png';
import { Suspension } from '../models/Suspension'
import { V4Engine } from '../models/V4_Engine'
import { LeafSpring } from '../models/Leaf_Spring'
import { MachineVice } from '../models/Machine_Vice'
import { Drone } from '../models/Drone'
import { RobotGripper } from '../models/Robot_Gripper'
import { RobotArm } from '../models/Robot_Arm'

export default function ModelViewer({ selectedModel, mode, setMode }) {
    const [d, setD] = useState(0)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)
    const [selected, setSelected] = useState(null)
    const transformRef = useRef()

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

            <div>
                <button
                    className='reset-button'
                    onClick={() => controlsRef.current?.reset()}
                >
                    <img src={resetIcon} alt="icon" />
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
            </div>

            <div className='conversion-container'>
                <button
                    className={`conversion-button single-part-button ${mode === 'single' ? 'active' : ''}`}
                    onClick={() => setMode('single')}
                >
                    단일부품
                </button>
                <button
                    className={`conversion-button assemble-part-button ${mode === 'assemble' ? 'active' : ''}`}
                >
                    조립도
                </button>
            </div>

            {/* x y z 조절용 슬라이더 */}
            {/* <div style={{ position: 'absolute', top: 120, left: 10, zIndex: 1, color: 'white' }}>
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
            </div> */}

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

            <div style={{width: '100%', height: '100%'}}>
                <Canvas camera={{ position: [0, 1, 2] }}>
                    <OrbitControls ref={controlsRef} target={[0, 0, 0]} maxDistance={5} />
                    {/* <color attach="background" args={['#141414']} /> */}
                    {/* <axesHelper args={[200, 200, 200]} /> */}
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
                    {selectedModel === 'suspension' && <Suspension d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModel === 'V4-engine' && <V4Engine d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModel === 'machine-vice' && <MachineVice d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModel === 'leaf-spring' && <LeafSpring d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModel === 'robot-arm' && <RobotArm d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModel === 'robot-gripper' && <RobotGripper d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModel === 'drone' && <Drone d={d} x={x} y={y} z={z} onSelect={setSelected} />}

                </Canvas>
            </div>
        </div>
    )
}


