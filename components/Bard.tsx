import { MouseEvent, useState } from "react";
import styled from "styled-components";
type StepPoint = { name: string; x: number; y: number; linkedTo?: string[] };
type GridBox = { name: string; x: number; y: number; type: string };
type Grid = { height: number; width: number; boxes: GridBox[] };

type BardConfig<T extends "grid" | "steps"> = {
    boxSize?: number;
    type: T | "grid" | "steps";
    data: T extends "steps" ? StepPoint[] : Grid;
    image: string;
};

function Bard<T extends "grid" | "steps">({
    config,
    on,
}: {
    config: BardConfig<T>;
    on: (eventName: string, ...args: any[]) => void;
}) {
    const listeners = [];

    const emit = (eventName: string, ...args: any[]) => {
        on(eventName, ...args);
        listeners.forEach((listener) => listener(eventName, ...args));
    };

    const addListener = (
        listener: (eventName: string, ...args: any[]) => void
    ) => {
        listeners.push(listener);
    };

    const [mode, setMode] = useState<"draw" | "link" | "drag" | "none">("none");
    const [points, setPoints] = useState<StepPoint[]>([]);
    const [grid, setGrid] = useState<Grid>({
        height: 0,
        width: 0,
        boxes: [],
    });

    const [mousePercent, setMousePercent] = useState({ x: 0, y: 0 });

    function mousemove(ev: MouseEvent<HTMLDivElement>) {
        const rect = (ev.target as HTMLDivElement).getBoundingClientRect();
        const x = ((ev.pageX - rect.left) / rect.width) * 100;
        const y = ((ev.pageY - rect.top) / rect.height) * 100;

        emit("mousemove", {
            percentage: { x, y },
            pixel: { x: ev.clientX, y: ev.clientY },
        });

        setMousePercent({ x: x * 100, y: y * 100 });
    }

    function pointClick(ev: MouseEvent<HTMLDivElement>) {
        emit("click", ev);
    }

    function boxClick(ev: MouseEvent<HTMLDivElement>) {
        emit("click", ev);
    }

    const [links, setLinks] = useState<{ from: string; to: string }[]>([]);

    switch (config.type) {
        case "grid":
            setGrid(config.data as Grid);
            break;
        case "steps":
            setPoints(config.data as StepPoint[]);

            points.forEach((point) => {
                if (point.linkedTo) {
                    point.linkedTo.forEach((linkedTo) => {
                        setLinks([
                            ...links,
                            { from: point.name, to: linkedTo },
                        ]);
                    });
                }
            });
            break;
        default:
            break;
    }

    let MainDiv = styled.div`
        position: relative;
        background-image: url("${config.image}");
        background-size: contain;
        background-position: center center;
        background-repeat: no-repeat;
        width: 100%;
        height: 100%;
    `;

    function generateGridElements() {
        if (config.type !== "grid") return [];
        let elements: any[] = [];
        let c = config.data as Grid;

        for (let i = 0; i < c.height; i++) {
            let Column = styled.div`
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0;
            `;

            let rows: any[] = [];

            for (let j = 0; j < c.width; j++) {
                const box = c.boxes.find((box) => box.name === `${i}-${j}`);

                if (box) {
                    const Row = styled.div`
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: center;
                        width: ${config.boxSize}px;
                        height: ${config.boxSize}px;
                        gap: 0;
                    `;

                    rows.push(<Row key={j} id={box.name}></Row>);
                }
            }

            elements.push(<Column>{rows.map((Row) => Row)}</Column>);
        }

        return elements;
    }

    return (
        <MainDiv onMouseMove={mousemove}>
            {config.type === "steps" &&
                points.map((point) => (
                    <div
                        key={point.name}
                        style={{
                            position: "absolute",
                            width: `${config.boxSize}px`,
                            height: `${config.boxSize}px`,
                            left: `calc(${point.x}% - ${config.boxSize / 2}px)`,
                            top: `calc(${point.y}% - ${config.boxSize / 2}px)`,
                            borderRadius: "50%",
                            zIndex: 3,
                            cursor: "pointer",
                        }}
                        id={point.name}
                        onClick={(ev) => pointClick(ev)}
                    ></div>
                ))}
            {config.type === "grid" && (
                <div id="grid">
                    {generateGridElements().map((El, index) => (
                        <El key={index} onClick={(ev) => boxClick(ev)} />
                    ))}
                </div>
            )}
        </MainDiv>
    );
}

export default Bard;

export { Bard };

export type { BardConfig };

export type { StepPoint, GridBox, Grid };

export type BardMode = "draw" | "link" | "drag" | "none";

export type BardType = "grid" | "steps";
