type BardConfig = {
    mode?: "draw" | "link" | "drag" | "none";
    ctx: HTMLDivElement;
    points?: {
        name: string;
        x: number;
        y: number;
        linkedTo?: string[];
    }[];
    boxSize?: number;
    percentage?: boolean;
};

class Bard {
    public div: HTMLDivElement;
    public boxSize = 20;

    private _points: {
        name: string;
        x: number;
        y: number;
        linkedTo?: string[];
    }[] = [];
    private svg: SVGSVGElement;
    private mode: "draw" | "link" | "drag" | "none";

    mousePercent = { x: 0, y: 0 };

    reversePercentage(x: number, y: number) {
        // X and Y are in percentage - find the real value in px

        const rect = this.div.getBoundingClientRect();

        return {
            x: (x / 100) * rect.width + rect.left,
            y: (y / 100) * rect.height + rect.top,
        };
    }

    constructor(private options: BardConfig) {
        this.div = options.ctx;
        this.mode = options.mode || "none";
        this.boxSize = options.boxSize || 20;

        // SVG overlay
        this.svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        Object.assign(this.svg.style, {
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
        });
        this.div.appendChild(this.svg);

        this.load();

        this.points.forEach((point) => {
            if (point.linkedTo && point.linkedTo.includes(point.name)) {
                point.linkedTo = point.linkedTo.filter((p) => p !== point.name);
                this.removePoint(point.name);
                this.addPoint(point);
                this.save();
            }
        });

        this.div.addEventListener("drag", (ev) => {
            ev.preventDefault();
        });

        this.div.addEventListener("selectstart", (ev) => {
            ev.preventDefault();
        });

        if (this.mode !== "none") this.render();

        document.addEventListener("mousemove", (ev) => {
            this.mouse.x = ev.clientX;
            this.mouse.y = ev.clientY;

            const rect = this.div.getBoundingClientRect(); // maDiv est l'élément cible

            // Dans ton gestionnaire d'événement mousemove :
            this.mousePercent.x = ((ev.pageX - rect.left) / rect.width) * 100;
            this.mousePercent.y = ((ev.pageY - rect.top) / rect.height) * 100;
        });

        this.div.addEventListener("click", (ev) => {
            if (this.mode === "link") return;
            if (this.mode !== "draw") return;

            this.addPoint({
                name: this.genId(),
                x: this.mousePercent.x,
                y: this.mousePercent.y,
            });
            this.save();
        });

        let first: HTMLDivElement | null = null;
        let second: HTMLDivElement | null = null;

        document.addEventListener("click", (ev) => {
            if (this.mode !== "link") return;

            const target = ev.target as HTMLDivElement;
            if (!target.classList.contains("point")) return;

            if (!first) {
                first = target;
            } else {
                second = target;
                const p1 = this.points.find((p) => p.name === first!.id);
                const p2 = this.points.find((p) => p.name === second!.id);
                if (p1 && p2) {
                    p1.linkedTo = [...(p1.linkedTo || []), p2.name];
                    this.save();
                    this.render();
                }

                first = null;
                second = null;
            }
        });
    }

    get points() {
        return this._points;
    }
    set points(p) {
        this._points = p;
        if (this.mode !== "none") this.render();
    }

    addPoint(p: { name: string; x: number; y: number; linkedTo?: string[] }) {
        this.points.push(p);
        this.render();
    }

    removePoint(name: string) {
        this.points = this.points.filter((pt) => pt.name !== name);
        this.render();
    }

    genId() {
        return Math.random().toString(36).substring(2, 9);
    }

    listenPoint(pointName: string) {
        let div = document.getElementById(pointName) as HTMLDivElement;

        div.addEventListener("click", (ev) => {
            if (this.mode === "link") return;
            if (this.mode !== "draw") return;

            ev.stopPropagation();
            this.removePoint(pointName);
            this.save();
        });

        let dragging = false;

        div.addEventListener("click", (ev) => {
            if (this.mode !== "drag") return;
            dragging = true;

            if (dragging) {
                dragging = false;

                const p = this.points.find((p) => p.name === pointName);
                if (p) {
                    p.x = this.mousePercent.x;
                    p.y = this.mousePercent.y;

                    this.removePoint(pointName);
                    this.addPoint(p);

                    this.save();
                    this.render();
                }
            }
        });
    }

    render() {
        this.div.querySelectorAll(".point").forEach((el) => el.remove());
        while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);

        // afficher points
        this.points.forEach((pt) => {
            const pointDiv = document.createElement("div");
            pointDiv.classList.add("point");
            pointDiv.id = pt.name;
            Object.assign(pointDiv.style, {
                position: "absolute",
                width: `${this.boxSize}px`,
                height: `${this.boxSize}px`,
                left: `calc(${pt.x}% - ${this.boxSize / 2}px)`,
                top: `calc(${pt.y}% - ${this.boxSize / 2}px)`,
                background: "red",
                opacity: 0.5,
                border: "1px solid black",
                borderRadius: "50%",
                cursor: "pointer",
            });
            this.div.appendChild(pointDiv);

            this.listenPoint(pt.name);
        });

        // lignes
        this.points.forEach((pt) => {
            if (!pt.linkedTo) return;
            const startX = pt.x;
            const startY = pt.y;
            pt.linkedTo.forEach((id) => {
                const linkedPt = this.points.find((p) => p.name === id);
                if (!linkedPt) return;
                const line = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "line"
                );

                const start = this.reversePercentage(startX, startY);
                const end = this.reversePercentage(linkedPt.x, linkedPt.y);

                line.setAttribute("x1", start.x.toString());
                line.setAttribute("y1", start.y.toString());
                line.setAttribute("x2", end.x.toString());
                line.setAttribute("y2", end.y.toString());
                line.setAttribute("stroke", "black");
                line.setAttribute("stroke-width", "2");
                this.svg.appendChild(line);
            });
        });
    }

    save() {
        localStorage.setItem("points", JSON.stringify(this.points));
    }

    load() {
        this.points = JSON.parse(localStorage.getItem("points")!);
    }

    getMode() {
        return this.mode;
    }

    setMode(mode: "draw" | "link" | "drag" | "none") {
        this.mode = mode;

        if (mode !== "none") this.render();
    }

    mouse = { x: 0, y: 0 };
}

const bard = new Bard({
    ctx: document.querySelector(".board-container") as HTMLDivElement,
    boxSize: 50,
    mode: "none",
});

let modes: ("draw" | "link" | "drag" | "none")[] = [
    "draw",
    "link",
    "drag",
    "none",
];

const btnMode = document.querySelector("#mode") as HTMLButtonElement;
btnMode.addEventListener("click", () => {
    const index = modes.indexOf(bard.getMode());
    const nextIndex = (index + 1) % modes.length;
    bard.setMode(modes[nextIndex]);
    btnMode.textContent = modes[nextIndex];
});
