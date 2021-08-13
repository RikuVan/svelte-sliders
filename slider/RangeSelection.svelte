<script>
    import { getContext } from 'svelte';
    import { calcPercentOfRange } from './utils';

    /**
     * @typedef {import('svelte/store').Writable} Writable
     * @typedef {import('./types').SliderStoreState} SliderStoreState
     */

    /**
     * @type {string}
     */
    export let key;

    /**
     * @type {Writable<SliderStoreState>}
     */
    const sliderState = getContext(key);

    $: isRange = $sliderState.value.length !== 1;
    $: isVertical = $sliderState.orientation === 'vertical';

    /**
     * position the start and end of the track
     * @param {[number] | [number, number]} offsets
     */
    function getStyle(offsets) {
        let style = '';
        // this offset is the percent length of the track
        const offset = isRange ? offsets[1] - offsets[0] : offsets[0];
        style += isVertical ? `height: ${offset}%;` : `width: ${offset}%;`;
        if (isRange) {
            // adjust from 0 in styles to first handle
            style += isVertical ? `bottom: ${offsets[0]}%;` : `left: ${offsets[0]}%;`;
        }
        return style;
    }

    /**
     * @type {number}
     */
    $: offsets = $sliderState.value.map((_, i) => calcPercentOfRange($sliderState, i));
    /**
     * @type {number}
     */
    $: style = getStyle(offsets);
</script>

<div
    class={`range-selection range-selection-${$sliderState.orientation}`}
    class:range-disabled={$sliderState.disabled}
    {style}
/>

<style lang="scss">
    @use '_variables';
    $rail-size: 4px;

    .range-selection {
        position: absolute;
        background: variables.$main;
        border-radius: 2px;
        pointer-events: none;
    }
    .range-selection-horizontal {
        height: $rail-size;
        right: auto;
        left: 0px;
        top: 0px;
    }
    .range-selection-vertical {
        top: auto;
        bottom: 0px;
        width: $rail-size;
    }
    .range-disabled {
        background: variables.$disabled;
    }
</style>
