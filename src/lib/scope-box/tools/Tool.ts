import type ScopeSetup from "$lib/ScopeSetup";
import { parseSiUnit, renderSi } from "$lib/utilities/si";

export default abstract class Tool {
    abstract render(
        image: HTMLImageElement,
        ctx: CanvasRenderingContext2D,
        scopeSetup: ScopeSetup,
        mouse: { x: number, y: number },
        mouseStart?: { x: number, y: number }
    ): void;

    renderXLabel(value: number, scopeSetup: ScopeSetup): string {
        let xUnit = (scopeSetup.xDivPhysicalUnit ?? "");
        const xParsedSiUnit = parseSiUnit(xUnit);

        if (xParsedSiUnit) {
            console.log(xParsedSiUnit);
            value = value * xParsedSiUnit.factor;

            const xRenderedSi = renderSi(value, xParsedSiUnit.unit);
            value = xRenderedSi.value;
            xUnit = xRenderedSi.unit;
        }

        return value.toPrecision(3) + " " + xUnit;
    }

    renderYLabel(value: number, scopeSetup: ScopeSetup): string {
        let yUnit = (scopeSetup.yDivPhysicalUnit ?? "");
        const yParsedSiUnit = parseSiUnit(yUnit);

        if (yParsedSiUnit) {
            console.log(yParsedSiUnit);
            value = value * yParsedSiUnit.factor;

            const yRenderedSi = renderSi(value, yParsedSiUnit.unit);
            value = yRenderedSi.value;
            yUnit = yRenderedSi.unit;
        }

        return value.toPrecision(3) + " " + yUnit;
    }
}

