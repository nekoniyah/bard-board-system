# BordoJS

**A simple javascript board game engine library**

## Installation

```bash
bun i bordojs
npm i bordojs
yarn add bordojs
pnpm add bordojs
```

## Usage (React)

```js
import { Board } from "bordojs";

function App() {
    function on(event, ev) {
        switch (event) {
            case "click":
                console.log(`click ${ev.target.id}`);
                break;
        }
    }

    const config = {
        data: [
            {
                name: "gydgey9",
                x: 45 // percentage of x position of the point based on the width of the board,
                y: 30 // percentage of y position of the point based on the height of the board,
                linkedTo: ["httaffv", "jy6pelj"],
            },
        ],
        image: "/images/board.png",
        type: "steps",
    };

    return <Board config={config} on={on} />;
}
```

## Usage (Vanilla JS)

```js
import { Board } from "bordojs";

const config = {
    ctx: document.querySelector(".board-container"),
    data: [
        {
            name: "gydgey9",
            x: 45, // percentage of x position of the point based on the width of the board,
            y: 30, // percentage of y position of the point based on the height of the board,
            linkedTo: ["httaffv", "jy6pelj"],
        },
    ],
    image: "/images/board.png",
    type: "steps",
};

const board = new Board(config);

board.render();

board.on("click", (ev, point) => {
    console.log(`click ${ev.target.id}`);
});

board.on("mousemove", (ev) => {
    console.log(ev);
});
```

## Editor

BordoJS provides an editor to create a configuration for your board. You will get a JSON string that you can pass to the Board component (for React), the Board class (for Vanilla JS), or the Board component (for your Excalidraw app).

You can find the editor [here](https://bordojs.vercel.app/).
