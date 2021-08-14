<main>
    <slot />
</main>

<style>
    :root {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
            Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    main {
        display: grid;
        grid-template-columns: minmax(1fr, 400px) minmax(1fr, 400px);
        padding: 3em;
        align-items: center;
        justify-content: center;
        background: #f7f7f7;
    }
</style>
