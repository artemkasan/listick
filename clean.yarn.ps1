Push-Location

Write-Output "Clean listick"
Set-Location ./listick
Remove-Item node_modules -Force -Recurse -ErrorAction Ignore 
Remove-Item coverage -Force -Recurse -ErrorAction Ignore 
Remove-Item dist -Force -Recurse -ErrorAction Ignore 
Remove-Item yarn.lock -Force -ErrorAction Ignore 
Remove-Item *.tgz -Force -ErrorAction Ignore 

Write-Output "Clean listick-react"
Set-Location ../listick-react
Remove-Item node_modules -Force -Recurse -ErrorAction Ignore
Remove-Item dist -Force -Recurse -ErrorAction Ignore
Remove-Item coverage -Force -Recurse -ErrorAction Ignore
Remove-Item yarn.lock -Force -ErrorAction Ignore
Remove-Item *.tgz -Force -ErrorAction Ignore

Write-Output "Clean listick-example"
Set-Location ../listick-example
Remove-Item node_modules -Force -Recurse -ErrorAction Ignore
Remove-Item dist -Force -Recurse -ErrorAction Ignore
Remove-Item yarn.lock -Force -ErrorAction Ignore
Remove-Item app.js -Force -ErrorAction Ignore
Remove-Item app.js.map -Force -ErrorAction Ignore

Write-Output "Clean yarn cache"
yarn cache clean listick
yarn cache clean listick-react

Pop-Location