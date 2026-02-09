import React, { useEffect, useState } from 'react'
import './StudySidePanel.css'
import { getUUID } from '../../uuid';
import axios from 'axios';
import html2canvas from 'html2canvas';

export default function PdfExportPopup({ modelId }) {
    const [pdf, setPdf] = useState(null);
    const uuid = getUUID();
    const getPdf = async ({ onlyImportant }) => {
        try {
            //const formData = new FormData();
            //formData.append('image', imageFile);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/report/${modelId}/pdf?onlyimportant=${onlyImportant}`,
                {
                    headers: {
                        'X-USER-UUID': uuid,

                    },
                    responseType: 'blob',
                });
            setPdf(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const downloadPdfReport = async (onlyImportant) => {
        try {
            // 1. 캡처하고 싶은 DOM 요소를 선택 (예: id가 'capture-area'인 div)
            const element = document.getElementById('model-canvas-view');
            const canvas = element.querySelector('canvas');

            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            const imageBlob = await new Promise((resolve) =>
                // JPEG로 저장하면 용량도 줄고 배경 처리도 확실합니다. (품질 0.95)
                // 투명 배경이 필요 없으면 'image/jpeg'를 추천합니다.
                tempCanvas.toBlob(resolve, 'image/jpeg', 0.95)
            )            
            
            // const imageBlob = await new Promise((resolve) =>
            //     canvas.toBlob(resolve, 'image/png')
            // );

            // 3. FormData 생성 (채연 님 백엔드의 @RequestPart("image")와 맞춰야 함)
            const formData = new FormData();
            formData.append('image', imageBlob, 'capture.png');

            // 4. API 호출 (파라미터 주의!)
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/report/${modelId}/pdf?onlyImportant=${onlyImportant}`,
                formData,
                {
                    headers: {
                        'X-USER-UUID': uuid, // 유저 UUID
                        'Content-Type': 'multipart/form-data', // 중요!
                    },
                    responseType: 'blob', // PDF 파일을 받아야 하므로 blob 설정
                }
            );

            // 5. 받은 PDF 데이터를 파일로 다운로드 처리
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Report_${modelId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error("PDF 생성 중 오류 발생:", error);
        }
    };

    return (
        <div className='pdf-export-popup-view'>
            <button onClick={() => downloadPdfReport(false)}>
                전체 내보내기
            </button>
            <button onClick={() => downloadPdfReport(true)}>
                중요 내용만 내보내기
            </button>
        </div>
    )
}