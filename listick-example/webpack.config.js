const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

module.exports = (env) =>
{
	const isDevBuild = !(env && env.prod);

	const extractSass = new ExtractTextPlugin({
		filename: 'site.css'
	});

	const clientConfig =
		{
			resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx','.scss'] },
			stats: { modules: false },
			entry: { 'main-client': './client/boot-client.tsx' },
			module: {
				rules: [
					{
						test: /\.scss$/,
						use: extractSass.extract({
							use: [
								(isDevBuild ? 'css-loader' : 'css-loader?minimize'),
								'resolve-url-loader',
								'sass-loader?sourceMap'],
							// use style-loader in development
							fallback: "style-loader"
						})
					},
					{ test: /\.tsx?$/, include: /client/, use: 'awesome-typescript-loader?silent=true' },
					{ test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' }
				]
			},
			output: {
				path: path.join(__dirname, 'dist'),
				filename: '[name].js',
				publicPath: 'dist/' // Webpack dev middleware, if enabled, handles requests for this URL prefix
			},
			plugins: [
				new CheckerPlugin(),
				extractSass,
				new webpack.DllReferencePlugin({
					context: __dirname,
					manifest: require('./dist/vendor-manifest.json')
				})
			].concat(isDevBuild
				? [
					// Plugins that apply in development builds only
					new webpack.SourceMapDevToolPlugin({
						filename: '[file].map', // Remove this line if you prefer inline source maps
						moduleFilenameTemplate:
							path.relative('dist',
								'[resourcePath]') // Point sourcemap entries to the original file locations on disk
					})
				]
				: [
					// Plugins that apply in production builds only
					new webpack.optimize.UglifyJsPlugin()
				])
		};

	return clientConfig;
};