import React, { useState } from 'react'
import './StudySidePanel.css'

export default function MemoComponent({ key, memo, selectedMemo, changeSelectedMemo }) {
    return (
        <button onClick={() => { changeSelectedMemo(memo)}}
            className={`memo-component-view ${selectedMemo == null || memo.memoId != selectedMemo.memoId ? '' : 'active'}`}>
            <div className='memo-title preview'>
                {memo.memoTitle}
            </div>
            <div className='memo-content-text'>
                {memo.memoContents}
            </div>
        </button >
    )
}