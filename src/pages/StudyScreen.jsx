import React from 'react'
import ModelViewer from '../components/study/ModelViewer'
import SingleViewer from '../components/study/SingleViewer'
import StudySidePanel from '../components/study/StudySidePanel'

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
            {selectedModel === null &&
                <div style={{
                    width: '100%',
                    height: '100%',

                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',

                    fontSize: '24px',

                    border: '1px solid var(--green-main)',
                    boxShadow: 'var(--green-box-shadow)',
                    borderRadius: 10,
                }}>
                    선택된 모델이 존재하지 않습니다.
                </div>
            }
            {selectedModel != null &&
                <>
                    <div style={{ width: '55vw', height: '100%', minWidth: 0 }}>
                        {mode === 'assemble' && <ModelViewer selectedModelId={selectedModel.assetId} mode={mode} setMode={setMode} />}
                        {mode === 'single' && <SingleViewer selectedModel={selectedModel} mode={mode} setMode={setMode} />}
                    </div>
                    <div style={{ width: '20vw', height: '100%', marginLeft: 20 }}>
                        <StudySidePanel selectedModel={selectedModel} />
                    </div>
                </>
            }
        </div>

    )
}