import React, { useState } from 'react'
import './StudySidePanel.css'
import addIcon from '../../assets/icons/addButton.png'
import delIcon from '../../assets/icons/deleteButton.png'
import bookmarkEmpty from '../../assets/icons/bookmark_empty.png'
import bookmarkFill from '../../assets/icons/bookmark_fill.png'
import MemoComponent from './MemoComponent'

export default function MemoViewer() {
    // 첫번째 메모가 선택된 상태가 되도록
    const [selectedMemo, setSelectedMemo] = useState(null);
    const [bookmark, setBookmark] = useState(false);

    return (
        <div className='study-side-view' style={{display: 'flex', flexDirection: 'column'}}>
            {/* 헤더 */}
            <div className='panel-header'>
                <div className="header-title">
                    MEMO
                </div>
                <div className='header-button-container'>
                    <button className='add-button'>
                        <img src={addIcon} alt="" />
                    </button>
                    <button className='delete-button'>
                        <img src={delIcon} alt="" />
                    </button>
                </div>
            </div>

            {/* 가로 스크롤뷰 */}
            <div className='memo-list-scrollview'>
                <MemoComponent setSelectedMemo={setSelectedMemo}/>
                <MemoComponent setSelectedMemo={setSelectedMemo} />
                <MemoComponent setSelectedMemo={setSelectedMemo} />
                <MemoComponent setSelectedMemo={setSelectedMemo} />
            </div>

            {/* 메모 본문 */}
            {selectedMemo != null && <div className='memo-view'>
                <input type='text' className='memo-title' placeholder='제목' />
                <textarea type='' className='memo-content-text' placeholder='본문' />
                <button className="memo-bookmark" onClick={() => setBookmark(!bookmark)}>
                    <img src={bookmark ? bookmarkFill : bookmarkEmpty} alt="" />
                </button>
            </div>}
        </div >
    )
}