import { DEFAULT_RANGES, RangeRegistry, type RelationAttribute } from "src/internal";


export function newRange<T extends RelationAttribute>(
    type: T,
    value?: number | NumberRange<RelationAttribute>
): NumberRange<T> {
    return new NumberRange<T>(
        type,
        typeof value === "number" ? value : value?.value ?? DEFAULT_RANGES[type].default
    );
}

export class NumberRange<T extends RelationAttribute> {
    #type: T;
    #min: number;
    #max: number;
    #value: number;

    constructor(type: T, value?: number) {
        const config = RangeRegistry.getConfig(type);
        if (!config) {
            throw new Error(`Unknown range type: ${type}. Please register it first.`);
        }

        this.#type = type;
        this.#min = config.min;
        this.#max = config.max;
        this.#value = value !== undefined ? this.clamp(value) : config.default;
    }

    get value(): number {
        return this.#value;
    }

    set value(newValue: number) {
        this.#value = this.clamp(newValue);
    }

    get percentage(): number {
        if (this.#max === this.#min) return 1;
        return (this.#value - this.#min) / (this.#max - this.#min);
    }

    set percentage(percentage: number) {
        const clampedPercentage = Math.max(0, Math.min(1, percentage));
        this.#value = this.#min + clampedPercentage * (this.#max - this.#min);
    }

    get min(): number {
        return this.#min;
    }

    get max(): number {
        return this.#max;
    }

    private clamp(value: number): number {
        return Math.clamp(value, this.#min, this.#max);
    }

    add<T2 extends RelationAttribute>(other: number | NumberRange<T2>): NumberRange<T> {
        return new NumberRange(this.#type, this.#value + (typeof other === 'number' ? other : other.value));
    }

    subtract<T2 extends RelationAttribute>(other: number | NumberRange<T2>): NumberRange<T> {
        return new NumberRange(this.#type, this.#value - (typeof other === 'number' ? other : other.value));
    }

    multiply<T2 extends RelationAttribute>(other: number | NumberRange<T2>): NumberRange<T> {
        return new NumberRange(this.#type, this.#value * (typeof other === 'number' ? other : other.value));
    }

    divide<T2 extends RelationAttribute>(other: number | NumberRange<T2>): NumberRange<T> {
        const divisor = typeof other === 'number' ? other : other.value;
        if (divisor === 0) {
            throw new Error('Cannot divide by zero');
        }
        return new NumberRange(this.#type, this.#value / divisor);
    }

    normalize(targetMin: number, targetMax: number): number {
        return targetMin + this.percentage * (targetMax - targetMin);
    }

    // ============================== Overriding ===============================

    valueOf(): number {
        return this.#value;
    }

    toString(): string {
        return `${this.#value} [${this.#min}..${this.#max}]`;
    }

    equals<T2 extends RelationAttribute>(other: NumberRange<T2> | number): boolean {
        if (typeof other === 'number') {
            return this.#value === other;
        }
        return this.#value === other.#value && this.#min === other.#min && this.#max === other.#max;
    }

    clone(): NumberRange<T> {
        return new NumberRange(this.#type, this.#value);
    }
}

export function rangeFormat(min: number, max: number): string {
    return min.toString() + ":" + max.toString();
}