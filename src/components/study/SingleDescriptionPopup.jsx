import React from 'react'
import './DescriptionPopup.css'
import closeButton from '../../assets/icons/closeButton.png';

export default function SingleDescriptionPopup({ selectedPart, setPopupOpen }) {
    return (
        <div className="description-viewer">
            <span className='model-name-text'>{selectedPart.partName}</span>
            <button className='close-button' onClick={() => setPopupOpen(false)}>
                <img src={closeButton} alt="close button" />
            </button>

            <div className='single-image-box'>
                <img src={selectedPart.partThumbnailUrl} alt="Part 1" className='part-image' />
            </div>

            <div className='model-description-text'>
                {selectedPart.partDescription}
            </div>
        </div>
    )
}