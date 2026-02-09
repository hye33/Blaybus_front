import React, { useEffect, useState } from 'react'
import './StudySidePanel.css'
import addIcon from '../../assets/icons/addButton.png'
import delIcon from '../../assets/icons/deleteButton.png'
import sendIcon from '../../assets/icons/sendButton.png'
import { getUUID } from '../../uuid'
import axios from 'axios'
import AITextComponent from './AITextComponent'

export default function AIAssistantViewer({ selectedModel }) {
    const [answer, setAnswer] = useState(null);
    const [answerList, setAnswerList] = useState([]);
    const [question, setQuestion] = useState(null);
    const uuid = getUUID();

    const parse = (raw) => {
        const lines = raw.split('\n');
        const fullText = lines
            .filter(line => line.startsWith('data:'))
            .map(line => {
                const content = line.replace('data:', '');
                if (content === '') {
                    return '\n';
                }
                return content;
            })
            .join('');

        return fullText;
    }

    const fetchQuestion = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/ai/chats/${selectedModel.assetId}`,
                {
                    headers: {
                        'X-USER-UUID': uuid,

                    },
                });
            console.log(response);
            setAnswerList(response.data);
        } catch (error) {
            console.error("error: ", error);
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, []);

    const sendQuestion = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/ai/chats/${selectedModel.assetId}`,
                {
                    question: `${question}`
                },
                {
                    headers: {
                        'X-USER-UUID': uuid,

                    },
                });
            console.log(response);
            const fullAnswer = parse(response.data);

            const newChat = {
                'aiChatId': response.data.aiChatId,
                'question': question,
                'answer': fullAnswer,
                'isImportant': false,
                'assetId': selectedModel.assetId
            };

            setAnswerList([...answerList, newChat]);

        } catch (error) {
            console.error("스트리밍 에러!", error);
        }
    };

    const deleteQuestion = async () => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/api/ai/chats/asset/${selectedModel.assetId}`,
                {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
            console.log('delete question: ', selectedModel.assetId);
        } catch (error) {
            console.error("error: ", error);
        }
    };

    return (
        <div className='study-side-view'>
            {/* 헤더 */}
            <div className='panel-header'>
                <div className="header-title">
                    AI 어시스턴트
                </div>
                <div className='header-button-container'>
                    <button className='delete-button' onClick={() => deleteQuestion()}>
                        <img src={delIcon} alt="" />
                    </button>
                </div>
            </div>

            {/* 본문 */}
            <div className='ai-container'>
                {answerList && answerList.map((chat) => (
                    <AITextComponent
                        key={chat.aiChatId} // 리스트 렌더링 시 key는 필수입니다
                        chat={chat}
                    />
                ))}
            </div>

            {/* 전송창 */}
            <div className='ai-send-container'>
                <input type="text" name="" id="" placeholder='무엇이 궁금하신가요?'
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendQuestion()} />
                <button className='ai-send-button' onClick={() => {
                    sendQuestion();
                }}>
                    <img src={sendIcon} alt="" />
                </button>
            </div>
        </div >
    )
}