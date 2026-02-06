import React from 'react'

export default function ModelSelectComponent({ label, onClick }) {
    return (
        <div onClick={onClick}
            style={{
                width: '285px',
                height: '225px',
                cursor: 'pointer',
            }}>
            <div style={{
                width: '285px',
                height: '176px',
                backgroundColor: '#3e3e40'
            }}>
                <img src="" alt="Model Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span>{label}</span>
        </div >
    )
}