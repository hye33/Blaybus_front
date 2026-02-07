import React, { useState } from 'react'
import './ModelViewer.css'
import SingleModelViewer from './SingleModelViewer';
import SingleSelectedViewer from './SingleSelectedViewer';

export default function SingleViewer({ selectedModel, mode, setMode }) {
    const [isSelected, setIsSelected] = useState(false)
    const [selectedPart, setSelectedPart] = useState(null)
    return (
        <div className='viewer'>
            <div>{selectedPart}</div>
            <div className='conversion-container'>
                <button
                    className={`conversion-button single-part-button ${mode === 'single' ? 'active' : ''}`}
                >
                    단일부품
                </button>
                <button
                    className={`conversion-button assemble-part-button ${mode === 'assemble' ? 'active' : ''}`}
                    onClick={() => setMode('assemble')}
                >
                    조립도
                </button>
            </div>
            {isSelected && <SingleModelViewer selectedPart={selectedPart} setIsSelected={setIsSelected}/>}
            {!isSelected && <SingleSelectedViewer setSelectedPart={setSelectedPart} setIsSelected={setIsSelected}/>}
        </div >
    )
}