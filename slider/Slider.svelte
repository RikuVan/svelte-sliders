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
    } from './utils';

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
     * @type {number}
     */
    export let value = 0;
    /**
     * @type {number}
     */
    export let dragOffset = 0;
    /**
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

    let [key, store, dispatcher] = createContextStore(id, {
        initialValue: value,
        value,
        min,
        max,
        disabled,
        orientation,
        step,
        ticks,
    });
    let slider;
    let sliderActive;

    $: vertical = orientation === 'vertical';

    // updateable props
    $: $store.disabled = disabled;
    $: $store.step = step;
    $: $store.ticks = ticks;
    $: $store.value = value;
    $: $store.min = min;
    $: store.max = max;

    /**
     * @type {import('./types').SliderStoreState}
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

    function onStart() {
        if (!sliderActive) {
            sliderActive = true;
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
        if (nextValue == value) return;
        $store.value = nextValue;
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
        switch (e.keyCode) {
            case keyCode.UP:
            case keyCode.RIGHT:
                $store.value += step;
                break;
            case keyCode.DOWN:
            case keyCode.LEFT:
                $store.value -= step;
                break;
            case keyCode.END:
                $store.value = max;
                break;
            case keyCode.HOME:
                $store.value = min;
                break;
            case keyCode.PAGE_UP:
                $store.value += step * 2;
                break;
            case keyCode.PAGE_DOWN:
                $store.value -= step * 2;
                break;
        }
        stopEvent(e);
    }
</script>

<div
    bind:this={slider}
    {id}
    class={`slider slider-${orientation}`}
    on:ontouchstart={onStart}
    on:mousedown={onStart}
    on:keydown={onKeyDown}
>
    <Rail {key} />
    <Handle {key} />
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
</style>
