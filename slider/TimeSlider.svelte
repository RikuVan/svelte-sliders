<script>
    import { createEventDispatcher } from 'svelte';
    import Slider from './Slider.svelte';
    import { parse } from './ms';
    import { toDate, addHours, isValid, format } from 'date-fns';
    import { noop, getSteps } from './utils';

    const dispatch = createEventDispatcher();

    /**
     * @typedef {number | Date} Time
     */

    /**
     * @type {string}
     */
    export let id;
    /**
     * @type {number}
     */
    export let minDate = new Date();
    /**
     * @type {number}
     */
    export let maxDate = addHours(new Date(), 1);
    /**
     * @type {Time[]}
     */
    export let startTimes = [minDate, maxDate];
    /**
     * @type {string}
     */
    export let timeStep = '1m';
    /**
     * @type {string}
     */
    export let tickTimeStep;
    /**
     * @type {import("./types").SliderOrientation}
     */
    export let orientation = 'horizontal';
    /**
     * @type {string | (date: Date) => string | number}
     */
    export let dateFormat = noop;
    /**
     * @type {boolean}
     */
    export let disabled = false;

    let _class = null;
    export { _class as class };

    /**
     * @param {Time} time
     * @returns {number}
     */
    function toMs(time) {
        if (isValid(time)) return toDate(time).getTime();
        else throw Error('Invalid Date or timestamp');
    }

    $: value = startTimes.map(toMs);
    $: min = toMs(minDate);
    $: max = toMs(maxDate);
    $: formatter =
        typeof dateFormat === 'string' ? ms => format(toDate(ms), dateFormat) : dateFormat;
    $: ticks = {
        mode: 'values',
        values: getSteps(parse(tickTimeStep), { max, min }),
        map: formatter,
    };
    $: step = parse(timeStep);
    $: tooltips = {
        show: 'active',
        map: formatter,
    };

    /**
     * @type {(event: 'change' | 'start' | 'end') => (e: CustomEvent) => void}
     */
    function makeEventHandler(event) {
        // re-dispatch to map milliseconds back to Date objects
        return function onEvent({ detail }) {
            if (detail) {
                dispatch(event, {
                    ...detail,
                    value: detail.value.map(ms => toDate(Number(ms))),
                });
            }
        };
    }
</script>

<Slider
    {id}
    {min}
    {max}
    {value}
    {step}
    {ticks}
    {orientation}
    {disabled}
    {tooltips}
    class={_class}
    on:change={makeEventHandler('change')}
    on:start={makeEventHandler('start')}
    on:stop={makeEventHandler('stop')}
/>
