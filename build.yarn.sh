cd ./listick
yarn
yarn pack

cd ../listick-react
yarn
yarn pack

cd ../listick-example
yarn
webpack --config webpack.config.vendor.js
webpack
tsc app.ts