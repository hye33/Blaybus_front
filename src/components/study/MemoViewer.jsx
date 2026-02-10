import React, { useEffect, useState } from 'react'
import './StudySidePanel.css'
import addIcon from '../../assets/icons/addButton.png'
import delIcon from '../../assets/icons/deleteButton.png'
import bookmarkEmpty from '../../assets/icons/bookmark_empty.png'
import bookmarkFill from '../../assets/icons/bookmark_fill.png'
import MemoComponent from './MemoComponent'
import { getUUID } from '../../uuid'
import axios from 'axios'

export default function MemoViewer({ selectedModelId }) {
    // 첫번째 메모가 선택된 상태가 되도록
    const [selectedMemo, setSelectedMemo] = useState(null); // 객체
    const [bookmark, setBookmark] = useState(false);
    const [memoList, setMemoList] = useState(null); // array
    const [isNewMemo, setIsNewMemo] = useState(false); // bool
    const [isImportant, setIsImportant] = useState(false);

    const targetMemo = memoList?.find((item) => item.memoId === selectedMemo);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const uuid = getUUID();

    const changeSelectedMemo = (memo) => {
        setSelectedMemo(memo);
        setTitle(memo.memoTitle);
        setContent(memo.memoContents);
        setIsImportant(memo.isImportant)
    }

    const fetchMemo = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModelId}/memos`,
                {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
            console.log(response);
            setMemoList(response.data);
        } catch (error) {
            console.error("error: ", error);
        }
    };

    useEffect(() => {
        fetchMemo();
    }, []);

    const saveMemo = () => {
        if (isNewMemo) {
            createMemo();
            setIsNewMemo(false);
        }
        else
            editMemo();
    }

    const createMemo = async () => {
        setTitle("")
        setContent("")
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModelId}/memos`,
                {
                    "memoTitle": title,
                    "memoContents": content,
                    "isImportant": isImportant
                },
                {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
            fetchMemo();
            setSelectedMemo(null)
        } catch (error) {
            console.error("error: ", error);
        }
    };

    const editMemo = async () => {
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModelId}/memos/${selectedMemo.memoId}`,
                {
                    "memoTitle": title,
                    "memoContents": content,
                    "isImportant": isImportant
                },
                {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
            fetchMemo();
        } catch (error) {
            console.error("error: ", error);
        }
    };

    const deleteMemo = async () => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModelId}/memos/${selectedMemo.memoId}`,
                {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
        } catch (error) {
            console.error("error: ", error);
        }
        fetchMemo();
        setSelectedMemo(null);
    };

    const addBookmark = async () => {
        try {
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModelId}/memos/${selectedMemo.memoId}/important`,
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
        <div className='study-side-view' style={{ display: 'flex', flexDirection: 'column' }}>
            {/* 헤더 */}
            <div className='panel-header'>
                <div className="header-title">
                    MEMO
                </div>
                <div className='header-button-container'>
                    <button className='add-button' onClick={() => {
                        const newMemo = {
                            'memoTitle': "",
                            'memoContent': "",
                            'isImportant': false,
                            'memoId': 0
                        }
                        setMemoList([...memoList, newMemo]);
                        setIsNewMemo(true);
                        changeSelectedMemo(newMemo);
                    }}>
                        <img src={addIcon} alt="" />
                    </button>
                    <button className='delete-button' onClick={() => { deleteMemo(); }}>
                        <img src={delIcon} alt="" />
                    </button>
                </div>
            </div>

            {/* 가로 스크롤뷰 */}
            <div className='memo-list-scrollview'>
                {memoList && memoList.length > 0 && (
                    [...memoList].reverse().map((memo) => (
                        <MemoComponent
                            key={memo.memoId}
                            memo={memo}
                            selectedMemo={selectedMemo}
                            changeSelectedMemo={changeSelectedMemo}
                        />
                    ))
                )}
            </div>

            {/* 메모 본문 */}
            {(selectedMemo != null && memoList.length > 0) && <div className='memo-view'>
                <input type='text' className='memo-title' placeholder='제목'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} />
                <textarea type='' className='memo-content-text' placeholder='본문'
                    value={content}
                    onChange={(e) => setContent(e.target.value)} />
                <button className="memo-bookmark" onClick={() => { setIsImportant(!isImportant); addBookmark(); }}>
                    <img src={isImportant ? bookmarkFill : bookmarkEmpty} alt="" />
                </button>
                <button className="memo-save-button" onClick={() => saveMemo()}>
                    저장
                </button>
            </div>}
        </div >
    )
}