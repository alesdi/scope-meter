export abstract class ScopeBoxState {
    canvas: HTMLCanvasElement;
    xDivImageSize: number | null = null;
    yDivImageSize: number | null = null;
    xDivPhysicalScale: number | null = null;
    xDivPhysicalUnit: string | null = "";
    yDivPhysicalScale: number | null = null;
    yDivPhysicalUnit: string | null = "";

    transition: (next: ScopeBoxState) => void;
    updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void;

    constructor({
        transition,
        updateDivisionSetup,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        canvas: HTMLCanvasElement,
    }) {
        this.transition = transition;
        this.updateDivisionSetup = updateDivisionSetup;
        this.canvas = canvas;
    }

    handleMouseDown(event: MouseEvent): void {
        event.preventDefault();
    }

    handleMouseUp(event: MouseEvent): void {
        event.preventDefault();
    }

    handleMouseMove(event: MouseEvent): void {
        event.preventDefault();
    }


    dropHandler(event: DragEvent) {
        event.preventDefault();
    }

    clickToUploadHandler() {
        //
    }

    dragOverHandler(event: DragEvent) {
        event.preventDefault();
    }

    abstract render(): void;
}

export class ScopeBoxImagePickState extends ScopeBoxState {
    constructor({
        transition,
        updateDivisionSetup,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        canvas: HTMLCanvasElement,
    }) {
        super({ transition, updateDivisionSetup, canvas });
        this.render();
    }

    render(): void {
        if (this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.offsetWidth;
            this.canvas.height = this.canvas.parentElement.offsetHeight;
        }

        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            const fontSize = 15
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "grey";
            ctx.textAlign = "center";
            ctx.fillText(
                "Drag or click to upload an oscilloscope screenshot",
                this.canvas.width / 2,
                this.canvas.height / 2 + fontSize / 2,
            );
            const frameOffset = 20;
            ctx.strokeStyle = "grey";
            ctx.setLineDash([frameOffset, frameOffset]);
            ctx.lineWidth = 2;

            ctx.strokeRect(
                frameOffset,
                frameOffset,
                this.canvas.width - frameOffset * 2,
                this.canvas.height - frameOffset * 2,
            );
        }
    }

    loadFile(file: File) {
        const image = new Image();

        const reader = new FileReader();
        reader.onload = () => {
            image.src = reader.result as string;
            image.onload = () => {
                this.render();
                this.transition(new ScopeBoxRunState({
                    transition: this.transition,
                    canvas: this.canvas,
                    updateDivisionSetup: this.updateDivisionSetup,
                    image,
                }))
            };
        };
        reader.readAsDataURL(file);
    }

    dropHandler(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            const file = (event.dataTransfer.files as FileList)[0];
            this.loadFile(file);
        }
    }

    clickToUploadHandler() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.onchange = () => {
            const file = (fileInput.files as FileList)[0];
            this.loadFile(file);
        };
        fileInput.click();
    }
}

export class ScopeBoxRunState extends ScopeBoxState {
    private image: HTMLImageElement;
    private mouseStart?: { x: number, y: number };
    private mouse?: { x: number, y: number };
    onDivisionRectangleSelected?: (value: { x: number, y: number }) => void;

    constructor({
        transition,
        updateDivisionSetup,
        image,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
    }) {
        super({ transition, updateDivisionSetup, canvas });
        this.image = image;
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.render();
    }

    swapFile(file: File) {
        const image = new Image();

        const reader = new FileReader();
        reader.onload = () => {
            image.src = reader.result as string;
            image.onload = () => {
                this.render();
                this.transition(new ScopeBoxRunState({
                    transition: this.transition,
                    canvas: this.canvas,
                    updateDivisionSetup: this.updateDivisionSetup,
                    image,
                }))
            };
        };
        reader.readAsDataURL(file);
    }

