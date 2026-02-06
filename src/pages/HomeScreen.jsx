import React from 'react'
import ModelSelectComponent from '../components/ModelSelectComponent'

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

export default function HomeScreen({ setSelectedModel, setTab }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',

            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            padding: 10,
        }}>
            {modelList.map((model) => (
                <ModelSelectComponent
                    key={model.id}
                    label={model.label}
                    onClick={() => {setSelectedModel(model.id); setTab(1)}}
                />
            ))}
        </div>
    )
}