import React, { useEffect, useState } from 'react'
import './DescriptionPopup.css'
import closeButton from '../../assets/icons/closeButton.png';
import axios from 'axios';

export default function ModelDescriptionPopup({ modelDetails, setPopupOpen }) {
    const parts = modelDetails.parts;
    // 마저 이어서 연결 ㄱ
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
                        <div className='part-image-box'>
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
                {parts && parts.length > 0 ? (
                    parts.map((part, index) => (
                        <div className='selected-part-text-container' key={part.id || index}>
                            <div className='selected-part-name'>
                                {part.partName}
                            </div>
                            <div className='selected-part-description'>
                                {part.partDescription}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='no-data-text'>파츠 정보가 없습니다.</div>
                )}
            </div>
        </div>
    )
}