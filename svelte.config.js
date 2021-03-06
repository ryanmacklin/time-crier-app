import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		floc: true,
		adapter: adapter({
			// if true, will split your app into multiple functions
			// instead of creating a single one for the entire app
			split: false
		}),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		vite: {
            define: {
                'process.env': {}
            },
            server: {
                hmr: {
					clientPort: process.env.HMR_HOST ? 443 : 24678,
					host: process.env.HMR_HOST ? process.env.HMR_HOST.substring("https://".length) : "localhost"
				}
            }
        }
	}
};

export default config;
