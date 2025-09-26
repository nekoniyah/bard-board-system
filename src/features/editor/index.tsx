import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import { JsonPreviewModal, ShortcutsModal } from "./Modals";
import UnsavedChangesModal from "./UnsavedChangesModal";
import { StepPoint, EditorMode } from "./types";
import { generateRandomId } from "./utils";

interface EditorProps {
    imageUrl: string;
    onBack: () => void;
    onSave?: (data: StepPoint[]) => void;
}

const Editor: React.FC<EditorProps> = ({ imageUrl, onBack, onSave }) => {
    // déinitions des états
    const [steps, setSteps] = useState<StepPoint[]>([]);
    const [mode, setMode] = useState<EditorMode>('draw');
    const [selectedStep, setSelectedStep] = useState<string | null>(null);
    const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
    const [showLabels, setShowLabels] = useState(true);

    // config zoom
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // fenêtres modales
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showJsonPreview, setShowJsonPreview] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // état copier-coller
    const [copiedStep, setCopiedStep] = useState<StepPoint | null>(null);

    // prévisualisation json
    const [previewSize, setPreviewSize] = useState(40);

    // détection des changements
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastExportedSteps, setLastExportedSteps] = useState<string>("");
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

    // suivi des modifs
    useEffect(() => {
        const currentStepsStr = JSON.stringify(steps);
        const hasChanges = steps.length > 0 && currentStepsStr !== lastExportedSteps;
        setHasUnsavedChanges(hasChanges);
    }, [steps, lastExportedSteps]);

    // raccourcis clavier
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
                setMode('draw');
            } else if (e.key === 'l' && !e.ctrlKey && !e.metaKey) {
                setMode('link');
            } else if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
                setMode('drag');
            } else if (e.key === 'Escape') {
                setMode('none');
                setLinkingFrom(null);
                setSelectedStep(null);
            }

            // gestion actions
            if (e.key === 'Delete' && selectedStep) {
                handleDeleteStep(selectedStep);
            } else if (e.key === 'h') {
                setShowLabels(!showLabels);
            } else if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedStep) {
                const step = steps.find(s => s.name === selectedStep);
                if (step) setCopiedStep(step);
            } else if (e.key === 'v' && (e.ctrlKey || e.metaKey) && copiedStep) {
                handlePasteStep();
            } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
                setShowShortcuts(true);
            }

            // zoom alt+touches
            if ((e.key === '=' || e.key === '+') && e.altKey) {
                e.preventDefault();
                handleZoomIn();
            } else if ((e.key === '-' || e.key === '_') && e.altKey) {
                e.preventDefault();
                handleZoomOut();
            } else if (e.key === '0' && !e.altKey) {
                e.preventDefault();
                handleZoomReset();
            }

            if (mode === 'draw' && !e.altKey) {
                if (e.key === '+' || e.key === '=') {
                    setPreviewSize(prev => Math.min(100, prev + 5));
                } else if (e.key === '-' || e.key === '_') {
                    setPreviewSize(prev => Math.max(20, prev - 5));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedStep, showLabels, copiedStep, steps, mode]);

    // gestion des steps
    const handleAddStep = (x: number, y: number) => {
        const newStep: StepPoint = {
            name: generateRandomId(),
            x,
            y,
            size: previewSize,
            linkedTo: []
        };
        setSteps([...steps, newStep]);
        setSelectedStep(newStep.name);
    };

    const handleDeleteStep = (stepName: string) => {
        setSteps(prevSteps => {
            const newSteps = prevSteps.filter(s => s.name !== stepName);
            return newSteps.map(step => ({
                ...step,
                linkedTo: step.linkedTo?.filter(link => link !== stepName)
            }));
        });
        setSelectedStep(null);
    };

    const handleUpdateStep = (stepName: string, updates: Partial<StepPoint>) => {
        setSteps(prevSteps => prevSteps.map(step =>
            step.name === stepName ? { ...step, ...updates } : step
        ));
    };

    const handleLinkSteps = (from: string, to: string) => {
        setSteps(prevSteps => prevSteps.map(step => {
            if (step.name === from) {
                const linkedTo = step.linkedTo || [];
                if (!linkedTo.includes(to)) {
                    return { ...step, linkedTo: [...linkedTo, to] };
                }
            }
            return step;
        }));
    };

    const handleClearAll = () => {
        if (window.confirm('Êtes-vous sûr de vouloir tout effacer ?')) {
            setSteps([]);
            setSelectedStep(null);
            setLinkingFrom(null);
        }
    };

    const handlePasteStep = () => {
        if (!copiedStep) return;
        const newStep: StepPoint = {
            ...copiedStep,
            name: generateRandomId(),
            x: Math.min(copiedStep.x + 5, 95),
            y: Math.min(copiedStep.y + 5, 95)
        };
        setSteps([...steps, newStep]);
        setSelectedStep(newStep.name);
    };

    // export
    const handleExport = () => {
        const dataStr = JSON.stringify(steps, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'board-steps.json';
        link.click();
        URL.revokeObjectURL(url);

        // marquer sauvegardé
        setLastExportedSteps(JSON.stringify(steps));
        setHasUnsavedChanges(false);

        if (onSave) {
            onSave(steps);
        }
    };

    // bouton retour avec vérif
    const handleBackClick = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedChangesModal(true);
        } else {
            onBack();
        }
    };

    // confirmer sortie
    const handleConfirmExit = () => {
        setShowUnsavedChangesModal(false);
        onBack();
    };

    // annuler sortie
    const handleCancelExit = () => {
        setShowUnsavedChangesModal(false);
    };

    // zoom
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    return (
        <div className="flex h-screen overflow-hidden relative">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onBack={handleBackClick}
                mode={mode}
                onModeChange={setMode}
                showLabels={showLabels}
                onToggleLabels={() => setShowLabels(!showLabels)}
                steps={steps}
                selectedStep={selectedStep}
                onSelectStep={setSelectedStep}
                onDeleteStep={handleDeleteStep}
                onClearAll={handleClearAll}
                onShowJsonPreview={() => setShowJsonPreview(true)}
                onExport={handleExport}
                onShowShortcuts={() => setShowShortcuts(true)}
            />

            <div className="flex-1 flex flex-col relative overflow-hidden">
                <Toolbar
                    zoom={zoom}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={handleZoomReset}
                    onOpenSidebar={() => setSidebarOpen(true)}
                />

                <Canvas
                    imageUrl={imageUrl}
                    steps={steps}
                    mode={mode}
                    selectedStep={selectedStep}
                    linkingFrom={linkingFrom}
                    showLabels={showLabels}
                    zoom={zoom}
                    pan={pan}
                    previewSize={previewSize}
                    onAddStep={handleAddStep}
                    onUpdateStep={handleUpdateStep}
                    onSelectStep={setSelectedStep}
                    onLinkSteps={handleLinkSteps}
                    onSetLinkingFrom={setLinkingFrom}
                    onPanChange={setPan}
                    onPreviewSizeChange={setPreviewSize}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onZoomReset={handleZoomReset}
                />
            </div>

            <JsonPreviewModal
                visible={showJsonPreview}
                data={steps}
                onClose={() => setShowJsonPreview(false)}
            />

            <ShortcutsModal
                visible={showShortcuts}
                onClose={() => setShowShortcuts(false)}
            />

            <UnsavedChangesModal
                isOpen={showUnsavedChangesModal}
                onConfirm={handleConfirmExit}
                onCancel={handleCancelExit}
            />
        </div>
    );
};

export default Editor;