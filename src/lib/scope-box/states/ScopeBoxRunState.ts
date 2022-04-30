import type ScopeSetup from "$lib/ScopeSetup";
import type Tool from "../tools/Tool";
import ScopeBoxDivSetupState from "./ScopeBoxDivSetupState";
import { ScopeBoxState } from "./ScopeBoxState";


export default class ScopeBoxRunState extends ScopeBoxState {
    private image: HTMLImageElement;
    private mouseStart?: { x: number; y: number; };
    private mouse?: { x: number; y: number; };
    onDivisionRectangleSelected?: (value: { x: number; y: number; }) => void;
    private imageFitScale = 1;
    private imageFitOffset = {
        x: 0,
        y: 0,
    };

    constructor({
        transition, scopeSetup, tool, updateDivisionSetup, image, canvas,
    }: {
        transition: (next: ScopeBoxState) => void;
        scopeSetup?: ScopeSetup;
        tool?: Tool;
        updateDivisionSetup: ({ x, y }: { x: number; y: number; }) => void;
        image: HTMLImageElement;
        canvas: HTMLCanvasElement;
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
                }));
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
                this.imageFitOffset.y
            );
            ctx.scale(this.imageFitScale, this.imageFitScale);
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

            if (this.mouse && this.scopeSetup && this.tool) {
                this.tool.render(
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

    private getMousePosition(event: MouseEvent): { x: number; y: number; } {
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
            })
        );
    }
}
