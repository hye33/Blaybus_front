import React, { useState } from 'react'
import './ModelViewer.css'
import SingleModelViewer from './SingleModelViewer';

export default function SingleViewer({ selectedModel, mode, setMode }) {
    const [selected, setSelected] = useState(null)
    const [isSelected, setIsSelected] = useState(true)
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
                    onClick={() => setMode('assemble')}
                >
                    조립도
                </button>
            </div>
            {isSelected && <SingleModelViewer selectedModel={selectedModel} setIsSelected={setIsSelected}/>}

        </div >
    )
}