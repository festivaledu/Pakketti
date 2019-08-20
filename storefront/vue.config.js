module.exports = {
	css: {
		loaderOptions: {
			less: {
				javascriptEnabled: true
			}
		}
	},
	configureWebpack: (config) => {
		config.devtool = 'source-map'
	},
}