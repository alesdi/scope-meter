export abstract class ScopeBoxState {
    canvas: HTMLCanvasElement;
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

    dropHandler(event: MouseEvent): void {
        event.preventDefault();
    }

    clickToUploadHandler(event: MouseEvent): void {
        event.preventDefault();
    }

    dragEnterHandler(event: MouseEvent): void {
        event.preventDefault();
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

    abstract render(): void;
}

export class ScopeBoxImagePickState extends ScopeBoxState {
    render(): void {
        console.log();
    }

    private uploadFile(file: File) {
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
            this.uploadFile(file);
        }
    }

    clickToUploadHandler() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.onchange = () => {
            const file = (fileInput.files as FileList)[0];
            this.uploadFile(file);
        };
        fileInput.click();
    }

    dragEnterHandler(event: DragEvent) {
        event.preventDefault();
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