Push-Location

Write-Output "Build and pack listick"
Set-Location ./listick
yarn
yarn build
yarn pack

Write-Output "Build and pack listick-react"
Set-Location ../listick-react
yarn install --force
yarn build
yarn pack

Write-Output "Build and pack listick-devtools"
Set-Location ../listick-devtools
yarn install --force
yarn build
yarn pack

Write-Output "Build and pack listick-example"
Set-Location ../listick-example
yarn install --force
yarn build

Pop-Location