const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;

module.exports = (env) =>
{
	const isDevBuild = !(env && env.prod);

	const extractSass = new MiniCssExtractPlugin({
		filename: 'site.css',
		chunkFilename: "[id].css"
	});

	const clientConfig =
		{
			mode: isDevBuild ? "development" : "production",
			resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx','.scss'] },
			stats: { modules: false },
			entry: { 'main-client': './client/boot-client.tsx' },
			module: {
				rules: [
					{
						test: /\.s?[ac]ss$/,
						use: [
							MiniCssExtractPlugin.loader,
							'css-loader',
							'sass-loader',
						]
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