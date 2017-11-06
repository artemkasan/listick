Push-Location

Write-Output "Build and pack listick"
Set-Location ./listick
yarn
yarn build
yarn pack

Write-Output "Build and pack listick-react"
Set-Location ../listick-react
yarn
yarn build
yarn pack

Write-Output "Build and pack listick-example"
Set-Location ../listick-example
yarn
yarn build

Pop-Location