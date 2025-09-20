export default function reversePercentage(
    element: HTMLDivElement,
    x: number,
    y: number
) {
    // X and Y are in percentage - find the real value in px

    const rect = element.getBoundingClientRect();

    return {
        x: (x / 100) * rect.width + rect.left,
        y: (y / 100) * rect.height + rect.top,
    };
}
