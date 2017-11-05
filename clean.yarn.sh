cd ./listick
rm -rf node_modules
rm -rf dist
rm -rf coverage
rm -rf yarn.lock
rm -rf *.tgz

cd ../listick-react
rm -rf node_modules
rm -rf dist
rm -rf coverage
rm -rf yarn.lock
rm -rf *.tgz

cd ../listick-example
rm -rf node_modules
rm -rf dist
rm -rf yarn.lock
rm -rf app.js
rm -rf app.js.map

yarn cache clean