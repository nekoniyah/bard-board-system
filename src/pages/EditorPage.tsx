import React from 'react';
import Editor from '../features/editor';
import MouseGlowBackground from '../components/MouseGlowBackground';

interface EditorPageProps {
    imageUrl: string;
    onBack: () => void;
    onSave?: (data: any) => void;
}

const EditorPage: React.FC<EditorPageProps> = ({ imageUrl, onBack, onSave }) => {
    return (
        <MouseGlowBackground glowColor="80, 80, 80" glowIntensity={0.1}>
            <Editor
                imageUrl={imageUrl}
                onBack={onBack}
                onSave={onSave}
            />
        </MouseGlowBackground>
    );
};

export default EditorPage;