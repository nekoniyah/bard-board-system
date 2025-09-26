import React from "react";
import { ZoomIn, ZoomOut, Maximize2, Menu } from "lucide-react";
import { cn } from "../../lib/utils";

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onOpenSidebar: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onOpenSidebar,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-dark-100/40 backdrop-blur-20 border-b border-white/8 z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSidebar}
          className={cn(
            "hidden w-10 h-10 items-center justify-center",
            "bg-white/5 border border-white/10 rounded-lg",
            "text-white/80 cursor-pointer transition-all duration-200",
            "hover:bg-white/10 hover:border-white/20 hover:text-white",
            "md:hidden md:flex"
          )}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/3 border border-white/10 rounded-[10px]">
        <button
          onClick={onZoomOut}
          title="Zoom arrière (-)"
          className={cn(
            "w-8 h-8 flex items-center justify-center",
            "bg-transparent border-none text-white/60 cursor-pointer transition-all duration-200",
            "hover:text-white hover:bg-white/5 hover:rounded-md"
          )}
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-white/80 text-[13px] font-medium min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          title="Zoom avant (+)"
          className={cn(
            "w-8 h-8 flex items-center justify-center",
            "bg-transparent border-none text-white/60 cursor-pointer transition-all duration-200",
            "hover:text-white hover:bg-white/5 hover:rounded-md"
          )}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomReset}
          title="Réinitialiser (0)"
          className={cn(
            "w-8 h-8 flex items-center justify-center",
            "bg-transparent border-none text-white/60 cursor-pointer transition-all duration-200",
            "hover:text-white hover:bg-white/5 hover:rounded-md"
          )}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
