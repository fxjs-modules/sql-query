const util = require('util');
const path = require('path');
const builtinModules = require('@fibjs/builtin-modules')

const { default: rollup, plugins } = require('fib-rollup')

const commonjs = require('rollup-plugin-commonjs');

// yes, just use top-level await!
// get rollup instance `bundle`
const bundle = await rollup.rollup({
    input: path.resolve(__dirname, './lib/Query.js'),
    external: builtinModules.concat([
        'module'
    ]),
    plugins: [
        plugins['rollup-plugin-fibjs-resolve'](),
        commonjs(),
        plugins['rollup-plugin-uglify-es']()
    ]
}).catch(e => console.error(e));

// write bundled result with `bundle.write`
await bundle.write({
    file: path.resolve(__dirname, './lib/index.umd.js'),
    name: 'FxSqlQuery',
    format: 'umd'
}).catch(e => console.error(e));
