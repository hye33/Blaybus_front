import React, { useEffect, useState } from 'react'
import './StudySidePanel.css'
import addIcon from '../../assets/icons/addButton.png'
import delIcon from '../../assets/icons/deleteButton.png'
import sendIcon from '../../assets/icons/sendButton.png'
import { getUUID } from '../../uuid'
import axios from 'axios'
import AITextComponent from './AITextComponent'

export default function AIAssistantViewer({ selectedModel }) {
    const [answer, setAnswer] = useState([]);
    const uuid = getUUID();

    const parseSSE = (raw) => {
        return raw
            .split('\n')
            .filter(line => line.startsWith('data:'))
            .map(line => line.replace('data:', '').trim())
            .filter(text => text !== '')
            .join('');
    };

    // useEffect(() => {
    //     const getAI = async () => {
    //         try {
    //             const response = await axios.post(
    //                 `${process.env.REACT_APP_API_BASE_URL}/api/ai/chats/1`,
    //                 {
    //                     question: '드론은 무슨 기계야?',
    //                 },
    //                 {
    //                     headers: {
    //                         'X-USER-UUID': uuid,
    //                     },
    //                 }
    //             );
    //             setAnswer(parseSSE(response.data));
    //             console.log(response);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     getAI();
    // }, []);

    return (
        <div className='study-side-view'>
            {/* 헤더 */}
            <div className='panel-header'>
                <div className="header-title">
                    AI 어시스턴트
                </div>
                <div className='header-button-container'>
                    <button className='delete-button'>
                        <img src={delIcon} alt="" />
                    </button>
                </div>
            </div>

            {/* 본문 */}
            <div className='ai-container'>
                <AITextComponent selectedModel={selectedModel }/>
            </div>

            {/* 전송창 */}
            <div className='ai-send-container'>
                <input type="text" name="" id="" placeholder='무엇이 궁금하신가요?' />
                <button className='ai-send-button'>
                    <img src={sendIcon} alt="" />
                </button>
            </div>
        </div >
    )
}