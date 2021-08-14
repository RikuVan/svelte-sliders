<script>
    import logo from './assets/svelte.png';
    import Counter from './lib/Counter.svelte';
    import Layout from './Layout.svelte';
    import { Slider } from 'attractions-slider';
    import { writable } from 'svelte/store';

    const store = writable();
    const store2 = writable();

    let disabled = false;

    function onClick() {
        disabled = !disabled;
    }
</script>

<Layout>
    <div class="disable-button">
        <button on:click={onClick}>
            {#if disabled}
                enable sliders
            {:else}
                disable sliders
            {/if}
        </button>
    </div>
    <div class="slider-container-horizontal">
        <Slider
            id="example"
            min={-30}
            max={50}
            value={[20, 40]}
            on:change={({ detail }) => ($store = detail)}
            ticks={{ mode: 'step', step: 10, map: val => `${val}°` }}
            tooltips={{ show: 'active' }}
            {disabled}
        />
    </div>
    <div class="slider-1-data slider-data">
        <pre>{JSON.stringify($store, null, 2)}</pre>
    </div>
    <div class="slider-container-vertical">
        <Slider
            id="example2"
            min={0}
            max={1000}
            value={0}
            orientation="vertical"
            on:change={({ detail }) => ($store2 = detail)}
            on:start={({ detail }) => console.log('start', detail)}
            on:stop={({ detail }) => console.log('stop', detail)}
            on:set={({ detail }) => console.log('set', detail)}
            ticks={{ mode: 'step', step: 100, map: val => `${val} €` }}
            tooltips={{ show: 'active', map: val => `${val} €` }}
            {disabled}
        />
    </div>
    <div class="slider-2-data slider-data">
        <pre>{JSON.stringify($store2, null, 2)}</pre>
    </div>
</Layout>

<style lang="scss">
    pre {
        padding: 3em;
        background: #decef9;
        color: #4300b0;
        border: 0;
    }

    .disable-button {
        grid-column: span 2;

        & > button {
            margin: 2em auto;
        }
    }

    .slider-container-horizontal {
        min-width: 400px;
        width: 100%;
        grid-column: span 2;
    }

    .slider-data {
        margin: 3em auto;
    }

    .slider-2-data {
        margin-left: auto;
        margin-right: 0;
    }

    .slider-1-data {
        grid-column: span 2;
    }

    .slider-container-vertical {
        padding-top: 3em;
        height: 400px;
    }
</style>
