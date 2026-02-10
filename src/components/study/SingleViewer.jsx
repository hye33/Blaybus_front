import React, { useState, useEffect } from 'react' // useEffect 추가
import './ModelViewer.css'
import SingleModelViewer from './SingleModelViewer';
import SingleSelectedViewer from './SingleSelectedViewer';

export default function SingleViewer({ selectedModel, mode, setMode }) {
    const [isSelected, setIsSelected] = useState(false)
    const [selectedPart, setSelectedPart] = useState(null)

    // 저장 키 생성 (모델별로 구분)
    const storageKey = `lastSelectedPart_${selectedModel.assetId}`;

    // ★ 1. 컴포넌트 마운트 시 저장된 부품이 있는지 확인하고 복구
    useEffect(() => {
        const savedPart = localStorage.getItem(storageKey);

        if (savedPart) {
            // 저장된 부품이 있다면 파싱하여 상태 복구
            setSelectedPart(JSON.parse(savedPart));
            setIsSelected(true);
        } else {
            // 없으면 초기화
            setIsSelected(false);
            setSelectedPart(null);
        }
    }, [selectedModel.assetId]); // 모델이 바뀔 때마다 실행

    // ★ 2. 부품을 선택했을 때 실행될 함수 (저장 로직 포함)
    const handleSelectPart = (part) => {
        setSelectedPart(part);
        setIsSelected(true);
        // 선택한 부품 정보 저장
        localStorage.setItem(storageKey, JSON.stringify(part));
    };

    // ★ 3. 뒤로가기 버튼 눌렀을 때 실행될 함수 (삭제 로직 포함)
    const handleGoBack = (status) => {
        // status가 false(뒤로가기)일 때만 스토리지 삭제
        if (status === false) {
            localStorage.removeItem(storageKey);
            setSelectedPart(null); // 상태도 깔끔하게 비움
        }
        setIsSelected(status);
    };

    return (
        <div className='viewer'>
            <div className='conversion-container'>
                <button
                    className={`conversion-button single-part-button ${mode === 'single' ? 'active' : ''}`}
                >
                    단일부품
                </button>
                <button
                    className={`conversion-button assemble-part-button ${mode === 'assemble' ? 'active' : ''}`}
                    onClick={() => {
                        setMode('assemble');
                        // 모드를 바꿀 때도 현재 보고 있던 단일 부품 기록을 지울지 선택해야 함.
                        // 보통은 유지하는 게 좋으므로 여기선 removeItem을 안 씁니다.
                    }}
                >
                    조립도
                </button>
            </div>

            {/* isSelected가 true일 때 (부품 상세 뷰)
                setIsSelected에 handleGoBack을 전달하여, 
                SingleModelViewer 안의 '뒤로가기' 버튼 클릭 시 스토리지를 비우도록 함 
            */}
            {isSelected && (
                <SingleModelViewer
                    selectedModel={selectedModel}
                    selectedPart={selectedPart}
                    setIsSelected={handleGoBack}
                />
            )}

            {/* isSelected가 false일 때 (부품 목록 뷰)
                setSelectedPart에 handleSelectPart를 전달하여,
                목록에서 아이템 클릭 시 스토리지에 저장되도록 함
            */}
            {!isSelected && (
                <SingleSelectedViewer
                    selectedModel={selectedModel}
                    setSelectedPart={handleSelectPart}
                    setIsSelected={setIsSelected}
                />
            )}
        </div >
    )
}