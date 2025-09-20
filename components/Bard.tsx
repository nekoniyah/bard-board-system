import React, { Component } from "react";
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

type BardProps<T extends "grid" | "steps"> = {
    config: BardConfig<T>;
    on: (eventName: string, ...args: any[]) => void;
};

type BardState = {
    mode: "draw" | "link" | "drag" | "none";
    points: StepPoint[];
    grid: Grid;
    mousePercent: { x: number; y: number };
    links: { from: string; to: string }[];
};

export class Bard<T extends "grid" | "steps"> extends Component<
    BardProps<T>,
    BardState
> {
    private listeners: ((eventName: string, ...args: any[]) => void)[] = [];

    constructor(props: BardProps<T>) {
        super(props);

        this.state = {
            mode: "none",
            points: [],
            grid: {
                height: 0,
                width: 0,
                boxes: [],
            },
            mousePercent: { x: 0, y: 0 },
            links: [],
        };

        this.mousemove = this.mousemove.bind(this);
        this.pointClick = this.pointClick.bind(this);
        this.boxClick = this.boxClick.bind(this);
    }

    emit(eventName: string, ...args: any[]) {
        this.props.on(eventName, ...args);
        this.listeners.forEach((listener) => listener(eventName, ...args));
    }

    addListener(listener: (eventName: string, ...args: any[]) => void) {
        this.listeners.push(listener);
    }

    componentDidMount() {
        this.updateFromConfig();
    }

    componentDidUpdate(prevProps: BardProps<T>) {
        if (prevProps.config !== this.props.config) {
            this.updateFromConfig();
        }
    }

    updateFromConfig() {
        const { config } = this.props;

        if (config.type === "grid") {
            this.setState({ grid: config.data as Grid });
        } else if (config.type === "steps") {
            const points = config.data as StepPoint[];
            const links: { from: string; to: string }[] = [];

            points.forEach((point) => {
                if (point.linkedTo) {
                    point.linkedTo.forEach((linkedTo) => {
                        links.push({ from: point.name, to: linkedTo });
                    });
                }
            });

            this.setState({ points, links });
        }
    }

    mousemove(ev: MouseEvent<HTMLDivElement>) {
        const rect = (ev.target as HTMLDivElement).getBoundingClientRect();
        const x = ((ev.pageX - rect.left) / rect.width) * 100;
        const y = ((ev.pageY - rect.top) / rect.height) * 100;

        this.emit("mousemove", {
            percentage: { x, y },
            pixel: { x: ev.clientX, y: ev.clientY },
        });

        this.setState({ mousePercent: { x: x * 100, y: y * 100 } });
    }

    pointClick(ev: MouseEvent<HTMLDivElement>) {
        this.emit("click", ev);
    }

    boxClick(ev: MouseEvent<HTMLDivElement>) {
        this.emit("click", ev);
    }

    generateGridElements() {
        const { config } = this.props;
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

            elements.push(<Column key={i}>{rows}</Column>);
        }

        return elements;
    }

    render() {
        const { config } = this.props;
        const { points } = this.state;

        let MainDiv = styled.div`
            position: relative;
            background-image: url("${config.image}");
            background-size: contain;
            background-position: center center;
            background-repeat: no-repeat;
            width: 100%;
            height: 100%;
        `;

        return (
            <MainDiv onMouseMove={this.mousemove}>
                {config.type === "steps" &&
                    points.map((point) => (
                        <div
                            key={point.name}
                            style={{
                                position: "absolute",
                                width: `${config.boxSize}px`,
                                height: `${config.boxSize}px`,
                                left: `calc(${point.x}% - ${
                                    config.boxSize / 2
                                }px)`,
                                top: `calc(${point.y}% - ${
                                    config.boxSize / 2
                                }px)`,
                                borderRadius: "50%",
                                zIndex: 3,
                                cursor: "pointer",
                            }}
                            id={point.name}
                            onClick={(ev) => this.pointClick(ev)}
                        ></div>
                    ))}
                {config.type === "grid" && (
                    <div id="grid">
                        {this.generateGridElements().map((El, index) => (
                            <El
                                key={index}
                                onClick={(ev: any) => this.boxClick(ev)}
                            />
                        ))}
                    </div>
                )}
            </MainDiv>
        );
    }
}

export default Bard;

export type { BardConfig };

export type { StepPoint, GridBox, Grid };

export type BardMode = "draw" | "link" | "drag" | "none";

export type BardType = "grid" | "steps";
