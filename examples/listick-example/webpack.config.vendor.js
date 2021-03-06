const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env) =>
{
	const isDevBuild = !(env && env.prod);
	const extractCSS = new MiniCssExtractPlugin({
		filename:'vendor.css', 
		chunkFilename: "[id].css"
	});


	const clientConfig = {
		mode: isDevBuild ? "development" : "production",
		stats: { modules: false },
		resolve: { extensions: ['.js'] },
		module: {
			rules: [
				{ test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/, use: 'url-loader?limit=100000' },
				{ test: /\.s?[ac]ss$/, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader',] }
			]
		},
		entry: {
			vendor: [
				'babel-polyfill',
				'isomorphic-fetch',
				'react',
				'react-dom',
				'history',
				'react-router-dom',
				'semantic-ui-react',
				'reflect-metadata',
				'listick',
				'listick-react'
			]
		},
		output: {
			path: path.join(__dirname, 'dist'),
			publicPath: 'dist/',
			filename: '[name].js',
			library: '[name]_[hash]'
		},
		plugins: [
			new webpack.ProvidePlugin(
				{
					$: 'jquery',
					jQuery: 'jquery',
					'window.jQuery':'jquery'
				}), // Maps these identifiers to the jQuery package (because Bootstrap expects it to be a global variable)
			new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/,
				require.resolve('node-noop')), // Workaround for https://github.com/andris9/encoding/issues/16
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': isDevBuild ? '"development"' : '"production"'
			}),
			extractCSS,
			new webpack.DllPlugin({
				path: path.join(__dirname, 'dist', '[name]-manifest.json'),
				name: '[name]_[hash]'
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
				new webpack.optimize.UglifyJsPlugin()
			])
	};
	return clientConfig;
};