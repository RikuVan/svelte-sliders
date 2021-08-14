import { get, writable } from 'svelte/store';

import { createEventDispatcher } from 'svelte';
import { setContext } from 'svelte';

const events = ['change', 'start', 'stop', 'set'];

/**
 * @typedef {ReturnType<import('svelte').createEventDispatcher>} Dispatch
 * @typedef {import('svelte/store').Writable} Writable
 * @typedef {Partial<import('./types').SliderStoreState>} SliderStoreState
 */

/**
 * @param {string} key
 * @param {Partial<import('./types').SliderStoreState>} initial
 * @returns {[string, Writable<SliderStore>, Dispatch]}
 */
export function createContextStore(id, initial = {}) {
    const store = writable(initial);
    const dispatch = createEventDispatcher();
    const dispatcher = events.reduce((acc, event) => {
        acc[event] = (state = get(store)) => {
            const s = { ...state, value: unnestSingle(state.value) };
            dispatch(event, s);
        };
        return acc;
    }, {});
    const key = Object.freeze({ id });
    setContext(key, store);
    return [key, store, dispatcher];
}
/**
 * @param {SliderStoreState}
 */
export function validateProps({ min, max, step, orientation }) {
    if ([min, max].some(l => typeof l !== 'number').length) {
        warnOnce('min and max must be numbers');
    }
    if (step !== undefined && typeof step !== 'number') {
        warnOnce('step must be of type number: ', typeof step);
    }
    if (orientation !== undefined && orientation !== 'horizontal' && orientation !== 'vertical') {
        warnOnce('orientation must be either "horizontal" or "vertical"');
    }
}

/**
 *
 * @param {Object} obj
 * @returns {Object}
 */
const sortObjectKeys = obj =>
    Object.entries(obj)
        .sort()
        .reduce((o, [k, v]) => ((o[k] = v), o), {});

/**
 *
 * @param {any} val1
 * @param {any} val2
 * @returns {boolean}
 */

export function equal(val1, val2) {
    if (typeof val1 === 'number' && typeof val2 === 'number') return val1 === val2;
    if (typeof val1 === 'string' && typeof val2 === 'string') return val1 === val2;
    if (Array.isArray(val1) && Array.isArray(val2)) {
        return JSON.stringify(val1) === JSON.stringify(val2);
    }
    if (typeof val1 === 'object' && typeof val2 === 'object') {
        return JSON.stringify(sortObjectKeys(val1)) === JSON.stringify(sortObjectKeys(val2));
    }
    return false;
}

/**
 * create naive unique id
 * @param {string} prefix
 * @returns {string}
 */
export function createId(prefix) {
    return `${prefix}-${Math.floor(Math.random() * 10000000)}`;
}

/**
 * to use mouse and touch events in same handler
 * @param {MouseEvent | TouchEvent} e
 * @returns {Event}
 */
function normalizeEvent(e) {
    if (e.type.includes('touch')) {
        return e.touches[0];
    } else {
        return e;
    }
}
/**
 * get position of mouse or touch event
 * @param {boolean} vertical
 * @param {MouseEvent | TouchEvent} e
 * @returns {number}
 */
export function getPosition(vertical, e) {
    const normalizedE = normalizeEvent(e);
    return vertical ? normalizedE.clientY : normalizedE.pageX;
}

/**
 *  stop event
 * @param {Event} e
 */
export function stopEvent(e) {
    e.stopPropagation();
    e.preventDefault();
}
/**
 * if value is outside of range return min or max limit
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function ensureValueInRange(val, min, max) {
    if (val <= min) {
        return min;
    }
    if (val >= max) {
        return max;
    }
    return val;
}

/**
 * adjust resolution in-line with step
 * @param {number} step
 * @returns {number}
 */
export function getPrecision(step) {
    const stepString = step.toString();
    let precision = 0;
    if (stepString.indexOf('.') >= 0) {
        precision = stepString.length - stepString.indexOf('.') - 1;
    }
    return precision;
}
/**
 *
 * @param {any} v
 * @returns {any}
 */
