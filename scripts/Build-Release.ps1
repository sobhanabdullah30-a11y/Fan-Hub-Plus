param([switch]$Deploy)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    & npm.cmd --prefix frontend ci --ignore-scripts --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    & npm.cmd --prefix frontend run lint
    if ($LASTEXITCODE -ne 0) { throw 'Frontend lint failed.' }
    & npm.cmd --prefix frontend test
    if ($LASTEXITCODE -ne 0) { throw 'Frontend tests failed.' }
    & npm.cmd --prefix frontend run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
    New-Item -ItemType Directory -Path Fan-Hub/wwwroot -Force | Out-Null
    Copy-Item frontend/dist/* Fan-Hub/wwwroot -Recurse -Force
    & dotnet publish Fan-Hub/Fan-Hub.csproj -c Release -o artifacts/publish -m:1 --nologo
    if ($LASTEXITCODE -ne 0) { throw 'Backend publish failed.' }
    if ($Deploy) { & "$PSScriptRoot/Deploy-Iis.ps1" }
} finally { Pop-Location }
