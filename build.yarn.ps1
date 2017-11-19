Push-Location

Write-Output "Build and pack listick"
Set-Location ./listick
yarn
yarn build
yarn link

Write-Output "Build and pack listick-react"
Set-Location ../listick-react
yarn install
yarn link "listick"
yarn build
yarn link

Write-Output "Build and pack listick-devtools"
Set-Location ../listick-devtools
yarn install
yarn link "listick"
yarn build
yarn link

Write-Output "Build and pack listick-example"
Set-Location ../examples/listick-example
yarn install
yarn link "listick"
yarn link "listick-react"
yarn link "listick-devtools"
yarn build

Pop-Location