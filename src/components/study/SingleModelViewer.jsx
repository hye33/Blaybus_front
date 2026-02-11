import React, { Suspense, useEffect, useState, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber' // useThree 추가
import { OrbitControls, Bounds, Environment, useBounds } from '@react-three/drei'
import './ModelViewer.css'
import resetIcon from '../../assets/icons/resetButton.png';
import SingleDescriptionPopup from './SingleDescriptionPopup';
import axios from 'axios';
import { PartModel } from './PartModel';

// ★ 1. 카메라 상태 복원용 컴포넌트
const CameraHandler = ({ controlsRef, storageKey }) => {
    const { camera } = useThree();

    useEffect(() => {
        const savedState = localStorage.getItem(storageKey);

        if (savedState && controlsRef.current) {
            const { position, target } = JSON.parse(savedState);

            // 저장된 위치로 카메라 이동
            camera.position.set(position.x, position.y, position.z);
            // 저장된 타겟(중심점)으로 설정
            controlsRef.current.target.set(target.x, target.y, target.z);

            controlsRef.current.update();
        }
    }, [storageKey, camera, controlsRef]);

    return null;
};

export default function SingleModelViewer({ selectedModel, selectedPart, setIsSelected }) {
    const [popupOpen, setPopupOpen] = useState(false);
    const [part, setPart] = useState([]);

    const controlsRef = useRef()

    // ★ 2. 각 부품별 고유 저장 키 생성 (모델ID + 부품ID)
    const storageKey = `singlePartCamera_${selectedModel.assetId}_${selectedPart.partId}`;

    useEffect(() => {
        const getPart = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModel.assetId}/parts/${selectedPart.partId}`);
                setPart(response.data);
                console.log(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        getPart();
    }, [selectedModel.assetId, selectedPart.partId]); // 의존성 배열 보강

    // ★ 3. 카메라 상태 저장 함수
    const saveCameraState = () => {
        if (controlsRef.current) {
            const state = {
                position: controlsRef.current.object.position,
                target: controlsRef.current.target
            };
            localStorage.setItem(storageKey, JSON.stringify(state));
        }
    };

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

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div>
                <button
                    className='reset-button'
                    onClick={handleReset}
                >
                    <img src={resetIcon} alt="icon" />
                </button>

                <button
                    className='back-button'
                    style={{ color: '#78E875' }}
                    onClick={() => setIsSelected(false)}
                >
                    부품 선택
                </button>

                <button
                    className='zoom-button zoom-in-button'
                    onClick={() => {
                        controlsRef.current?.dollyOut(1.2);
                        controlsRef.current?.update();
                        saveCameraState(); // 줌 버튼 사용 시에도 저장
                    }}
                >
                    +
                </button>

                <button
                    className='zoom-button zoom-out-button'
                    onClick={() => {
                        controlsRef.current?.dollyIn(1.2);
                        controlsRef.current?.update();
                        saveCameraState(); // 줌 버튼 사용 시에도 저장
                    }}
                >
                    -
                </button>

                <button
                    className='description-button'
                    onClick={() => setPopupOpen(!popupOpen)}
                >
                    {part.partName}
                </button>
            </div>

            {popupOpen && <SingleDescriptionPopup selectedPart={part} setPopupOpen={setPopupOpen} />}

            <Canvas id='model-canvas-view'
                camera={{ position: [2, 1, 2] }}
                gl={{ preserveDrawingBuffer: true }}
                alpha={false}
            >
                {/* ★ 4. 카메라 핸들러 배치 */}
                <CameraHandler controlsRef={controlsRef} storageKey={storageKey} />

                <OrbitControls
                    makeDefault
                    ref={controlsRef}
                    target={[0, 0, 0]}
                    onEnd={saveCameraState} /* ★ 5. 드래그 종료 시 저장 */
                />

                <Environment preset="apartment" />
                <ambientLight intensity={1} />

                {/* Bounds는 초기 로드 시 모델을 화면에 꽉 차게 잡아주지만,
                    CameraHandler가 실행되면 저장된 시점으로 덮어씌워집니다. */}
                <Bounds fit clip observe margin={1.5}>
                    <Suspense fallback={null}>
                        {part.partGlbUrl && <PartModel glbUrl={part.partGlbUrl} />}

                        <BoundsController doReset={resetSignal} />
                    </Suspense>
                </Bounds>

            </Canvas>
        </div >
    )
}