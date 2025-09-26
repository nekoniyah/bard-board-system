import React, { useState } from "react";
import UploaderPage from "./pages/UploaderPage";
import EditorPage from "./pages/EditorPage";
import MobileWarning from "./components/MobileWarning";
import "./index.css";

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
        <>
            {/* Afficher MobileWarning sur mobile, sinon le contenu normal */}
            <div className="lg:hidden">
                <MobileWarning />
            </div>
            <div className="hidden lg:block">
                {currentStep === "upload" ? (
                    <UploaderPage onImageUpload={handleImageUpload} />
                ) : (
                    <EditorPage
                        imageUrl={imageUrl}
                        onBack={handleBack}
                        onSave={(data) => {
                            setSavedData(data);
                        }}
                    />
                )}
            </div>
        </>
    );
}
