import type ScopeSetup from "$lib/ScopeSetup";
import { getInverseSiUnit, parseSiUnit, renderSi } from "$lib/utilities/si";
import Tool from "./Tool";


export default class SineTool extends Tool {
    constructor(
        private readonly length: number = 1,
        private readonly shift: number = 0,
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
            ctx.strokeStyle = "white";

            const topLeft = {
                x: Math.min(mouseStart.x, mouse.x),
                y: Math.min(mouseStart.y, mouse.y),
            };

            const bottomRight = {
                x: Math.max(mouseStart.x, mouse.x),
                y: Math.max(mouseStart.y, mouse.y),
            };

            const xStep = Math.min(1, Math.max(10, (bottomRight.x - topLeft.x) / 100));

            const period = Math.abs((mouse.x - mouseStart.x) / this.length);

            ctx.beginPath();
            ctx.moveTo(topLeft.x, 0);
            ctx.lineTo(topLeft.x, image.height);

            ctx.moveTo(bottomRight.x, 0);
            ctx.lineTo(bottomRight.x, image.height);

            ctx.moveTo(0, topLeft.y);
            ctx.lineTo(image.width, topLeft.y);

            ctx.moveTo(0, bottomRight.y);
            ctx.lineTo(image.width, bottomRight.y);

            ctx.moveTo(0, topLeft.y);

            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.stroke();
            ctx.closePath();

            if (period > 10 * xStep) {
                ctx.beginPath();
                let x = 0;
                let periodNumber = 0;
                while (x < image.width) {
                    const y = mouse.y
                        - (mouse.y - mouseStart.y) / 2
                        - Math.sin(-(x - mouseStart.x) / period * Math.PI + this.shift)
                        * ((mouse.y - mouseStart.y) / 2);

                    if (isFinite(y) && isFinite(x)) {
                        ctx.lineTo(x, y);
                    }

                    if (x > periodNumber * period + mouseStart.x % period) {
                        ctx.moveTo(mouseStart.x % period + periodNumber * period, mouseStart.y);
                        ctx.lineTo(mouseStart.x % period + periodNumber * period, mouse.y);
                        periodNumber++;

                        ctx.moveTo(x, y);
                    }

                    x += xStep;
                }
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.stroke();
            ctx.closePath();

            const fontSize = offset * 1.5;

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";

            const width = bottomRight.x - topLeft.x;
            const height = bottomRight.y - topLeft.y;

            const xMeasure = (width / (scopeSetup.xDivImageSize ?? 1) * (scopeSetup.xDivPhysicalScale ?? 1)) / this.length;
            const yMeasure = (height / (scopeSetup.yDivImageSize ?? 1) * (scopeSetup.yDivPhysicalScale ?? 1));

            const periodLabel = "T = " + this.renderXLabel(xMeasure, scopeSetup);

            let frequencyLabel: string | undefined;
            const xParsedSiUnit = parseSiUnit(scopeSetup.xDivPhysicalUnit ?? "");
            if (xParsedSiUnit) {
                const inverseUnit = getInverseSiUnit(xParsedSiUnit.unit);
                const renderedSi = renderSi(1 / (xMeasure * xParsedSiUnit.factor), inverseUnit);

                if (isFinite(renderedSi.value)) {
                    frequencyLabel = "f = " + renderedSi.value.toPrecision(3) + " " + renderedSi.unit;
                }
            }

            const yLabel = this.renderYLabel(yMeasure, scopeSetup);

            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(periodLabel, topLeft.x + width / 2, bottomRight.y + offset * 2);
            if (frequencyLabel) {
                ctx.fillText(frequencyLabel, topLeft.x + width / 2, fontSize * 1.5 + bottomRight.y + offset * 2);
            }
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
