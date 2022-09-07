import type ScopeSetup from "$lib/ScopeSetup";
import Tool from "./Tool";


export default class TimeConstantTool extends Tool {
    constructor(
        private readonly length: number = 1,
    ) {
        super();
    }

    render(
        image: HTMLImageElement,
        ctx: CanvasRenderingContext2D,
        scopeSetup: ScopeSetup,
        mouse: { x: number; y: number; },
        mouseStart?: { x: number; y: number; }
    ) {
        if (mouseStart && mouse) {
            const offset = 10;
            ctx.strokeStyle = this.colorShade(scopeSetup.colorSelection?.color, 1);

            const topLeft = {
                x: Math.min(mouseStart.x, mouse.x),
                y: Math.min(mouseStart.y, mouse.y),
            };

            const bottomRight = {
                x: Math.max(mouseStart.x, mouse.x),
                y: Math.max(mouseStart.y, mouse.y),
            };

            // TODO: In an exponential curve it would make much more sense to use a variable step size.
            const xStep = Math.min(1, Math.max(10, (bottomRight.x - topLeft.x) / 100));

            const timeConstant = (mouse.x - mouseStart.x) / this.length;

            ctx.beginPath();
            ctx.moveTo(topLeft.x, 0);
            ctx.lineTo(topLeft.x, image.height);

            ctx.moveTo(bottomRight.x, 0);
            ctx.lineTo(bottomRight.x, image.height);

            ctx.moveTo(mouseStart.x + timeConstant, 0);
            ctx.lineTo(mouseStart.x + timeConstant, image.height);

            ctx.moveTo(0, topLeft.y);
            ctx.lineTo(image.width, topLeft.y);

            ctx.moveTo(0, bottomRight.y);
            ctx.lineTo(image.width, bottomRight.y);

            ctx.moveTo(mouseStart.x + timeConstant, mouse.y);
            ctx.lineTo(mouseStart.x, mouseStart.y);

            ctx.moveTo(topLeft.x, topLeft.y);


            let x = topLeft.x;
            while (x < image.width) {
                const y = mouse.y - Math.exp(-(x - mouseStart.x) / timeConstant) * (mouse.y - mouseStart.y);
                if (isFinite(y) && isFinite(x)) {
                    ctx.lineTo(x, y);
                }
                x += xStep;
            }
            ctx.strokeStyle = this.colorShade(scopeSetup.colorSelection?.color, 0.5);
            ctx.fillStyle = this.colorShade(scopeSetup.colorSelection?.color, 0.1);
            ctx.stroke();
            ctx.closePath();

            const fontSize = offset * 1.5;

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = this.colorShade(scopeSetup.colorSelection?.color, 1);
            ctx.textAlign = "center";

            const width = bottomRight.x - topLeft.x;
            const height = bottomRight.y - topLeft.y;

            const xMeasure = (width / (scopeSetup.xDivImageSize ?? 1) * (scopeSetup.xDivPhysicalScale ?? 1)) / this.length;
            const yMeasure = (height / (scopeSetup.yDivImageSize ?? 1) * (scopeSetup.yDivPhysicalScale ?? 1));

            const xLabel = "\u03C4 = " + this.renderXLabel(xMeasure, scopeSetup);
            const yLabel = this.renderYLabel(yMeasure, scopeSetup);

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = this.colorShade(scopeSetup.colorSelection?.color, 1)
            ctx.textAlign = "center";
            ctx.fillText(xLabel, topLeft.x + width / 2, bottomRight.y + offset * 2);
            ctx.textAlign = "left";
            ctx.fillText(yLabel, bottomRight.x + offset, topLeft.y + height / 2 + fontSize / 2);

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
