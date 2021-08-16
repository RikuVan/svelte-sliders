<script>
    import { onMount } from 'svelte';
    import RangeSelection from './RangeSelection.svelte';
    import Ticks from './Ticks.svelte';
    import Rail from './Rail.svelte';
    import Handle from './Handle.svelte';
    import {
        getPosition,
        stopEvent,
        ensureValueInRange,
        ensureValuePrecision,
        createId,
        keyCode,
        createContextStore,
        validateProps,
        equal,
        getClosestHandle,
        classes,
    } from './utils';

    /**
     * @typedef {import('./types').SliderStoreState} State
     */

    /**
     * @type {number}
     */
    export let min = 0;
    /**
     * @type {number}
     */
    export let max = 100;
    /**
     * @type {number}
     */
    export let step = 1;
    /**
     * @type {import("./types").SliderOrientation}
     */
    export let orientation = 'horizontal';
    /**
     * @type {boolean}
     */
    export let disabled = false;
    /**
     * @type {number | [number, number]}
     */
    export let value = 50;
    /**
     * @type {number}
     */
    export let dragOffset = 0;
    /**
     * in 'step' mode, a value step which is used to add a tick at that interval from min to max
     * in 'values' mode, a list of all the values where ticks should be placed is provided from min to max
     * subDensity creates sub-ticks with a number that represents a percent interval on a 0-100 scale, e.g. 3 is every 3 percent
     * in order for sub-ticks to be in sync with with ticks the tick should be a multiple of the sub-ticks
     * @type {import("./types").TickConfig}
     */
    export let ticks = {
        mode: 'none',
    };
    /**
     * @type {string}
     */
    export let id = createId('slider');
    /**
     * @type {boolean}
     */
    export let dedupe = true;
    /**
     * @type {import('./types').RangeBehavior}
     */
    export let rangeBehavior = 'block';
    /**
     * @type {boolean}
     */
    export let tooltips = { show: 'never' };

    let _class = null;
    export { _class as class };

    $: value = typeof value === 'number' ? [value] : value.slice(0, 2);
    $: isRange = value.length > 1;

    /**
     * @type {HTMLDivElement}
     */
    let slider;
    /**
     * @type {boolean}
     */
    let sliderActive = false;
    /**
     * @type {number}
     */
    let activeHandle = value[0] === max ? 0 : value.length - 1;

    let [key, store, dispatcher] = createContextStore(id, {
        initialValue: value,
        value,
        min,
        max,
        activeHandle,
        disabled,
        orientation,
        tooltips,
        step,
        ticks,
    });

    $: vertical = orientation === 'vertical';

    // updateable props
    $: $store.disabled = disabled;
    $: $store.step = step;
    $: $store.ticks = ticks;
    $: $store.value = [...value];
    $: $store.min = min;
    $: store.max = max;

    /**
     * @type {State}
     */
    let lastState = {};

    onMount(() => {
        validateProps($$props);
        const unsubscribe = store.subscribe(state => {
            // if user clicks handle and lets go without changing position
            // this will be deduped, but start and stop will fire
            if (dedupe && equal(lastState, state)) return;
            dispatcher.change(state);
            lastState = { ...state };
        });
        return () => {
            unsubscribe();
        };
    });

    /**
     * @param {Event} e
     */
    function onStart(e) {
        if (!sliderActive) {
            sliderActive = true;
            const pos = getPosition(vertical, e);
            const nextValue = calcValByPos(pos - dragOffset);
            $store.activeHandle = getClosestHandle(nextValue, $store.value);
            dispatcher.start();
        }
    }

    /**
     * normalize value
     * @param {number} v
     */
    function trimAlignValue(v) {
        if (v === null) {
            return null;
        }
        const val = ensureValueInRange(v, min, max);
        return ensureValuePrecision(val, $store);
    }
    /**
     * get the position of min in dom
     * @return {number}
     */
    function getSliderStart() {
        const rect = slider.getBoundingClientRect();
        if (vertical) {
            return rect.top;
        }
        return window.pageXOffset + rect.left;
    }

    /**
     * get length of slider from min to max in dom
     * @return {number}
     */
    function getSliderLength() {
        if (!slider) {
            return 0;
        }
        const { height, width } = slider.getBoundingClientRect();
        return vertical ? height : width;
    }

    /**
     * @param {number}
     * @return {number}
     */
    function calcValue(offset) {
        const ratio = Math.abs(Math.max(offset, 0) / getSliderLength());
        const value = vertical ? (1 - ratio) * (max - min) + min : ratio * (max - min) + min;
        return value;
    }

    /**
     * @param {number}
     * @return {number}
     */
    function calcValByPos(position) {
        const pixelOffset = position - getSliderStart();
        return trimAlignValue(calcValue(pixelOffset));
    }

    /**
     * change value based on mouse position, causing handle to move
     * @param {Event} e
     */
    function onMove(e) {
        if (disabled || !sliderActive) {
            return;
        }
        const pos = getPosition(vertical, e);
        const nextValue = calcValByPos(pos - dragOffset);
        stopEvent(e);
        moveHandle($store.activeHandle, nextValue);
    }

    /**
     * @param {number} index
     * @param {number} nextValue
     */
    function moveHandle(index, nextValue) {
        if (nextValue == $store.value[index]) return;
        let next = [...$store.value];
        next[index] = nextValue;
        let skip = false;
        if (isRange && rangeBehavior !== 'free') {
            next.forEach((handle, handleIndex) => {
                if (handleIndex === index) return;
                const direction = handle < $store.value[index] ? '<-' : '->';
                const willCrossOver =
                    direction === '<-'
                        ? handle => handle >= nextValue
                        : handle => handle <= nextValue;
                if (rangeBehavior === 'push' && willCrossOver(handle)) {
                    if (direction === '<-') {
                        next[handleIndex] = next[index] - 1;
                    } else {
                        next[handleIndex] = next[index] + 1;
                    }
                } else if (rangeBehavior === 'block' && willCrossOver(handle)) {
                    skip = true;
                }
            });
        }
        if (!skip) $store.value = next;
    }

    /**
     * @param {Event}
     */
    function onEnd(e) {
        const el = e.target;
        if (sliderActive) {
            if (el === slider || slider.contains(el)) {
                onMove(e);
            }
            dispatcher.stop();
            sliderActive = false;
        }
    }

    /**
     * @param {Event}
     */
    function onKeyDown(e) {
        if (disabled) return;
        let value = undefined;
        switch (e.keyCode) {
            case keyCode.UP:
            case keyCode.RIGHT:
                value = $store.value[$store.activeHandle] += step;
                break;
            case keyCode.DOWN:
            case keyCode.LEFT:
                value = $store.value[$store.activeHandle] -= step;
                break;
            case keyCode.END:
                value = max;
                break;
            case keyCode.HOME:
                value = min;
                break;
            case keyCode.PAGE_UP:
                value = $store.value[$store.activeHandle] += step * 2;
                break;
            case keyCode.PAGE_DOWN:
                value = $store.value[$store.activeHandle] -= step * 2;
                break;
        }
        if (value !== undefined) {
            moveHandle($store.activeHandle, value);
        }
        stopEvent(e);
    }
</script>

<div
    bind:this={slider}
    {id}
    class={classes(`slider slider-${orientation}`, _class)}
    on:ontouchstart={onStart}
    on:mousedown={onStart}
    on:keydown={onKeyDown}
    class:slider-active={$store.sliderActive}
    class:slider-disabled={$store.disabled}
>
    <Rail {key} />
    {#each value as _, index}
        <Handle {key} {index} />
    {/each}
    <RangeSelection {key} />
    <Ticks {key} />
</div>

<svelte:window on:mousemove={onMove} on:touchmove={onMove} on:mouseup={onEnd} on:touchend={onEnd} />

<style lang="scss">
    .slider {
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;
        user-select: none;
        box-sizing: border-box;
        height: 10px;
        position: relative;
        padding: 4px 0;
        cursor: pointer;
        touch-action: none;
    }
    .slider-horizontal {
        width: 100%;
        height: 10px;
    }
    .slider-vertical {
        width: 10px;
        height: 100%;
    }

    .slider-disabled {
        cursor: not-allowed;
    }
</style>
