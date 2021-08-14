<script>
    import { getContext } from 'svelte';
    import { calcPercentOfRange, getTickValues } from './utils';

    /**
     * @typedef {import('svelte/store').Writable} Writable
     * @typedef {import('./types').SliderStoreState} SliderStoreState
     * @typedef {import('./types').SliderOrientation} SliderOrientation
     */

    /**
     * @type {string}
     */
    export let key;
    /**
     * @type {SliderOrientation}
     */
    export let orientation = 'horizontal';

    /**
     * @type {Writable<SliderStoreState>}
     */
    const sliderState = getContext(key);

    $: ticks = getTickValues($sliderState);
    /**
     * @type {SliderOrientation}
     */
    $: orientation = $sliderState.orientation;
</script>

{#each ticks as value, i}
    <span
        class={`tick tick-${orientation}`}
        class:tick-disabled={$sliderState.disabled}
        style="{orientation === 'vertical' ? 'bottom' : 'left'}: {calcPercentOfRange({
            ...$sliderState,
            value,
        })}%;"
    >
        <span
            class={`tick-value tick-value-${orientation}`}
            class:tick-value-disabled={$sliderState.disabled}
        >
            {$sliderState.ticks.map ? $sliderState.ticks.map(value, i) : value}
        </span>
    </span>
{/each}

<style>
    .tick {
        position: absolute;
        background: gray;
    }
    .tick-horizontal {
        position: absolute;
        height: 8px;
        right: auto;
        bottom: auto;
        top: 10px;
        width: 1px;
        white-space: nowrap;
    }
    .tick-vertical {
        height: 1px;
        width: 8px;
        left: 10px;
        right: auto;
        bottom: 100%;
    }
    .tick-value {
        position: absolute;
        color: gray;
        background: none;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
    .tick-value-horizontal {
        transform: translate(-50%, 50%);
        top: 2px;
    }
    .tick-value-vertical {
        top: 0;
        left: 12px;
        transform: translate(0%, -50%);
    }
    .tick-disabled {
        background: #cfcfcf;
    }
    .tick-value-disabled {
        color: #cfcfcf;
    }
</style>
