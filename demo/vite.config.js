import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    // to match github page root
    base: mode === 'production' ? '/svelte-sliders/' : '/',
    plugins: [
        svelte({
            preprocess: sveltePreprocess(),
        }),
    ],
}));
