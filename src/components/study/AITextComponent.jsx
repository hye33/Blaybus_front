import React, { useEffect, useState } from 'react'
import './StudySidePanel.css'
import bookmarkEmpty from '../../assets/icons/bookmark_empty.png'
import bookmarkFill from '../../assets/icons/bookmark_fill.png'
import { getUUID } from '../../uuid'
import axios from 'axios'

export default function AITextComponent({ key, chat }) {
    const [bookmark, setBookmark] = useState(chat.isImportant);
    const [answer, setAnswer] = useState(null);
    const uuid = getUUID();

    const addBookmark = async () => {
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/api/ai/chats/${chat.aiChatId}?isImportant=${!bookmark}`,
                null,
                {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
        } catch (error) {
            console.error("error: ", error);
        }
    }

    return (
        <div className='ai-container'>
            <div className={`ai-text-container ${bookmark ? 'bookmark' : ''}`}>
                <div className="ai-question-text">
                    {chat.question}
                </div>
                <div className="ai-answer-text">
                    {chat.answer != null ? chat.answer : '답변을 생성 중입니다...'}
                </div>
                <button className="ai-bookmark" onClick={() => { addBookmark(); setBookmark(!bookmark); }}>
                    <img src={bookmark ? bookmarkFill : bookmarkEmpty} alt="" />
                </button>
            </div>
        </div>
    )
}