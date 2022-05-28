import type ScopeSetup from "$lib/ScopeSetup";
import type Tool from "../tools/Tool";
import ScopeBoxRunState from "./ScopeBoxRunState";
import { ScopeBoxState } from "./ScopeBoxState";


export default class ScopeBoxImagePickState extends ScopeBoxState {
    constructor({
        transition, scopeSetup, tool, updateDivisionSetup, canvas,
    }: {
        transition: (next: ScopeBoxState) => void;
        scopeSetup?: ScopeSetup;
        tool?: Tool;
        updateDivisionSetup: ({ x, y }: { x: number; y: number; }) => void;
        canvas: HTMLCanvasElement;
    }) {
        super({ transition, scopeSetup, tool, updateDivisionSetup, canvas });
        this.updateCanvasSize();
        this.render();
    }

    render(): void {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
            const fontSize = 15;
            ctx.save();
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "grey";
            ctx.textAlign = "center";
            ctx.fillText(
                "Drag or click to upload an oscilloscope screenshot",
                this.width / 2,
                this.height / 2 + fontSize / 2
            );
            const dashSize = 10;
            ctx.strokeStyle = "grey";
            ctx.setLineDash([dashSize, dashSize]);
            ctx.lineWidth = 2;

            ctx.strokeRect(
                ctx.lineWidth,
                ctx.lineWidth,
                this.width - ctx.lineWidth * 2,
                this.height - ctx.lineWidth * 2
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
                this.updateCanvasSize();
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
