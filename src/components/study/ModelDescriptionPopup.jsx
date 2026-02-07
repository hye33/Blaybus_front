import React from 'react'
import './DescriptionPopup.css'
import closeButton from '../../assets/icons/closeButton.png';

export default function ModelDescriptionPopup({ selectedModel, setPopupOpen }) {
    return (
        <div className="description-viewer">
            <span className='model-name-text'>{selectedModel}</span>
            <button className='close-button' onClick={() => setPopupOpen(false)}>
                <img src={closeButton} alt="close button" />
            </button>

            <div className='model-description-text'>
                {selectedModel}에 대한 자세한 설명이 여기에 표시됩니다. 이 모델은 다양한 부품으로 구성되어 있으며, 각 부품은 특정 기능을 수행합니다.
            </div>

            <div className='line-divider' />

            <div className="part-images-container">
                <div className='part-image-box'>
                    <img src="" alt="Part 1" className='part-image' />
                </div>
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
                <div className='selected-part-text-container'>
                    <div className='selected-part-name'>{selectedModel}</div>
                    <div className='selected-part-description'>
                        {selectedModel}의 부품에 대한 설명이 여기에 표시됩니다. 이 부품은 모델의 핵심 요소로서, 전체 시스템에서 중요한 역할을 합니다.
                    </div>
                </div>
                <div className='selected-part-text-container'>
                    <div className='selected-part-name'>{selectedModel}</div>
                    <div className='selected-part-description'>
                        {selectedModel}의 부품에 대한 설명이 여기에 표시됩니다. 이 부품은 모델의 핵심 요소로서, 전체 시스템에서 중요한 역할을 합니다.
                    </div>
                </div>
                <div className='selected-part-text-container'>
                    <div className='selected-part-name'>{selectedModel}</div>
                    <div className='selected-part-description'>
                        {selectedModel}의 부품에 대한 설명이 여기에 표시됩니다. 이 부품은 모델의 핵심 요소로서, 전체 시스템에서 중요한 역할을 합니다.
                    </div>
                </div>
                <div className='selected-part-text-container'>
                    <div className='selected-part-name'>{selectedModel}</div>
                    <div className='selected-part-description'>
                        {selectedModel}의 부품에 대한 설명이 여기에 표시됩니다. 이 부품은 모델의 핵심 요소로서, 전체 시스템에서 중요한 역할을 합니다.
                    </div>
                </div>
                <div className='selected-part-text-container'>
                    <div className='selected-part-name'>{selectedModel}</div>
                    <div className='selected-part-description'>
                        {selectedModel}의 부품에 대한 설명이 여기에 표시됩니다. 이 부품은 모델의 핵심 요소로서, 전체 시스템에서 중요한 역할을 합니다.
                    </div>
                </div>
            </div>
        </div>
    )
}