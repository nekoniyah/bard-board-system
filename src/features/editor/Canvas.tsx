import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import { StepPoint, EditorMode } from "./types";

interface CanvasProps {
  imageUrl: string;
  steps: StepPoint[];
  mode: EditorMode;
  selectedStep: string | null;
  linkingFrom: string | null;
  showLabels: boolean;
  zoom: number;
  pan: { x: number; y: number };
  previewSize: number;
  onAddStep: (x: number, y: number) => void;
  onUpdateStep: (stepName: string, updates: Partial<StepPoint>) => void;
  onSelectStep: (stepName: string) => void;
  onLinkSteps: (from: string, to: string) => void;
  onSetLinkingFrom: (stepName: string | null) => void;
  onPanChange: (pan: { x: number; y: number }) => void;
  onPreviewSizeChange: (size: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  cursor: grab;
  outline: none;

  &.grabbing {
    cursor: grabbing !important;
  }

  &.draw-mode {
    cursor: crosshair;
  }

  &.link-mode {
    cursor: pointer;
  }

  &.alt-pressed {
    cursor: grab !important;
  }

  &.alt-pressed.grabbing {
    cursor: grabbing !important;
  }
`;

const CanvasWrapper = styled.div<{ zoom: number; x: number; y: number }>`
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: center center;
  transform: scale(${(props) => props.zoom})
    translate(${(props) => props.x}px, ${(props) => props.y}px);
  transition: transform 0.1s ease-out;
`;

const BoardWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  aspect-ratio: 16 / 10;
`;

const BoardContainer = styled.div<{ mode: string }>`
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.01);
  border: 2px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  cursor: ${(props) =>
    props.mode === "draw"
      ? "crosshair"
      : props.mode === "link"
      ? "pointer"
      : "default"};
`;

const BoardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  -webkit-user-drag: none;
`;

const StepMarker = styled.div<{
  x: number;
  y: number;
  size: number;
  isLinked?: boolean;
  isSelected?: boolean;
  isResizing?: boolean;
  isDragging?: boolean;
}>`
  position: absolute;
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  background: ${(props) =>
    props.isLinked ? "rgba(76, 110, 245, 0.7)" : "rgba(250, 82, 82, 0.7)"};
  border: 3px solid
    ${(props) =>
      props.isSelected ? "#ffffff" : props.isLinked ? "#4c6ef5" : "#fa5252"};
  transform: translate(-50%, -50%)
    ${(props) => (props.isDragging ? "scale(1.1)" : "scale(1)")};
  cursor: ${(props) =>
    props.isResizing ? "nwse-resize" : props.isDragging ? "move" : "pointer"};
  transition: ${(props) =>
    props.isResizing || props.isDragging
      ? "none"
      : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"};
  box-shadow: ${(props) =>
    props.isSelected
      ? "0 0 0 4px rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.4)"
      : "0 2px 8px rgba(0, 0, 0, 0.3)"};
  z-index: ${(props) => (props.isSelected ? 10 : 5)};

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    z-index: 11;
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 2px solid #4c6ef5;
  border-radius: 50%;
  cursor: nwse-resize;
  opacity: 0;
  transition: opacity 0.2s;

  ${StepMarker}:hover & {
    opacity: 1;
  }
`;

const StepLabel = styled.div<{ visible?: boolean }>`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: none;
  transition: opacity 0.2s;
`;

const PreviewMarker = styled.div<{ x: number; y: number; size: number }>`
  position: absolute;
  left: ${(props) => props.x}%;
  top: ${(props) => props.y}%;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: 50%;
  background: rgba(76, 110, 245, 0.3);
  border: 2px dashed rgba(76, 110, 245, 0.8);
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 20;

  &::after {
    content: "${(props) => props.size}px";
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(76, 110, 245, 0.5);
    border-radius: 4px;
    color: #79c0ff;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
`;

const LinkLine = styled.line`
  stroke: rgba(76, 110, 245, 0.5);
  stroke-width: 2;
  stroke-dasharray: 5, 5;
  animation: dash 20s linear infinite;

  @keyframes dash {
    to {
      stroke-dashoffset: -100;
    }
  }
`;

const Canvas: React.FC<CanvasProps> = ({
  imageUrl,
  steps,
  mode,
  selectedStep,
  linkingFrom,
  showLabels,
  zoom,
  pan,
  previewSize,
  onAddStep,
  onUpdateStep,
  onSelectStep,
  onLinkSteps,
  onSetLinkingFrom,
  onPanChange,
  onPreviewSizeChange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const isPanning = useRef(false);
  const isAltPressed = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef(40);
  const previewPosition = useRef<{ x: number; y: number } | null>(null);

  // raccourci zoom souris
  const handleWheel = (e: WheelEvent) => {
    if (e.altKey) {
      // alt+molette = zoom
      e.preventDefault();
      if (e.deltaY > 0) {
        onZoomOut();
      } else {
        onZoomIn();
      }
    } else if (mode === "draw" && previewPosition.current) {
      // molette en mode dessin = redimensionner
      e.preventDefault();
      const delta = e.deltaY > 0 ? -5 : 5;
      onPreviewSizeChange(Math.max(20, Math.min(100, previewSize + delta)));
    }
  };

  // écoute molette souris
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", handleWheel);
    }
  }, [onZoomIn, onZoomOut, onPreviewSizeChange, mode, previewSize]);

  // gestion alt+glisser
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.altKey) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateCanvasClass();
      e.preventDefault();
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      updateCanvasClass();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      onPanChange({
        x: pan.x + deltaX / zoom,
        y: pan.y + deltaY / zoom,
      });
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // déplacement étape
    if (isDragging.current && selectedStep && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const newX = ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
      const newY = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;

      onUpdateStep(selectedStep, {
        x: Math.max(0, Math.min(100, newX)),
        y: Math.max(0, Math.min(100, newY)),
      });
    } else if (isResizing.current && selectedStep) {
      const deltaX = e.clientX - dragStartPos.current.x;
      const newSize = Math.max(
        20,
        Math.min(100, resizeStartSize.current + deltaX)
      );
      onUpdateStep(selectedStep, { size: newSize });
    }
  };

  const handleMouseUp = () => {
    isPanning.current = false;
    isDragging.current = false;
    isResizing.current = false;

    updateCanvasClass();
  };

  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "draw") return;
    if (
      e.target !== boardRef.current &&
      e.target !== boardRef.current?.querySelector("img")
    )
      return;

    const rect = boardRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onAddStep(x, y);
    previewPosition.current = null;
  };

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode === "draw" && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      previewPosition.current = { x, y };
    }
  };

  const handleBoardMouseLeave = () => {
    previewPosition.current = null;
  };

  const handleStepClick = (stepName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === "link") {
      if (!linkingFrom) {
        onSetLinkingFrom(stepName);
      } else if (linkingFrom !== stepName) {
        onLinkSteps(linkingFrom, stepName);
        onSetLinkingFrom(null);
      }
    } else {
      onSelectStep(stepName);
    }
  };

  const handleStepMouseDown = (stepName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (mode === "drag") {
      const step = steps.find((s) => s.name === stepName);
      if (step) {
        onSelectStep(stepName);
        isDragging.current = true;
        const rect = boardRef.current!.getBoundingClientRect();
        dragStartPos.current = {
          x: e.clientX - (step.x / 100) * rect.width,
          y: e.clientY - (step.y / 100) * rect.height,
        };
      }
    }
  };

  const handleResizeMouseDown = (stepName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const step = steps.find((s) => s.name === stepName);
    if (step) {
      onSelectStep(stepName);
      isResizing.current = true;
      resizeStartSize.current = step.size || 40;
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && !isAltPressed.current) {
        isAltPressed.current = true;
        updateCanvasClass();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey && isAltPressed.current) {
        isAltPressed.current = false;
        updateCanvasClass();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [mode]);

  const updateCanvasClass = () => {
    if (canvasRef.current) {
      canvasRef.current.className = getCanvasClassName();
    }
  };

  const getCanvasClassName = () => {
    const classes = [];

    if (isPanning.current) {
      classes.push("grabbing");
    } else if (mode === "draw" && !isAltPressed.current) {
      classes.push("draw-mode");
    } else if (mode === "link" && !isAltPressed.current) {
      classes.push("link-mode");
    }

    if (isAltPressed.current) {
      classes.push("alt-pressed");
      if (isPanning.current) {
        classes.push("grabbing");
      }
    }

    return classes.join(" ");
  };

  return (
    <CanvasContainer
      ref={canvasRef}
      className={getCanvasClassName()}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CanvasWrapper zoom={zoom} x={pan.x} y={pan.y}>
        <BoardWrapper>
          <BoardContainer
            ref={boardRef}
            mode={mode}
            onClick={handleBoardClick}
            onMouseMove={handleBoardMouseMove}
            onMouseLeave={handleBoardMouseLeave}
          >
            <BoardImage src={imageUrl} alt="Board" />

            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {steps.map((step) => {
                if (step.linkedTo) {
                  return step.linkedTo.map((targetName) => {
                    const target = steps.find((s) => s.name === targetName);
                    if (!target) return null;

                    return (
                      <LinkLine
                        key={`${step.name}-${targetName}`}
                        x1={`${step.x}%`}
                        y1={`${step.y}%`}
                        x2={`${target.x}%`}
                        y2={`${target.y}%`}
                      />
                    );
                  });
                }
                return null;
              })}
            </svg>

            {mode === "draw" && previewPosition.current && (
              <PreviewMarker
                x={previewPosition.current.x}
                y={previewPosition.current.y}
                size={previewSize}
              />
            )}

            {steps.map((step) => (
              <StepMarker
                key={step.name}
                x={step.x}
                y={step.y}
                size={step.size || 40}
                isLinked={step.linkedTo && step.linkedTo.length > 0}
                isSelected={selectedStep === step.name}
                isDragging={isDragging.current && selectedStep === step.name}
                isResizing={isResizing.current && selectedStep === step.name}
                onClick={(e) => handleStepClick(step.name, e)}
                onMouseDown={(e) => handleStepMouseDown(step.name, e)}
              >
                {showLabels && (
                  <StepLabel visible={true}>{step.name}</StepLabel>
                )}
                {selectedStep === step.name && mode === "drag" && (
                  <ResizeHandle
                    onMouseDown={(e) => handleResizeMouseDown(step.name, e)}
                  />
                )}
              </StepMarker>
            ))}
          </BoardContainer>
        </BoardWrapper>
      </CanvasWrapper>
    </CanvasContainer>
  );
};

export default Canvas;
