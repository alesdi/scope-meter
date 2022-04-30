import type ScopeSetup from "$lib/ScopeSetup";
import Tool from "./Tool";


export default class SimpleRectangleTool extends Tool {
    render(
        image: HTMLImageElement,
        ctx: CanvasRenderingContext2D,
        scopeSetup: ScopeSetup,
        mouse: { x: number; y: number; },
        mouseStart?: { x: number; y: number; }
    ) {
        if (mouseStart && mouse) {
            const offset = 10;
            ctx.strokeStyle = "white";

            const topLeft = {
                x: Math.min(mouseStart.x, mouse.x),
                y: Math.min(mouseStart.y, mouse.y),
            };

            const bottomRight = {
                x: Math.max(mouseStart.x, mouse.x),
                y: Math.max(mouseStart.y, mouse.y),
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
            ctx.lineTo(topLeft.x, image.height);

            ctx.moveTo(bottomRight.x, 0);
            ctx.lineTo(bottomRight.x, image.height);

            ctx.moveTo(0, topLeft.y);
            ctx.lineTo(image.width, topLeft.y);

            ctx.moveTo(0, bottomRight.y);
            ctx.lineTo(image.width, bottomRight.y);

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

            const xMeasure = (width / (scopeSetup.xDivImageSize ?? 1) * (scopeSetup.xDivPhysicalScale ?? 1));
            const yMeasure = (height / (scopeSetup.yDivImageSize ?? 1) * (scopeSetup.yDivPhysicalScale ?? 1));

            const xLabel = xMeasure.toFixed(2) + (scopeSetup.xDivPhysicalUnit ?? "");
            const yLabel = yMeasure.toFixed(2) + (scopeSetup.yDivPhysicalUnit ?? "");

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(xLabel, topLeft.x + width / 2, bottomRight.y + offset * 2);
            ctx.textAlign = "left";
            ctx.fillText(yLabel, bottomRight.x + offset, topLeft.y + height / 2 + fontSize / 2);

        } else if (mouse) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
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
