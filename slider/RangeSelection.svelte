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

    /**
     * @type {number}
     */
    $: offset = calcPercentOfRange($sliderState);
    /**
     * @type {number}
     */
    $: length =
        $sliderState.orientation === 'vertical' ? `height:${offset}%;` : `width:${offset}%;`;
</script>

<div
    class={`range-selection range-selection-${$sliderState.orientation}`}
    class:range-disabled={$sliderState.disabled}
    style={length}
/>

<style lang="scss">
    @use '_variables';

    .range-selection {
        position: absolute;
        background: variables.$main;
        border-radius: 2px;
    }
    .range-selection-horizontal {
        height: 4px;
        right: auto;
        left: 0px;
        top: 0px;
    }
    .range-selection-vertical {
        top: auto;
        bottom: 0px;
        width: 4px;
    }
    .range-disabled {
        background: variables.$disabled;
    }
</style>
