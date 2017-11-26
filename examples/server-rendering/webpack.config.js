const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const merge = require('webpack-merge');

module.exports = (env) => {
	const isDevBuild = !(env && env.prod);

	const extractSass = new ExtractTextPlugin({
		filename: 'site.css'
	});

	const commonConfig = {
		resolve: {
			extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss']
		},
		module: {
			rules: [{
				test: /\.tsx?$/,
				include: /client/,
				use: 'awesome-typescript-loader?silent=true'
			}, ]
		},
		stats: {
			modules: false
		},
		output: {
			filename: '[name].js',
		},
		plugins: [
			new CheckerPlugin()
		]
	};

	const clientConfig = merge(commonConfig, {
		entry: {
			'main-client': './client/boot-client.tsx'
		},
		module: {
			rules: [{
					test: /\.scss$/,
					use: extractSass.extract({
						use: [
							(isDevBuild ? 'css-loader' : 'css-loader?minimize'),
							'resolve-url-loader',
							'sass-loader?sourceMap'
						],
						// use style-loader in development
						fallback: "style-loader"
					})
				},
				{
					test: /\.(png|jpg|jpeg|gif|svg)$/,
					use: 'url-loader?limit=25000'
				}]
		},
		output: {
			path: path.join(__dirname, 'wwwroot', 'dist'),
			publicPath: 'wwwroot/dist'
		},
		plugins: [
			extractSass,
			new webpack.DllReferencePlugin({
				context: __dirname,
				manifest: require('./wwwroot/dist/vendor-manifest.json')
			})
		].concat(isDevBuild ? [
			// Plugins that apply in development builds only
			new webpack.SourceMapDevToolPlugin({
				filename: '[file].map', // Remove this line if you prefer inline source maps
				moduleFilenameTemplate: path.relative( 'wwwroot', 'dist',
					'[resourcePath]') // Point sourcemap entries to the original file locations on disk
			})
		] : [
			// Plugins that apply in production builds only
			new webpack.optimize.UglifyJsPlugin()
		])

	});

	const serverConfig = merge(commonConfig, {
		resolve: { mainFields: ['main'] },
		entry: { 'main-server': './client/boot-server.tsx' },
		output: {
			libraryTarget: 'commonjs',
			path: path.join(__dirname, 'dist', 'server')
		},
		plugins: [
			new webpack.DllReferencePlugin({
				context: __dirname,
				manifest: require('./dist/server/vendor-manifest.json'),
				sourceType: 'commonjs2',
				name: './vendor'
			}),
		],
		target: 'node',
		devtool: 'inline-source-map'
	});

	return [clientConfig, serverConfig];
};