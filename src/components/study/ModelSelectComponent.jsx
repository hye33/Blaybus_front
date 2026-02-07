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
            <div style={{
                width: '285px',
                fontSize: '26px',
                color: 'var(--green-main)',
            }}>
                {label}
            </div>
        </div >
    )
}