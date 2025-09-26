import React, { useState } from "react";
import styled from "styled-components";
import { X, Copy, Check, Keyboard } from "lucide-react";
import { StepPoint } from "./types";
import { formatJsonWithSyntax } from "./utils";
import { cn } from "../../lib/utils";

interface JsonPreviewModalProps {
  visible: boolean;
  data: StepPoint[];
  onClose: () => void;
}

interface ShortcutsModalProps {
  visible: boolean;
  onClose: () => void;
}

// Garder seulement JsonCode pour le syntax highlighting

const JsonCode = styled.pre`
  margin: 0;
  font-family: "SF Mono", "Monaco", "Cascadia Code", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #c9d1d9;

  .json-key {
    color: #79c0ff;
  }

  .json-string {
    color: #a5d6ff;
  }

  .json-number {
    color: #ffa657;
  }

  .json-boolean {
    color: #ff7b72;
  }

  .json-null {
    color: #8b949e;
  }

  .json-bracket {
    color: #c9d1d9;
  }

  .json-comma {
    color: #c9d1d9;
  }

  .json-colon {
    color: #c9d1d9;
  }
`;


export const JsonPreviewModal: React.FC<JsonPreviewModalProps> = ({
  visible,
  data,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-1000",
        visible ? "flex" : "hidden"
      )}
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[600px] max-h-[70vh] bg-github-bg/90 backdrop-blur-[16px] border border-white/10 rounded-2xl flex flex-col z-1001 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/30">
          <h3 className="text-white text-lg font-semibold m-0">Aperçu JSON</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopyJson}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2 bg-white/5 border border-white/10 rounded-lg",
                "text-white/80 text-[13px] font-medium cursor-pointer transition-all duration-200",
                "hover:bg-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copié!" : "Copier"}
            </button>
            <button
              onClick={onClose}
              className={cn(
                "w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg",
                "text-white/60 cursor-pointer transition-all duration-200",
                "hover:bg-white/10 hover:text-white"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-github-bg/95 scrollbar-thin">
          <JsonCode
            dangerouslySetInnerHTML={{ __html: formatJsonWithSyntax(data) }}
          />
        </div>
      </div>
    </div>
  );
};

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-1000",
        visible ? "flex" : "hidden"
      )}
      onClick={onClose}
    >
      <div
        className="w-[90%] max-w-[500px] max-h-[70vh] bg-gray-850/90 backdrop-blur-[16px] border border-white/10 rounded-2xl p-6 overflow-y-auto z-1001"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white text-lg font-semibold m-0">Raccourcis clavier</h3>
          <button
            onClick={onClose}
            className={cn(
              "w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg",
              "text-white/60 cursor-pointer transition-all duration-200",
              "hover:bg-white/10 hover:text-white"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Mode liaison</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">L</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Mode déplacement</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">V</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Afficher/Masquer labels</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">H</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Supprimer la case sélectionnée</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Delete</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Copier case sélectionnée</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Ctrl+C</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Coller case copiée</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Ctrl+V</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Zoom avant</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Alt + Molette / +</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Zoom arrière</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Alt + Molette / -</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Réinitialiser zoom</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">0</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Déplacer l'image</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Alt + Glisser</kbd>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-white/3 border border-white/10 rounded-lg">
            <span className="text-white/80 text-sm">Annuler/Quitter</span>
            <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs font-mono font-semibold">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
