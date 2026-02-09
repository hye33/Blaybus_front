import React from 'react'

export default function ModelSelectComponent({ label, thumbnailUrl, onClick }) {
    return (
        <div onClick={onClick}
            style={{
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
            <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#3e3e40',
                borderRadius: '5px',
            }}>
                <img src={thumbnailUrl} alt="Model Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
                width: '100%',
                fontSize: '24px',
                color: 'var(--green-main)',
                marginTop: '15px',
                fontFamily: 'var(--font-main)',
            }}>
                {label}
            </div>
        </div >
    )
}