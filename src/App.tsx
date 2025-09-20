import React from "react";
import board1 from "../stored/steps-1.json";
import Bard from "../components/Bard";
import "./index.scss";

// Generate main App component
export default function App() {
    function on(eventName: string, ...args: any[]) {}

    return (
        <Bard
            config={{
                data: board1,
                type: "steps",
                boxSize: 50,
                image: "/images/board.png",
            }}
            on={on}
        ></Bard>
    );
}