    dropHandler(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer) {
            const file = (event.dataTransfer.files as FileList)[0];
            this.swapFile(file);
        }
    }

    render(): void {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

            if (this.mouseStart && this.mouse) {
                const offset = 10;
                ctx.strokeStyle = "white";

                const topLeft = {
                    x: Math.min(this.mouseStart.x, this.mouse.x),
                    y: Math.min(this.mouseStart.y, this.mouse.y),
                };

                const bottomRight = {
                    x: Math.max(this.mouseStart.x, this.mouse.x),
                    y: Math.max(this.mouseStart.y, this.mouse.y),
                };

                const primaryGridDivisions = 10;
                ctx.beginPath();
                for (let i = 0; i < primaryGridDivisions; i++) {
                    const x = topLeft.x + (bottomRight.x - topLeft.x) * i / primaryGridDivisions;
                    const y = topLeft.y + (bottomRight.y - topLeft.y) * i / primaryGridDivisions;
                    ctx.moveTo(x, topLeft.y);
                    ctx.lineTo(x, bottomRight.y);
                    ctx.moveTo(topLeft.x, y);
                    ctx.lineTo(bottomRight.x, y);
                }
                ctx.closePath();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(topLeft.x, 0);
                ctx.lineTo(topLeft.x, this.canvas.height);

                ctx.moveTo(bottomRight.x, 0);
                ctx.lineTo(bottomRight.x, this.canvas.height);

                ctx.moveTo(0, topLeft.y);
                ctx.lineTo(this.canvas.width, topLeft.y);

                ctx.moveTo(0, bottomRight.y);
                ctx.lineTo(this.canvas.width, bottomRight.y);

                ctx.closePath();
                ctx.stroke();
                ctx.closePath();
                ctx.strokeStyle = "rgba(255, 255, 255, 1)";
                ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                ctx.stroke();
                ctx.fill();

                const fontSize = offset * 1.5;

                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";

                const width = bottomRight.x - topLeft.x;
                const height = bottomRight.y - topLeft.y;

                const xMeasure = (width / (this.xDivImageSize ?? 1) * (this.xDivPhysicalScale ?? 1));
                const yMeasure = (height / (this.yDivImageSize ?? 1) * (this.yDivPhysicalScale ?? 1));

                const xLabel = xMeasure.toFixed(2) + (this.yDivPhysicalUnit ?? "");
                const yLabel = yMeasure.toFixed(2) + (this.xDivPhysicalUnit ?? "");

                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(xLabel, topLeft.x + width / 2, bottomRight.y + offset * 2);
                ctx.textAlign = "left";
                ctx.fillText(yLabel, bottomRight.x + offset, topLeft.y + height / 2 + fontSize / 2);

            } else if (this.mouse) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.beginPath();
                ctx.moveTo(this.mouse.x, 0);
                ctx.lineTo(this.mouse.x, this.canvas.height);

                ctx.moveTo(0, this.mouse.y);
                ctx.lineTo(this.canvas.width, this.mouse.y);

                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    handleMouseDown(event: MouseEvent): void {
        super.handleMouseDown(event);
        this.mouseStart = { x: event.offsetX, y: event.offsetY };
    }

    handleMouseMove(event: MouseEvent): void {
        super.handleMouseMove(event);
        this.mouse = { x: event.offsetX, y: event.offsetY };

        this.render();
    }

    handleMouseUp(event: MouseEvent): void {
        super.handleMouseUp(event);
        this.handleMouseMove(event);
        this.mouseStart = undefined;
        this.render();
    }

    selectDivisionRectangle() {
        this.transition(
            new ScopeBoxDivSetupState({
                transition: this.transition,
                canvas: this.canvas,
                updateDivisionSetup: this.updateDivisionSetup,
                image: this.image,
            }),
        );
    }
}

export class ScopeBoxDivSetupState extends ScopeBoxState {
    private image: HTMLImageElement;
    private mouseStart?: { x: number, y: number };
    private mouse?: { x: number, y: number };

    constructor({
        transition,
        updateDivisionSetup,
        image,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
    }) {
        super({ transition, updateDivisionSetup, canvas });
        this.image = image;
        this.canvas.width = image.width;
        this.canvas.height = image.height;
        this.render();
    }

    render(): void {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

            if (this.mouseStart && this.mouse) {
                const offset = 10;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";

                const topLeft = {
                    x: Math.min(this.mouseStart.x, this.mouse.x),
                    y: Math.min(this.mouseStart.y, this.mouse.y),
                };

                const bottomRight = {
                    x: Math.max(this.mouseStart.x, this.mouse.x),
                    y: Math.max(this.mouseStart.y, this.mouse.y),
                };

                ctx.beginPath();
                ctx.moveTo(topLeft.x, 0);
                ctx.lineTo(topLeft.x, this.canvas.height);

                ctx.moveTo(bottomRight.x, 0);
                ctx.lineTo(bottomRight.x, this.canvas.height);

                ctx.moveTo(0, topLeft.y);
                ctx.lineTo(this.canvas.width, topLeft.y);

                ctx.moveTo(0, bottomRight.y);
                ctx.lineTo(this.canvas.width, bottomRight.y);

                ctx.closePath();
                ctx.stroke();

                const width = bottomRight.x - topLeft.x;
                const height = bottomRight.y - topLeft.y;

                const fontSize = offset * 1.5;

                ctx.font = `${fontSize}px sans-serif`;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.fillText(`${width}px`, topLeft.x + width / 2, bottomRight.y + offset * 2);
                ctx.textAlign = "left";
                ctx.fillText(`${height}px`, bottomRight.x + offset, topLeft.y + height / 2 + fontSize / 2);
            } else if (this.mouse) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.beginPath();
                ctx.moveTo(this.mouse.x, 0);
                ctx.lineTo(this.mouse.x, this.canvas.height);

                ctx.moveTo(0, this.mouse.y);
                ctx.lineTo(this.canvas.width, this.mouse.y);

                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    handleMouseDown(event: MouseEvent): void {
        super.handleMouseDown(event);
        this.mouseStart = { x: event.offsetX, y: event.offsetY };
    }

    handleMouseMove(event: MouseEvent): void {
        super.handleMouseMove(event);
        this.mouse = { x: event.offsetX, y: event.offsetY };

        this.render();
    }

    handleMouseUp(event: MouseEvent): void {
        super.handleMouseUp(event);
        this.handleMouseMove(event);
        if (this.mouseStart && this.mouse) {
            this.updateDivisionSetup({
                x: Math.abs(this.mouseStart.x - this.mouse.x),
                y: Math.abs(this.mouseStart.y - this.mouse.y),
            });

            this.transition(
                new ScopeBoxRunState({
                    transition: this.transition,
                    canvas: this.canvas,
                    updateDivisionSetup: this.updateDivisionSetup,
                    image: this.image,
                }),
            );
        }
        this.mouseStart = undefined;
        this.render();
    }
}