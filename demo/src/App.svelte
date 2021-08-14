<script>
    import logo from './assets/svelte.png';
    import Counter from './lib/Counter.svelte';
    import Layout from './Layout.svelte';
    import { Slider, TimeSlider } from 'attractions-slider';
    import { writable } from 'svelte/store';
    import { subHours } from 'date-fns';

    const store = writable();
    const store2 = writable();
    const store3 = writable();

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
    <h1>2-handle range Slider</h1>
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
    <div class="span-2 slider-data">
        <pre>{JSON.stringify($store, null, 2)}</pre>
    </div>
    <h1>1-handle Slider</h1>
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
            ticks={{ mode: 'step', step: 100, map: val => `${val} €` }}
            tooltips={{ show: 'active', map: val => `${val} €` }}
            {disabled}
        />
    </div>
    <div class="slider-data">
        <pre>{JSON.stringify($store2, null, 2)}</pre>
    </div>
    <h1>TimeSlider</h1>
    <div class="slider-container-horizontal-lg">
        <TimeSlider
            id="time-example"
            minDate={subHours(new Date(), 6)}
            maxDate={new Date()}
            timeStep="5m"
            tickTimeStep="1hr"
            startTimes={[subHours(new Date(), 2), subHours(new Date(), 4)]}
            dateFormat="ccc HH:mm"
            on:change={({ detail }) => {
                $store3 = detail;
            }}
            {disabled}
        />
    </div>
    <div class="slider-data span-2">
        <pre>{JSON.stringify($store3, null, 2)}</pre>
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

    .slider-container-horizontal-lg {
        min-width: 600px;
        width: 100%;
        grid-column: span 2;
    }

    .span-2,
    h1 {
        grid-column: span 2;
    }

    .slider-data {
        margin: 3em auto;
    }

    .slider-2-data {
        margin-left: auto;
        margin-right: 0;
    }

    .slider-container-vertical {
        padding: 3em 0 5em 0;
        height: 400px;
    }
</style>
