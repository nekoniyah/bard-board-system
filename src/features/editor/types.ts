export interface StepPoint {
    name: string;
    x: number;
    y: number;
    size?: number;
    linkedTo?: string[];
}

export type EditorMode = 'draw' | 'link' | 'drag' | 'none';