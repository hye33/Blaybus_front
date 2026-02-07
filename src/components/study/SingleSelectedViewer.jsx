import React from 'react'
import PartSelectComponent from './PartSelectComponent';

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

export default function SingleSelectedViewer({ setSelectedPart, setIsSelected }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',

            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '35px 50px',
            padding: 60,
            paddingTop: 110,
        }}>
            {modelList.map((model) => (
                <PartSelectComponent
                    key={model.id}
                    label={model.label}
                    onClick={() => {setSelectedPart(model.id); setIsSelected(true);}}
                />
            ))}
        </div>
    )
}