import { Canvas, useThree } from '@react-three/fiber'
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { TransformControls, OrbitControls, Bounds, useBounds } from '@react-three/drei'
import { Environment } from '@react-three/drei'
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
import { AssembleModel } from './AssembleModel'

// 카메라 상태(위치, 줌) 복원용 컴포넌트
const CameraHandler = ({ controlsRef, modelId }) => {
    const { camera } = useThree();

    useEffect(() => {
        const savedState = localStorage.getItem(`cameraState_${modelId}`);
        if (savedState && controlsRef.current) {
            const { position, target } = JSON.parse(savedState);
            camera.position.set(position.x, position.y, position.z);
            controlsRef.current.target.set(target.x, target.y, target.z);
            controlsRef.current.update();
        }
    }, [modelId, camera, controlsRef]);

    return null;
};

export default function ModelViewer({ selectedModel, mode, setMode }) {
    const [d, setD] = useState(0)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)
    const [selected, setSelected] = useState(null)
    const [popupOpen, setPopupOpen] = useState(false);

    const controlsRef = useRef()
    const [modelDetails, setModelDetails] = useState([]);
    const uuid = getUUID();

    useEffect(() => {
        const savedD = localStorage.getItem(`explosionState_${selectedModel.assetId}`);
        if (savedD) {
            setD(parseFloat(savedD));
        } else {
            setD(0); // 저장된 값이 없으면 0으로 초기화
        }

        // (2) 모델 상세 정보 API 호출
        const getModelDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModel.assetId}`, {
                    headers: { 'X-USER-UUID': uuid },
                });
                setModelDetails(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        getModelDetails();

    }, [selectedModel.assetId, uuid]);


    const saveCameraState = () => {
        if (controlsRef.current) {
            const state = {
                position: controlsRef.current.object.position,
                target: controlsRef.current.target
            };
            localStorage.setItem(`cameraState_${selectedModel.assetId}`, JSON.stringify(state));
        }
    };

    // const handleReset = () => {
    //     // 카메라 초기화
    //     controlsRef.current?.reset();
    //     localStorage.removeItem(`cameraState_${selectedModel.assetId}`);

    //     // 분해도 초기화
    //     setD(0);
    //     localStorage.removeItem(`explosionState_${selectedModel.assetId}`);
    // };

    const [resetSignal, setResetSignal] = useState(0);
    // 리셋 시 저장된 시점도 삭제 (원래 Bounds 뷰로 돌아가기 위함)
    const handleReset = () => {
        setResetSignal(prev => prev + 1);
    };

    function BoundsController({ doReset }) {
        const bounds = useBounds();

        useEffect(() => {
            // doReset 값이 바뀔 때마다 실행 (버튼 눌렀을 때)
            if (doReset) {
                bounds.refresh().clip().fit();
            }
        }, [doReset, bounds]);

        return null; // 화면엔 안 보임
    }

    const getThumbColor = (value) => {
        // 시작 색상 (파랑 계열: rgb(59, 130, 246))
        const startColor = { r: 120, g: 232, b: 117 };
        // 끝 색상 (빨강 계열: rgb(239, 68, 68))
        const endColor = { r: 248, g: 140, b: 220 };

        // 선형 보간 계산
        const r = Math.round(startColor.r + (endColor.r - startColor.r) * value);
        const g = Math.round(startColor.g + (endColor.g - startColor.g) * value);
        const b = Math.round(startColor.b + (endColor.b - startColor.b) * value);

        return `rgb(${r}, ${g}, ${b})`;
    };

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
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setD(val);
                        // ★ 4. 슬라이더 움직일 때마다 분해도 값 저장
                        localStorage.setItem(`explosionState_${selectedModel.assetId}`, val);
                    }}
                    className="range-slider"
                    style={{ width: 308, height: 4, marginLeft: 15, '--thumb-color': getThumbColor(d) }}
                />
            </div>

            <div>
                <button
                    className='reset-button'
                    onClick={handleReset}
                >
                    <img src={resetIcon} alt="icon" />
                </button>

                <button
                    className='zoom-button zoom-in-button'
                    onClick={() => {
                        controlsRef.current?.dollyOut(1.2);
                        controlsRef.current?.update();
                        saveCameraState();
                    }}
                >
                    +
                </button>

                <button
                    className='zoom-button zoom-out-button'
                    onClick={() => {
                        controlsRef.current?.dollyIn(1.2);
                        controlsRef.current?.update();
                        saveCameraState();
                    }}
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

            {popupOpen && <ModelDescriptionPopup modelDetails={modelDetails} setPopupOpen={setPopupOpen} />}

            <div id='model-canvas-view' style={{ width: '100%', height: '100%' }}>
                <Canvas camera={{ position: [0, 1, 2] }}
                    gl={{ preserveDrawingBuffer: true }}
                >
                    <CameraHandler controlsRef={controlsRef} modelId={selectedModel.assetId} />

                    <OrbitControls
                        makeDefault
                        ref={controlsRef}
                        target={[0, 0, 0]}
                        maxDistance={5}
                        onEnd={saveCameraState}
                    />

                    <Environment preset="apartment" />
                    <ambientLight intensity={1} />

                    <Bounds>
                        {selectedModel.assetId === 1 && <Drone d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        {selectedModel.assetId === 2 && <LeafSpring d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        {selectedModel.assetId === 3 && <MachineVice d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        {selectedModel.assetId === 4 && <RobotArm d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        {selectedModel.assetId === 5 && <RobotGripper d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        {selectedModel.assetId === 6 && <Suspension d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        {selectedModel.assetId === 7 && <V4Engine d={d} x={x} y={y} z={z} onSelect={setSelected} />}
                        <BoundsController doReset={resetSignal} />
                    </Bounds>


                </Canvas>
            </div>
        </div>
    )
}