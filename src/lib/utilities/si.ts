export function parseSiUnit(unitString: string): {
    factor: number;
    unit: string;
} | null {

    const pattern = new RegExp(`^(${prefixes.map(({ symbols }) => symbols.join("|")).join("|")})? ?([^0-9\\s]+)$`);

    const match = unitString.trim().match(pattern);

    if (match) {
        const [, prefixString, unitString] = match;
        const prefix = prefixes.find(({ symbols }) => symbols.includes(prefixString));

        if (prefix || !prefixString) {
            return {
                factor: prefix?.factor ?? 1,
                unit: unitString,
            };
        }
    }

    return null;
}

export function renderSi(value: number, unit: string): {
    value: number;
    unit: string;
} {
    const prefix = prefixes.find(({ factor }) => value / factor >= 1);

    if (prefix) {
        return {
            value: value / prefix.factor,
            unit: `${prefix.symbols[0]}${unit}`,
        };
    }

    return {
        value,
        unit,
    };
}

export function getInverseSiUnit(unit: string): string {
    const inverses = [
        ["Hz", "s"],
    ]

    const inverse = inverses.find(inverse => inverse.includes(unit));

    if (inverse) {
        return inverse[inverse.indexOf(unit) === 0 ? 1 : 0];
    } else {
        return `${unit}^-1`;
    }
}

const prefixes = [
    {
        name: "yocto",
        symbols: ["y"],
        factor: 1e-24,
    },
    {
        name: "zepto",
        symbols: ["z"],
        factor: 1e-21,
    },
    {
        name: "atto",
        symbols: ["a"],
        factor: 1e-18,
    },
    {
        name: "femto",
        symbols: ["f"],
        factor: 1e-15,
    },
    {
        name: "pico",
        symbols: ["p"],
        factor: 1e-12,
    },
    {
        name: "nano",
        symbols: ["n"],
        factor: 1e-9,
    },
    {
        name: "micro",
        symbols: ["µ", "u"],
        factor: 1e-6,
    },
    {
        name: "milli",
        symbols: ["m"],
        factor: 1e-3,
    },
    {
        name: "none",
        symbols: [""],
        factor: 1,
    },
    {
        name: "kilo",
        symbols: ["k"],
        factor: 1e3,
    },
    {
        name: "mega",
        symbols: ["M"],
        factor: 1e6,
    },
    {
        name: "giga",
        symbols: ["G"],
        factor: 1e9,
    },
    {
        name: "tera",
        symbols: ["T"],
        factor: 1e12,
    },
    {
        name: "peta",
        symbols: ["P"],
        factor: 1e15,
    },
    {
        name: "exa",
        symbols: ["E"],
        factor: 1e18,
    },
    {
        name: "zetta",
        symbols: ["Z"],
        factor: 1e21,
    },
    {
        name: "yotta",
        symbols: ["Y"],
        factor: 1e24,
    },
].slice().reverse();