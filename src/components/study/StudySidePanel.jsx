import React from 'react'
import './StudySidePanel.css'
import MemoViewer from './MemoViewer.jsx'
import AIAssistantViewer from './AIAssistantViewer.jsx'
import PDFImage from '../../assets/icons/pdfButton.png'

export default function StudySidePanel() {
    const [tab, setTab] = React.useState(0)
    return <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#18181A',
        border: '1px solid #F88CDC',
        borderRadius: 10,
        boxShadow: '0 0px 12px rgba(248, 140, 205, 0.5)',
        position: 'relative'
    }}>
        <nav className='side-panel-nav'>
            <button className={`side-panel-nav-item ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
                메모
            </button>
            <button className={`side-panel-nav-item ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
                AI 어시스턴트
            </button>
        </nav>

        <div className='side-panel-content'>
            {tab === 0 && <MemoViewer />}
            {tab === 1 && <AIAssistantViewer />}
        </div>

        <button className='pdf-export-button'>
            <img src={PDFImage} alt="" />
        </button>
    </div >
}