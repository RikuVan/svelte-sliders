<script>
    import { getContext } from 'svelte';

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
</script>

<div class={`rail rail-${$sliderState.orientation}`} class:rail-disabled={$sliderState.disabled}>
    <slot />
</div>

<style lang="scss">
    @use '_variables';
    $rail-size: 4px;

    .rail {
        position: absolute;
        background: lightslategray;
        border-radius: 2px;
    }

    .rail-horizontal {
        width: 100%;
        height: $rail-size;
        top: 0;
    }

    .rail-vertical {
        height: 100%;
        width: $rail-size;
        left: 0;
        top: 0;
    }

    .rail-disabled {
        background: #cfcfcf;
        cursor: not-allowed;
    }
</style>
