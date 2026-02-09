import React, { useEffect, useState } from 'react'
import PartSelectComponent from './PartSelectComponent';
import { getUUID } from '../../uuid'
import axios from 'axios'

export const modelList = [
    {
        id: 'suspension',
        label: 'Suspension'
    },
    {
        id: 'robot-gripper',
        label: 'Robot Gripper'
    },
    {
        id: 'drone',
        label: 'Drone'
    },
    {
        id: 'leaf-spring',
        label: 'Leaf Spring'
    },
    {
        id: 'machine-vice',
        label: 'Machine Vice'
    },
    {
        id: 'robot-arm',
        label: 'Robot Arm'
    },
    {
        id: 'V4-engine',
        label: 'V4 Engine'
    },
]

export default function SingleSelectedViewer({ selectedModel, setSelectedPart, setIsSelected }) {
    const [parts, setParts] = useState([]);
    const uuid = getUUID();

    useEffect(() => {
        const getParts = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/assets/${selectedModel.assetId}/parts`);
                setParts(response.data);
                console.log(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        getParts();
    }, []);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',

            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '35px 50px',
            padding: 60,
            paddingTop: 110,
        }}>
            {parts.map((model) => (
                <PartSelectComponent
                    key={model.partId}
                    label={model.partName}
                    thumbnailUrl={model.partThumbnailUrl}
                    onClick={() => { setSelectedPart(model); setIsSelected(true);}}
                />
            ))}
        </div>
    )
}