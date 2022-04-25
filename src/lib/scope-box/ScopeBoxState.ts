import type ScopeSetup from "$lib/ScopeSetup";
import { DivisionRectangleTool, Tool } from "./tools";

export abstract class ScopeBoxState {
    canvas: HTMLCanvasElement;
    scopeSetup?: ScopeSetup;
    tool?: Tool;
    retinaFactor = 2;

    get width() {
        return this.canvas.width / this.retinaFactor;
    }

    get height() {
        return this.canvas.height / this.retinaFactor;
    }

    transition: (next: ScopeBoxState) => void;
    updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void;

    constructor({
        transition,
        scopeSetup,
        tool,
        updateDivisionSetup,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        scopeSetup?: ScopeSetup,
        tool?: Tool,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        canvas: HTMLCanvasElement,
    }) {
        this.transition = transition;
        this.scopeSetup = scopeSetup;
        this.tool = tool;
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
        scopeSetup,
        tool,
        updateDivisionSetup,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        scopeSetup?: ScopeSetup,
        tool?: Tool,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        canvas: HTMLCanvasElement,
    }) {
        super({ transition, scopeSetup, tool, updateDivisionSetup, canvas });
        this.render();
    }

    render(): void {
        if (this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.offsetWidth * 2;
            this.canvas.height = this.canvas.parentElement.offsetHeight * 2;
        }

        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            const fontSize = 15;
            ctx.scale(2, 2);
            ctx.save();
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "grey";
            ctx.textAlign = "center";
            ctx.fillText(
                "Drag or click to upload an oscilloscope screenshot",
                this.width / 2,
                this.height / 2 + fontSize / 2,
            );
            const dashSize = 10;
            ctx.strokeStyle = "grey";
            ctx.setLineDash([dashSize, dashSize]);
            ctx.lineWidth = 2;

            ctx.strokeRect(
                ctx.lineWidth,
                ctx.lineWidth,
                this.width - ctx.lineWidth * 2,
                this.height - ctx.lineWidth * 2,
            );
            ctx.restore();
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
                    scopeSetup: this.scopeSetup,
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
    private imageFitScale = 1;
    private imageFitOffset = {
        x: 0,
        y: 0,
    };

    constructor({
        transition,
        scopeSetup,
        tool,
        updateDivisionSetup,
        image,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        scopeSetup?: ScopeSetup,
        tool?: Tool,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
    }) {
        super({ transition, scopeSetup, tool, updateDivisionSetup, canvas });
        this.image = image;

        // Compute image offset and scale to into canvas
        const imageWidth = image.width;
        const imageHeight = image.height;
        const canvasWidth = this.width;
        const canvasHeight = this.height;
        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY);
        this.imageFitScale = scale;
        this.imageFitOffset.x = (canvasWidth - imageWidth * scale) / 2;
        this.imageFitOffset.y = (canvasHeight - imageHeight * scale) / 2;
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
                    scopeSetup: this.scopeSetup,
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
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.translate(
                this.imageFitOffset.x,
                this.imageFitOffset.y,
            )
            ctx.scale(this.imageFitScale, this.imageFitScale);
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

            if (this.mouse && this.scopeSetup && this.tool) {
                this.tool.render(
                    this.image,
                    ctx,
                    this.scopeSetup,
                    this.mouse,
                    this.mouseStart
                )
            }

            ctx.restore();
        }
    }

    private getMousePosition(event: MouseEvent): { x: number, y: number } {
        const x = (event.offsetX - this.imageFitOffset.x) / this.imageFitScale;
        const y = (event.offsetY - this.imageFitOffset.y) / this.imageFitScale;

        return { x, y };
    }

    handleMouseDown(event: MouseEvent): void {
        super.handleMouseDown(event);
        this.mouseStart = this.getMousePosition(event);
    }

    handleMouseMove(event: MouseEvent): void {
        super.handleMouseMove(event);
        this.mouse = this.getMousePosition(event);

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
                scopeSetup: this.scopeSetup,
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
    private imageFitScale = 1;
    private imageFitOffset = {
        x: 0,
        y: 0,
    };

    constructor({
        transition,
        scopeSetup,
        updateDivisionSetup,
        image,
        canvas,
    }: {
        transition: (next: ScopeBoxState) => void,
        scopeSetup?: ScopeSetup,
        updateDivisionSetup: ({ x, y }: { x: number, y: number }) => void,
        image: HTMLImageElement,
        canvas: HTMLCanvasElement,
    }) {
        super({ transition, scopeSetup, updateDivisionSetup, canvas });
        this.image = image;

        // Compute image offset and scale to into canvas
        const imageWidth = image.width;
        const imageHeight = image.height;
        const canvasWidth = this.width;
        const canvasHeight = this.height;
        const scaleX = canvasWidth / imageWidth;
        const scaleY = canvasHeight / imageHeight;
        const scale = Math.min(scaleX, scaleY);
        this.imageFitScale = scale;
        this.imageFitOffset.x = (canvasWidth - imageWidth * scale) / 2;
        this.imageFitOffset.y = (canvasHeight - imageHeight * scale) / 2;
        this.render();

        this.render();
    }

    render(): void {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {

            ctx.clearRect(0, 0, this.width, this.height);
            ctx.save();
            ctx.translate(
                this.imageFitOffset.x,
                this.imageFitOffset.y,
            )
            ctx.scale(this.imageFitScale, this.imageFitScale);

            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

            if (this.mouse && this.scopeSetup) {
                const tool = new DivisionRectangleTool();
                tool.render(
                    this.image,
                    ctx,
                    this.scopeSetup,
                    this.mouse,
                    this.mouseStart
                );
            }

            ctx.restore();
        }
    }

    private getMousePosition(event: MouseEvent): { x: number, y: number } {
        const x = (event.offsetX - this.imageFitOffset.x) / this.imageFitScale;
        const y = (event.offsetY - this.imageFitOffset.y) / this.imageFitScale;

        return { x, y };
    }

    handleMouseDown(event: MouseEvent): void {
        super.handleMouseDown(event);
        this.mouseStart = this.getMousePosition(event);
    }

    handleMouseMove(event: MouseEvent): void {
        super.handleMouseMove(event);
        this.mouse = this.getMousePosition(event);

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
                    scopeSetup: this.scopeSetup,
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