import type ScopeSetup from "$lib/ScopeSetup";
import Tool from "./Tool";


export default class DivisionRectangleTool extends Tool {
    render(
        image: HTMLImageElement,
        ctx: CanvasRenderingContext2D,
        scopeSetup: ScopeSetup,
        mouse: { x: number; y: number; },
        mouseStart?: { x: number; y: number; }
    ) {
        if (mouseStart && mouse) {
            const offset = 10;
            ctx.strokeStyle = this.colorShade(scopeSetup.colorSelection?.color, 0.4);

            const topLeft = {
                x: Math.min(mouseStart.x, mouse.x),
                y: Math.min(mouseStart.y, mouse.y),
            };

            const bottomRight = {
                x: Math.max(mouseStart.x, mouse.x),
                y: Math.max(mouseStart.y, mouse.y),
            };

            ctx.beginPath();
            ctx.moveTo(topLeft.x, 0);
            ctx.lineTo(topLeft.x, image.height);

            ctx.moveTo(bottomRight.x, 0);
            ctx.lineTo(bottomRight.x, image.height);

            ctx.moveTo(0, topLeft.y);
            ctx.lineTo(image.width, topLeft.y);

            ctx.moveTo(0, bottomRight.y);
            ctx.lineTo(image.width, bottomRight.y);

            ctx.closePath();
            ctx.stroke();

            const width = Math.round(bottomRight.x - topLeft.x);
            const height = Math.round(bottomRight.y - topLeft.y);

            const fontSize = offset * 1.5;

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = this.colorShade(scopeSetup.colorSelection?.color, 1);
            ctx.textAlign = "center";
            ctx.fillText(`${width}px`, topLeft.x + width / 2, bottomRight.y + offset * 2);
            ctx.textAlign = "left";
            ctx.fillText(`${height}px`, bottomRight.x + offset, topLeft.y + height / 2 + fontSize / 2);
        } else if (mouse) {
            ctx.strokeStyle = this.colorShade(scopeSetup.colorSelection?.color, 0.2);
            ctx.beginPath();
            ctx.moveTo(mouse.x, 0);
            ctx.lineTo(mouse.x, image.height);

            ctx.moveTo(0, mouse.y);
            ctx.lineTo(image.width, mouse.y);

            ctx.closePath();
            ctx.stroke();
        }
    }
}
