export default function reversePercentage(
  element: HTMLDivElement,
  x: number,
  y: number
) {
  // convertir pourcentage en pixels

  const rect = element.getBoundingClientRect();

  return {
    x: (x / 100) * rect.width + rect.left,
    y: (y / 100) * rect.height + rect.top,
  };
}