export function noop(v) {
    return v;
}

/**
 * calculate all the possible values on the scale
 * @param {number} step
 * @param {SliderStoreState} store
 * @returns {number[]}
 */
function getSteps(step, { min, max }) {
    const steps = (max - min) / step;
    return [
        min,
        ...Array.from({ length: steps }, (_, i) => min + (i + 1) * step).filter(s => s <= max),
    ];
}

/**
 *  get list of ticks based on the ticks 'mode'
 * @param {SliderStoreState} ticks
 * @returns {number[]}
 */
export function getTickValues({ ticks, min, max }) {
    const { mode, step, filter, values } = ticks;
    const f = filter ? list => list.filter(filter) : noop;
    return mode === 'step' ? f(getSteps(step, { min, max })) : mode === 'values' ? f(values) : [];
}

/**
 * find the closest step, including ticks, to a selected point
 * @param {number} val
 * @param {SliderStoreState} store
 * @returns {number}
 */
export function getClosestPoint(val, { ticks, step, min, max }) {
    const points = getTickValues({ ticks, min, max });
    if (step !== null) {
        const baseNum = 10 ** getPrecision(step);
        const maxSteps = Math.floor((max * baseNum - min * baseNum) / (step * baseNum));
        const steps = Math.min((val - min) / step, maxSteps);
        const closestStep = Math.round(steps) * step + min;
        points.push(closestStep);
    }
    const diffs = points.map(point => Math.abs(val - point));
    return points[diffs.indexOf(Math.min(...diffs))];
}

/**
 * convert from slider value to percentage of min between max
 * used for ticks too which are not an array value
 * @param {SliderStoreState} store
 * @param {number} index
 * @returns {number}
 */
export function calcPercentOfRange({ value, min, max }, index = 0) {
    const current = Array.isArray(value) ? value[index] : value;
    const ratio = (current - min) / (max - min);
    return Math.max(0, ratio * 100);
}

/**
 * if a single handle give user value unnested
 * @param {number | number[]} value
 * @returns {number | number[]}
 */
export function unnestSingle(value) {
    return value.length === 1 ? value[0] : value;
}

/**
 * @param {number} val
 * @param {Object} props
 * @returns {number}
 */
export function ensureValuePrecision(val, props) {
    const { step } = props;
    const possiblePoint = getClosestPoint(val, props);
    const closestPoint = isFinite(possiblePoint) ? possiblePoint : 0;
    return step === null ? closestPoint : parseFloat(closestPoint.toFixed(getPrecision(step)));
}

/**
 * @type Record<string, string>
 */
export const warnOnceWarnings = {};
/**
 * warn once in development
 * @param {string} msg
 */
export function warnOnce(msg) {
    if (process.env.NODE_ENV === 'development' && Boolean(msg) && !warnOnceWarnings[msg]) {
        warnOnceWarnings[msg] = true;
        // eslint-disable-next-line no-console
        console.warn(`slider: ${msg}`);
    }
}

/**
 * @param {number} value
 * @param {[number] | [number, number]} handleValues
 * @returns {number}
 */
export function getClosestHandle(value, handleValues) {
    let closestHandleIndex = 0;
    for (let i = 1; i < handleValues.length - 1; i += 1) {
        if (value >= handleValues[i]) {
            closestHandleIndex = i;
        }
    }
    if (
        Math.abs(handleValues[closestHandleIndex + 1] - value) <
        Math.abs(handleValues[closestHandleIndex] - value)
    ) {
        closestHandleIndex += 1;
    }
    return closestHandleIndex;
}

/**
 * key-codes for keyboard navigation of slider
 * @type Record<string, number>
 */

export const keyCode = {
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
};

/**
 * Filters out falsy classes.
 * @param {...(string | false | null)} args The classes to be filtered
 * @return {string} The classes without the falsy values
 */
export function classes(...args) {
    return args.filter(cls => !!cls).join(' ');
}
