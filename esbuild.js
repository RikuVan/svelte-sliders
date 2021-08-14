const esbuild = require('esbuild');
const sveltePlugin = require('esbuild-svelte');
const pkg = require('./package.json');
const config = require('./svelte.config.js');

const isDev = process.env.NODE_ENV === '"development"';

(async () => {
    const base = {
        entryPoints: ['slider/index.js'],
        minify: !isDev,
        bundle: true,
        external: ['svelte', 'svelte/*'],
        plugins: [
            sveltePlugin({
                preprocess: config.createPreprocessors(true),
                compileOptions: {
                    dev: false,
                    css: true,
                },
            }),
        ],
    };

    await esbuild.build({
        ...base,
        outfile: pkg.module,
        logLevel: 'info',
        watch: isDev
            ? {
                  onRebuild(error, _result) {
                      if (error) console.error('watch build failed:', error);
                  },
              }
            : false,
        format: 'esm',
    });

    if (!isDev) {
        await esbuild.build({
            ...base,
            outfile: pkg.main,
            format: 'cjs',
        });
    }
})();
