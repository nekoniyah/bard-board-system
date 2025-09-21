# BordoJS Documentation

BordoJS is a simple javascript board game engine library.

## React

### Board (Component)

-   `config`

    -   `type`: "grid" | "steps" (default: "grid")
    -   `data`: [Grid](#grid) | [StepPoint[]](#steppoint)
    -   `image`: [string](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#src)
    -   `boxSize?`: [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) (default: 50)

-   `on`: (`eventName`: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String), `...args`: [any](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#src)) => void

**Events**

-   `click`: (`ev`: [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent), `point`: [StepPoint](#steppoint)) => void
-   `mousemove`: (`ev`: [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)) => void

## Vanilla JS

### Board (Class)

```ts
const board = new Board(config);
```

-   `type`: "grid" | "steps" (default: "grid")
-   `ctx`: [HTMLDivElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement)
-   `data`: [Grid](#grid) | [StepPoint[]](#steppoint)
-   `image`: [string](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#src)
-   `boxSize?`: [number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number) (default: 50)

### Board.on

-   `eventName`: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
-   `...args`: [any](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#src)

**Events**

-   `click`: (`ev`: [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent), `point`: [StepPoint](#steppoint)) => void
-   `mousemove`: (`ev`: [MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)) => void
