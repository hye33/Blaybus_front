import React, { useEffect, useState } from 'react'
import './DescriptionPopup.css'
import closeButton from '../../assets/icons/closeButton.png';
import axios from 'axios';

export default function ModelDescriptionPopup({ modelDetails, setPopupOpen }) {
    const parts = modelDetails.parts;

    // 1. 초기값 null (아무것도 선택 안 된 상태)
    const [selectedPartIndex, setSelectedPartIndex] = useState(null);

    const handlePartClick = (index) => {
        if (selectedPartIndex === index) {
            // 이미 선택된 것을 다시 클릭 -> 선택 해제 (null)
            setSelectedPartIndex(null);
        } else {
            // 새로운 것 선택
            setSelectedPartIndex(index);
        }
    };

    // 2. 화면에 표시할 데이터 로직 수정
    // selectedPartIndex가 null이면 빈 배열 []을 반환하여 아무것도 그리지 않게 함
    const displayedParts = selectedPartIndex !== null
        ? [parts[selectedPartIndex]]
        : [];

    return (
        <div className="description-viewer">
            <span className='model-name-text'>{modelDetails.assetName}</span>
            <button className='close-button' onClick={() => setPopupOpen(false)}>
                <img src={closeButton} alt="close button" />
            </button>

            <div className='model-description-text'>
                {modelDetails.assetDescription}
            </div>

            <div className='line-divider' />

            <div className="part-images-container">
                {parts.length > 0 && (
                    parts.map((part, index) => (
                        <div
                            key={part.id || index}
                            // 선택된 인덱스와 같으면 active 클래스 추가
                            className={`part-image-box ${selectedPartIndex === index ? 'active' : ''}`}
                            onClick={() => handlePartClick(index)}
                        >
                            <img src={part.partThumbnailUrl} alt={part.partName} className='part-image' />
                        </div>
                    ))
                )}
            </div>

            {/* scrollview */}
            <div
                className='scroll-view'
                style={{
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    marginTop: '25px'
                }}
            >
                {/* 3. 렌더링 로직
                   displayedParts가 있을 때만 내용을 보여줍니다.
                   선택된 게 없으면 displayedParts가 빈 배열이므로 아무것도 렌더링되지 않습니다.
                */}
                {displayedParts.length > 0 && (
                    displayedParts.map((part, index) => (
                        <div className='selected-part-text-container' key={part.id || index}>
                            <div className='selected-part-name'>
                                {part.partName}
                            </div>
                            <div className='selected-part-description'>
                                {part.partDescription}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}