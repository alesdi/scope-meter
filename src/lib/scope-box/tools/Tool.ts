import type ScopeSetup from "$lib/ScopeSetup";

export default abstract class Tool {
    abstract render(
        image: HTMLImageElement,
        ctx: CanvasRenderingContext2D,
        scopeSetup: ScopeSetup,
        mouse: { x: number, y: number },
        mouseStart?: { x: number, y: number }
    ): void;
}

