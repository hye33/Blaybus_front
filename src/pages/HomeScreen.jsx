import React, { useEffect, useState } from 'react'
import ModelSelectComponent from '../components/study/ModelSelectComponent'
import { getUUID } from '../uuid';
import axios from 'axios';

export const modelList = [
    {
        assetId: 'suspension',
        assetName: 'Suspension'
    },
    {
        assetId: 'robot-gripper',
        assetName: 'Robot Gripper'
    },
    {
        assetId: 1,
        assetName: 'Drone'
    },
    {
        assetId: 'leaf-spring',
        assetName: 'Leaf Spring'
    },
    {
        assetId: 'machine-vice',
        assetName: 'Machine Vice'
    },
    {
        assetId: 'robot-arm',
        assetName: 'Robot Arm'
    },
    {
        assetId: 'V4-engine',
        assetName: 'V4 Engine'
    },
]

export default function HomeScreen({ setSelectedModel, setTab }) {
    const [assets, setAssets] = useState([]);
    const uuid = getUUID();

    useEffect(() => {
        const getAssets = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/assets`, {
                    headers: {
                        'X-USER-UUID': uuid,
                    },
                });
                setAssets(response.data);
                console.log(response)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        getAssets();
    }, []);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',

            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(2, 2fr) 1fr',
            gap: '50px 50px',
            padding: 70,

            border: '1px solid var(--green-main)',
            boxShadow: 'var(--green-box-shadow)',
            borderRadius: 10,
        }}>
            {assets.filter((model) => model.assetId != 4).map((model) => (
                <ModelSelectComponent
                    key={model.assetId}
                    label={model.assetName}
                    thumbnailUrl={model.assetThumbnailUrl}
                    onClick={() => { setSelectedModel(model); setTab(2) }}
                />
            ))}
        </div>
    )
}
