<<<<<<< Updated upstream
import React from "react";
import board1 from "../stored/steps-1.json";
import Bard from "../components/Bordo";
=======
import React, { useState } from "react";
import Uploader from "../components/Uploader";
import Editor from "../components/Editor";
>>>>>>> Stashed changes
import "./index.scss";

export default function App() {
    const [currentStep, setCurrentStep] = useState<"upload" | "edit">("upload");
    const [imageUrl, setImageUrl] = useState<string>("");
    const [savedData, setSavedData] = useState<any>(null);


    const handleImageUpload = (uploadedImageUrl: string) => {
        setImageUrl(uploadedImageUrl);
        setCurrentStep("edit");
    };

    const handleBack = () => {
        setCurrentStep("upload");
        setImageUrl("");
    };

    return (
        <div className="app-main">
            {currentStep === "upload" ? (
                <Uploader onImageUpload={handleImageUpload} />
            ) : (
                <Editor
                    imageUrl={imageUrl}
                    onBack={handleBack}
                    onSave={(data) => {
                        setSavedData(data);
                    }}
                />
            )}
        </div>
    );
}
