const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');

module.exports = (env) => {
	const isDevBuild = !(env && env.prod);
	const extractCSS = new ExtractTextPlugin('vendor.css');

	const commonConfig = {
		stats: {
			modules: false
		},
		resolve: {
			extensions: ['.js']
		},
		module: {
			rules: [{
				test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/,
				use: 'url-loader?limit=100000'
			}]
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
				'semantic-ui-css/semantic.css',
				'reflect-metadata',
				'listick',
				'listick-react',
				'listick-devtools'
			]
		},
		output: {
			filename: '[name].js',
			library: '[name]_[hash]'
		},
		plugins: [
			new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/,
				require.resolve('node-noop')), // Workaround for https://github.com/andris9/encoding/issues/16
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': isDevBuild ? '"development"' : '"production"'
			}),
		]
	};

	const clientConfig = merge(commonConfig, {
		output: {
			path: path.join(__dirname, 'wwwroot', 'dist'),
			publicPath: 'wwwroot/dist'
		},
		module: {
			rules: [{
				test: /\.css(\?|$)/,
				use: extractCSS.extract({
					use: isDevBuild ? 'css-loader' : 'css-loader?minimize'
				})
			}]
		},
		plugins: [
			extractCSS,
			new webpack.DllPlugin({
				path: path.join(__dirname, 'wwwroot', 'dist', '[name]-manifest.json'),
				name: '[name]_[hash]'
			})
		].concat(isDevBuild ? [
			// Plugins that apply in development builds only
			new webpack.SourceMapDevToolPlugin({
				filename: '[file].map', // Remove this line if you prefer inline source maps
				moduleFilenameTemplate: path.relative('wwwroot/dist',
					'[resourcePath]') // Point sourceMap entries to the original file locations on disk
			})
		] : [
			new webpack.optimize.UglifyJsPlugin()
		])
	});

	const serverConfig = merge(commonConfig, {
		target: 'node',
		resolve: {
			mainFields: ['main']
		},
		output: {
			path: path.join(__dirname, 'dist', 'server'),
			publicPath: 'dist/server/',
			libraryTarget: 'commonjs2',
		},
		module: {
			rules: [{
				test: /\.css(\?|$)/,
				use: isDevBuild ? 'css-loader' : 'css-loader?minimize'
			}]
		},
		entry: {
			vendor: [
				'react-dom/server'
			]
		},
		plugins: [
			new webpack.DllPlugin({
				path: path.join(__dirname, 'dist', 'server', '[name]-manifest.json'),
				name: '[name]_[hash]'
			})
		]
	});

	return [clientConfig, serverConfig];
};