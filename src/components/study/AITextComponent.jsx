import React, { useEffect, useState } from 'react'
import './StudySidePanel.css'
import bookmarkEmpty from '../../assets/icons/bookmark_empty.png'
import bookmarkFill from '../../assets/icons/bookmark_fill.png'
import { getUUID } from '../../uuid'
import axios from 'axios'

export default function AITextComponent({ selectedModel }) {
    const [bookmark, setBookmark] = useState(false);
    const [answer, setAnswer] = useState([]);
    const uuid = getUUID();

    useEffect(() => {
        const fetchAiResponse = async () => {
            // 스트림 데이터를 읽기 위한 디코더
            const decoder = new TextDecoder();
            // 전체 원본 데이터(data: ... 포함)를 누적할 변수
            let rawAccumulatedBuffer = "";

            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/ai/chats/${selectedModel.assetId}`, {
                    method: 'POST',
                    headers: {
                        'X-USER-UUID': uuid,
                        'Content-Type': 'application/json',
                    },
                    // fetch는 body를 직접 문자열로 변환해야 합니다.
                    body: JSON.stringify({
                        question: '드론에 대해 설명해 줘'
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Body에서 Reader 가져오기
                const reader = response.body.getReader();
                console.log(reader);

                while (true) {
                    // 스트림에서 데이터 조각 읽기 (done: 완료 여부, value: 데이터 조각)
                    const { done, value } = await reader.read();

                    if (done) break; // 스트림이 끝나면 반복 종료

                    // 1. 바이너리 조각(Unit8Array)을 텍스트로 변환
                    const chunk = decoder.decode(value, { stream: true });

                    // 2. 원본 버퍼에 누적 (Axios의 responseText와 같은 역할)
                    rawAccumulatedBuffer += chunk;

                    // 3. 기존 로직대로 파싱 (줄바꿈 분리 -> data: 필터링 -> 텍스트 결합)
                    const lines = rawAccumulatedBuffer.split('\n');

                    const fullText = lines
                        .filter(line => line.startsWith('data:'))
                        .map(line => {
                            // 'data:' 혹은 'data: ' (공백 포함)만 제거하고, 나머지 내용은 그대로 둠
                            return line.replace(/^data:\s?/, '');
                        })
                        .join(''); // 토큰 단위 스트림이라면 빈 문자열로 합치는 것이 맞습니다.

                    console.log("현재까지 완성된 글자:", fullText);
                    setAnswer(fullText);
                }

            } catch (error) {
                console.error("스트리밍 에러!", error);
            }
        };
        fetchAiResponse();
    }, []);


    return (
        <div className='ai-container'>
            <div className={`ai-text-container ${bookmark ? 'bookmark' : ''}`}>
                <div className="ai-question-text">
                    질문입니다
                </div>
                <div className="ai-answer-text">
                    {answer}
                </div>
                <button className="ai-bookmark" onClick={() => setBookmark(!bookmark)}>
                    <img src={bookmark ? bookmarkFill : bookmarkEmpty} alt="" />
                </button>
            </div>
        </div>
    )
}