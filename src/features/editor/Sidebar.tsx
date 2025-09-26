import React from "react";
import styled from "styled-components";
import {
  ArrowLeft,
  Download,
  Trash2,
  Link,
  Eye,
  EyeOff,
  Move,
  Plus,
  Keyboard,
  Code2,
  X,
} from "lucide-react";
import { StepPoint, EditorMode } from "./types";
import { cn } from "../../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  steps: StepPoint[];
  selectedStep: string | null;
  onSelectStep: (name: string) => void;
  onDeleteStep: (name: string) => void;
  onClearAll: () => void;
  onShowJsonPreview: () => void;
  onExport: () => void;
  onShowShortcuts: () => void;
}

const SidebarContainer = styled.div<{ isOpen?: boolean }>`
  width: 320px;
  background: rgba(10, 10, 10, 0.6);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease;
  z-index: 200;

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    transform: ${(props) =>
      props.isOpen ? "translateX(0)" : "translateX(-100%)"};
    width: 100%;
    max-width: 100%;
  }
`;

const SidebarHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
`;

const MobileCloseButton = styled.button`
  display: none;
  position: absolute;
  top: 24px;
  right: 24px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 201;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
  }

  svg {
    width: 18px;
    height: 18px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  margin-bottom: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

    svg {
      transform: translateX(-2px);
    }
  }

  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s;
  }
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 16px 0;
`;

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const ToolButton = styled.button<{ active?: boolean }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  background: ${(props) =>
    props.active
      ? "linear-gradient(135deg, rgba(76, 110, 245, 0.3) 0%, rgba(76, 110, 245, 0.2) 100%)"
      : "rgba(255, 255, 255, 0.03)"};
  border: 1px solid
    ${(props) =>
      props.active ? "rgba(76, 110, 245, 0.5)" : "rgba(255, 255, 255, 0.1)"};
  border-radius: 10px;
  color: ${(props) => (props.active ? "#ffffff" : "rgba(255, 255, 255, 0.7)")};
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${(props) =>
      props.active
        ? "linear-gradient(135deg, rgba(76, 110, 245, 0.4) 0%, rgba(76, 110, 245, 0.3) 100%)"
        : "rgba(255, 255, 255, 0.06)"};
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StepItem = styled.div<{ isLinked?: boolean; isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: ${(props) =>
    props.isSelected
      ? "linear-gradient(135deg, rgba(76, 110, 245, 0.2) 0%, rgba(76, 110, 245, 0.1) 100%)"
      : "rgba(255, 255, 255, 0.03)"};
  border: 1px solid
    ${(props) =>
      props.isSelected
        ? "rgba(76, 110, 245, 0.5)"
        : "rgba(255, 255, 255, 0.1)"};
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${(props) =>
      props.isSelected
        ? "linear-gradient(135deg, rgba(76, 110, 245, 0.3) 0%, rgba(76, 110, 245, 0.2) 100%)"
        : "rgba(255, 255, 255, 0.05)"};
  }
`;

const StepInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const StepDot = styled.div<{ isLinked?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.isLinked ? "#4c6ef5" : "#dc2626")};
  box-shadow: 0 0 8px
    ${(props) =>
      props.isLinked ? "rgba(76, 110, 245, 0.5)" : "rgba(220, 38, 38, 0.5)"};
`;

const StepName = styled.span`
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
`;

const StepCoords = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
`;

const StepActionButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const StatItem = styled.div`
  flex: 1;
  text-align: center;
`;

const StatValue = styled.div`
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
`;

