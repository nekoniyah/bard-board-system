import React from 'react';
import Uploader from '../features/upload/Uploader';
import MouseGlowBackground from '../components/MouseGlowBackground';

interface UploaderPageProps {
    onImageUpload: (imageUrl: string) => void;
}

const UploaderPage: React.FC<UploaderPageProps> = ({ onImageUpload }) => {
    return (
        <MouseGlowBackground>
            <div className="min-h-screen flex items-center justify-center p-4">
                <Uploader onImageUpload={onImageUpload} />
            </div>
        </MouseGlowBackground>
    );
};

export default UploaderPage;