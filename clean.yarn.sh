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
    cd ../listick-example
    rm -rf node_modules
    rm -rf dist
    rm -rf yarn.lock
    rm -rf app.js
    rm -rf app.js.map
} || {
    echo "Failed to clean the Listick"
}

cd $cwd