import React from 'react'
import ModelViewer from '../components/study/ModelViewer'
import MemoViewer from '../components/study/MemoViewer'
import AIAssistantViewer from '../components/study/AIAssistantViewer'
import SingleViewer from '../components/study/SingleViewer'

export default function StudyScreen({ selectedModel }) {
    const [mode, setMode] = React.useState('assemble');
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#18181A',
            width: '100%',
            height: '100%',
        }}>
            <div style={{ width: '52.5vw', height: '100%', minWidth: 0 }}>
                {mode === 'assemble' && <ModelViewer selectedModel={selectedModel} mode={mode} setMode={setMode} />}
                {mode === 'single' && <SingleViewer selectedModel={selectedModel} mode={mode} setMode={setMode} />}
            </div>
            <div style={{ width: '22.5vw', height: '100%', marginLeft: 20 }}>
                <div style={{ width: '100%', height: 'calc((100% - 20px) * 0.4)' }}>
                    <MemoViewer />
                </div>
                <div style={{ width: '100%', height: 'calc((100% - 20px) * 0.6)', marginTop: 20 }}>
                    <AIAssistantViewer />
                </div>
            </div>
        </div>

    )
}