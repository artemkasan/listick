 #!/bin/bash 

cwd=$(pwd)

{
    echo "Clean listick"
    cd ./listick
    rm -rf node_modules 
    rm -rf coverage 
    rm -rf dist 
    rm -rf yarn.lock 

    echo "Clean listick-react"
    cd ../listick-react
    rm -rf node_modules
    rm -rf dist
    rm -rf coverage
    rm -rf yarn.lock

    echo "Clean listick-devtools"
    cd ../listick-devtools
    rm -rf node_modules
    rm -rf dist
    rm -rf yarn.lock

    echo "Clean listick-example"
    cd ../examples/listick-example
    rm -rf node_modules
    rm -rf dist
    rm -rf yarn.lock
    rm -rf app.js
    rm -rf app.js.map

    echo "Clean server rendering example"
    cd ../server-rendering
    rm -rf node_modules
    rm -rf bin
    rm -rf dist
    rm -rf obj
	rm -rf wwwroot/*
    rm -rf yarn.lock
} || {
    echo "Failed to clean the Listick"
}

cd $cwd