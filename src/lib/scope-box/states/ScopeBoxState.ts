import type ScopeSetup from "$lib/ScopeSetup";
import type Tool from "../tools/Tool";

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

    updateCanvasSize() {
        if (this.canvas.parentElement) {
            this.canvas.width = this.canvas.parentElement.offsetWidth * this.retinaFactor;
            this.canvas.height = this.canvas.parentElement.offsetHeight * this.retinaFactor;
            this.canvas.getContext("2d")?.scale(this.retinaFactor, this.retinaFactor);
        }
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

