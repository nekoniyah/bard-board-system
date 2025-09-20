import React from "react";
import board1 from "../stored/steps-1.json";
import Bard from "../components/Bard";
import "./index.scss";
import styled from "styled-components";

let EventP = styled.p`
    margin: 0;
    padding: 0;
    font-size: 12px;
`;

// Generate main App component
export default function App() {
    const [logs, setLogs] = React.useState<string[]>([]);

    function on(eventName: string, ev) {
        switch (eventName) {
            case "click":
                setLogs((l) => [...l, `click ${ev.target.id}`]);
                break;
        }
    }

    return (
        <div id="main">
            <div id="events">
                {logs.map((l, i) => (
                    <EventP key={i}>{l}</EventP>
                ))}
            </div>
            <Bard
                config={{
                    data: board1,
                    type: "steps",
                    boxSize: 50,
                    image: "/images/board.png",
                }}
                on={on}
            ></Bard>
        </div>
    );
}
