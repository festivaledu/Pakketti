import commonjs from 'rollup-plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import less from 'rollup-plugin-less'; // Transpile/polyfill with reasonable browser support
export default {
    input: 'src/index.js', // Path relative to package.json
    output: {
        name: 'metroUI-vue',
        exports: 'named',
    },
    plugins: [
		less({
			output: "dist/metroui-vue.css",
			option: {
				javascriptEnabled: true
			}
		}),
        commonjs(),
        vue({
            css: true, // Dynamically inject css as a <style> tag
            compileTemplate: true, // Explicitly convert template to render function
        })
    ],
};