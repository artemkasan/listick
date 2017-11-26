 #!/bin/bash 

cwd=$(pwd)

{
    echo "Build and pack listick"
    cd ./listick
    yarn
    yarn build
    yarn link

    echo "Build and pack listick-react"
    cd ../listick-react
    yarn install
    yarn link "listick"
    yarn build
    yarn link

    echo "Build and pack listick-devtools"
    cd ../listick-devtools
    yarn install
    yarn link "listick"
    yarn build
    yarn link

    echo "Build and pack listick-example"
    cd ../examples/listick-example
    yarn install
    yarn link "listick"
    yarn link "listick-react"
    yarn link "listick-devtools"
    yarn build

    echo "Build and pack server rendering example"
    cd ../server-rendering
    yarn install
    yarn link "listick"
    yarn link "listick-react"
    yarn link "listick-devtools"
    yarn build
} || {
    echo "Failed to compile the Listick"
}

cd $cwd