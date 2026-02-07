import React from 'react'
import './DescriptionPopup.css'
import closeButton from '../../assets/icons/closeButton.png';

export default function SingleDescriptionPopup({ selectedPart, setPopupOpen }) {
    return (
        <div className="description-viewer">
            <span className='model-name-text'>{selectedPart}</span>
            <button className='close-button' onClick={() => setPopupOpen(false)}>
                <img src={closeButton} alt="close button" />
            </button>

            <div className='single-image-box'>
                <img src="" alt="Part 1" className='part-image' />
            </div>

            <div className='model-description-text'>
                {selectedPart}에 대한 자세한 설명이 여기에 표시됩니다. 이 모델은 다양한 부품으로 구성되어 있으며, 각 부품은 특정 기능을 수행합니다.
            </div>
        </div>
    )
}