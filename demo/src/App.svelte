<script>
    import logo from './assets/svelte.png';
    import Counter from './lib/Counter.svelte';
    import { Slider } from 'attractions-slider';
    import { writable } from 'svelte/store';

    const store = writable();
    const store2 = writable();

    let disabled = false;

    function onClick() {
        disabled = !disabled;
    }
</script>

<main>
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
            min={10}
            max={90}
            value={[20, 40]}
            on:change={({ detail }) => ($store = detail)}
            ticks={{ mode: 'step', step: 10, map: val => `${val}%` }}
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
            {disabled}
        />
    </div>
    <div class="slider-2-data slider-data">
        <pre>{JSON.stringify($store2, null, 2)}</pre>
    </div>
</main>

<style lang="scss">
    :root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
            Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    main {
        display: grid;
        grid-template-columns: 400px 400px;
        padding: 3em;
        align-items: center;
        justify-content: center;
    }

    pre {
        padding: 3em;
    }

    .disable-button {
        grid-column: span 2;

        & > button {
            margin: 2em auto;
        }
    }

    .slider-container-horizontal {
        width: 800px;
        grid-column: span 2;
    }

    .slider-data {
        background: slategray;
        color: white;
        margin: 3em auto;
    }

    .slider-1-data {
        grid-column: span 2;
    }

    .slider-container-vertical {
        padding-top: 3em;
        height: 800px;
    }
</style>
