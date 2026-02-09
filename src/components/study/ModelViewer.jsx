import { Canvas } from '@react-three/fiber'
import React, { useEffect, useState } from 'react'
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
import ModelDescriptionPopup from './ModelDescriptionPopup'
import axios from 'axios'
import { getUUID } from '../../uuid'


export default function ModelViewer({ selectedModelId, mode, setMode }) {
    const [d, setD] = useState(0)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)
    const [selected, setSelected] = useState(null)
    const [popupOpen, setPopupOpen] = useState(false);
    const transformRef = useRef()

    const controlsRef = useRef()
    const [modelDetails, setModelDetails] = useState([]);
    const uuid = getUUID();

    useEffect(() => {
        const getModelDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModelId}`, {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
                setModelDetails(response.data);
                console.log(response)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        getModelDetails();
    }, []);


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
                    style={{ width: 308, height: 4, marginLeft: 15 }}
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
                    className={`description-button ${popupOpen ? 'active' : ''}`}
                    onClick={() => setPopupOpen(!popupOpen)}
                >
                    {modelDetails.assetName}
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

            {/* <div
                style={{
                    position: 'absolute',
                    top: 120,
                    left: 20,
                    zIndex: 1,
                    color: 'white'
                }}
            >
                Selected: {selected ?? 'None'}
            </div> */}

            {popupOpen && <ModelDescriptionPopup modelDetails={modelDetails} setPopupOpen={setPopupOpen} />}

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
                    {selectedModelId === 1 && <Drone d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModelId === 2 && <LeafSpring d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModelId === 3 && <MachineVice d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModelId === 4 && <RobotArm d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModelId === 5 && <RobotGripper d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModelId === 6 && <Suspension d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                    {selectedModelId === 7 && <V4Engine d={d} x={x} y={y} z={z} onSelect={setSelected} />}

                </Canvas>
            </div>
        </div>
    )
}


