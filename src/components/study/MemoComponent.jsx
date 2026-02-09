import React, { useState } from 'react'
import './StudySidePanel.css'

export default function MemoComponent({ id, title, preview, setSelectedMemo }) {
    const [selected, setSelected] = useState(false)
    
    return (
        <button onClick={() => { setSelectedMemo(0); setSelected(!selected);}}
            className={`memo-component-view ${selected ? 'active' : ''}`}>
            <div className='memo-title preview'>
                제목
            </div>
            <div className='memo-content-text'>
                미리보기
            </div>
        </button >
    )
}