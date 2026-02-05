import React from 'react'
import ModelViewer from '../components/ModelViewer'

export default function StudyScreen() {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            backgroundColor: '#18181A',
            width: '100%',
            height: '100%',
        }}>
            <div style={{ width: '70%', height: '100%' }}>
                <ModelViewer />
            </div>
            <div>
                <div style={{ height: '40%' }}>
                    Memo
                </div>
                <div style={{ height: '60%' }}>
                    AI tools
                </div>
            </div>
        </div>

    )
}