const ActionsContainer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: "primary" | "danger" }>`
  width: 100%;
  padding: 12px 20px;
  background: ${(props) =>
    props.variant === "primary"
      ? "linear-gradient(135deg, rgba(76, 110, 245, 0.8) 0%, rgba(76, 110, 245, 0.6) 100%)"
      : "rgba(255, 255, 255, 0.03)"};
  border: 1px solid
    ${(props) =>
      props.variant === "primary"
        ? "rgba(76, 110, 245, 0.5)"
        : "rgba(255, 255, 255, 0.1)"};
  border-radius: 10px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${(props) =>
      props.variant === "primary"
        ? "linear-gradient(135deg, rgba(76, 110, 245, 0.9) 0%, rgba(76, 110, 245, 0.7) 100%)"
        : "rgba(255, 255, 255, 0.06)"};
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onBack,
  mode,
  onModeChange,
  showLabels,
  onToggleLabels,
  steps,
  selectedStep,
  onSelectStep,
  onDeleteStep,
  onClearAll,
  onShowJsonPreview,
  onExport,
  onShowShortcuts,
}) => {
  return (
    <SidebarContainer isOpen={isOpen}>
      <div className="p-6 border-b border-white/8 relative">
        <MobileCloseButton onClick={onClose}>
          <X />
        </MobileCloseButton>
        <BackButton onClick={onBack}>
          <ArrowLeft />
          Retour
        </BackButton>
        <h2 className="text-white text-xl font-semibold m-0 tracking-tight">Éditeur de Plateau</h2>
      </div>

      <SidebarContent>
        <Section>
          <h3 className="text-white/40 text-[11px] font-semibold uppercase tracking-wider m-0 mb-4">Outils</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <ToolButton
              active={mode === "draw"}
              onClick={() => onModeChange("draw")}
              title="Ajouter des cases (D)"
            >
              <Plus />
              Ajouter
            </ToolButton>
            <ToolButton
              active={mode === "link"}
              onClick={() => onModeChange("link")}
              title="Lier des cases (L)"
            >
              <Link />
              Lier
            </ToolButton>
            <ToolButton
              active={mode === "drag"}
              onClick={() => onModeChange("drag")}
              title="Déplacer (V)"
            >
              <Move />
              Déplacer
            </ToolButton>
          </div>

          <ToolButton onClick={onClearAll} title="Supprimer toutes les cases">
            <Trash2 />
            Supprimer tout
          </ToolButton>
        </Section>

        <Section>
          <h3 className="text-white/40 text-[11px] font-semibold uppercase tracking-wider m-0 mb-4">Affichage</h3>
          <ToolButton
            active={showLabels}
            onClick={onToggleLabels}
            title="Afficher/Masquer les labels (H)"
          >
            {showLabels ? <Eye /> : <EyeOff />}
            {showLabels ? "Masquer" : "Afficher"} les labels
          </ToolButton>
        </Section>

        <Section>
          <h3 className="text-white/40 text-[11px] font-semibold uppercase tracking-wider m-0 mb-4">Cases placées</h3>
          <StepsList>
            {steps.map((step) => (
              <StepItem
                key={step.name}
                isLinked={step.linkedTo && step.linkedTo.length > 0}
                isSelected={selectedStep === step.name}
                onClick={() => onSelectStep(step.name)}
              >
                <StepInfo>
                  <StepDot
                    isLinked={step.linkedTo && step.linkedTo.length > 0}
                  />
                  <StepName>{step.name}</StepName>
                  <StepCoords>
                    ({step.x.toFixed(0)}, {step.y.toFixed(0)})
                  </StepCoords>
                </StepInfo>
                <StepActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteStep(step.name);
                  }}
                >
                  <Trash2 />
                </StepActionButton>
              </StepItem>
            ))}
          </StepsList>

          {steps.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 16px",
                color: "rgba(255, 255, 255, 0.3)",
                fontSize: "13px",
              }}
            >
              Aucune case placée.
              <br />
              Cliquez sur le plateau pour commencer.
            </div>
          )}
        </Section>

        <Section>
          <StatsContainer>
            <StatItem>
              <StatValue>{steps.length}</StatValue>
              <StatLabel>Cases</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>
                {steps.reduce(
                  (acc, step) => acc + (step.linkedTo?.length || 0),
                  0
                )}
              </StatValue>
              <StatLabel>Liens</StatLabel>
            </StatItem>
          </StatsContainer>
        </Section>
      </SidebarContent>

      <ActionsContainer>
        <ActionButton onClick={onShowJsonPreview}>
          <Code2 />
          Aperçu JSON
        </ActionButton>
        <ActionButton variant="primary" onClick={onExport}>
          <Download />
          Exporter JSON
        </ActionButton>
        <ActionButton onClick={onShowShortcuts}>
          <Keyboard />
          Raccourcis
        </ActionButton>
      </ActionsContainer>
    </SidebarContainer>
  );
};

export default Sidebar;
