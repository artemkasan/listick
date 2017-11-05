cd ./listick
yarn
yarn run build
yarn pack

cd ../listick-react
yarn
yarn run build
yarn pack

cd ../listick-example
yarn
webpack --config webpack.config.vendor.js
webpack
tsc app.ts