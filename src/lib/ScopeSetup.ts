export default interface ScopeSetup {
    xDivImageSize: number | null;
    yDivImageSize: number | null;
    xDivPhysicalScale: number | null;
    yDivPhysicalScale: number | null;
    xDivPhysicalUnit: string | null;
    yDivPhysicalUnit: string | null;
    colorSelection: {
        label: string;
        color: [number, number, number];
    } | null;
}