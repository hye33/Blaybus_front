import React, { useEffect } from 'react'
import ModelViewer from '../components/study/ModelViewer'
import SingleViewer from '../components/study/SingleViewer'
import StudySidePanel from '../components/study/StudySidePanel'

export default function StudyScreen({ selectedModel }) {
    const [mode, setMode] = React.useState('assemble');

    // ★ 1. 모델이 변경되거나 화면이 로드될 때 저장된 모드 불러오기
    useEffect(() => {
        if (selectedModel) {
            const savedMode = localStorage.getItem(`viewMode_${selectedModel.assetId}`);
            // 저장된 값이 있으면 그 값으로, 없으면 기본값 'assemble'
            setMode(savedMode || 'assemble');
        }
    }, [selectedModel]);

    // ★ 2. 모드 변경 시 State와 LocalStorage 모두 업데이트하는 함수
    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (selectedModel) {
            localStorage.setItem(`viewMode_${selectedModel.assetId}`, newMode);
        }
    };

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
                        {/* setMode={handleModeChange}로 전달해야 
                           자식 컴포넌트에서 버튼을 누를 때 저장 로직이 같이 실행됩니다.
                        */}
                        {mode === 'assemble' &&
                            <ModelViewer
                                selectedModel={selectedModel}
                                mode={mode}
                                setMode={handleModeChange}
                            />
                        }
                        {mode === 'single' &&
                            <SingleViewer
                                selectedModel={selectedModel}
                                mode={mode}
                                setMode={handleModeChange}
                            />
                        }
                    </div>
                    <div style={{ width: '20vw', height: '100%', marginLeft: 20 }}>
                        <StudySidePanel selectedModel={selectedModel} />
                    </div>
                </>
            }
        </div>
    )
}