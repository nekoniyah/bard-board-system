import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] animate-in fade-in duration-200"
      onClick={onCancel}
    >
      <div
        className="bg-black/80 backdrop-blur-xl border border-gray-600 rounded-2xl p-8 max-w-md w-[90%] relative shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-amber-600/20 border border-amber-500/50 mx-auto mb-6">
          <AlertTriangle size={40} className="text-white" />
        </div>

        <h2 className="text-white text-2xl font-semibold text-center mb-4">
          Modifications non sauvegardées
        </h2>

        <p className="text-gray-300 text-center leading-relaxed mb-8">
          Vous avez des modifications non sauvegardées qui seront perdues si
          vous quittez maintenant. Êtes-vous sûr de vouloir continuer ?
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg font-medium hover:bg-gray-600 hover:text-white hover:border-gray-500 transition-all duration-200 min-w-[120px]"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600/80 backdrop-blur text-white rounded-lg font-medium hover:bg-red-700/80 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 active:translate-y-0 transition-all duration-200 min-w-[120px]"
          >
            Quitter sans sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesModal;
