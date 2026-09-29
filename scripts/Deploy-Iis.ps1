param([switch]$Preview)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Push-Location $root
try {
    if (-not (Test-Path artifacts/publish/wwwroot/index.html)) { throw 'Build the full release before deployment.' }
    $profile = [xml](Get-Content Fan-Hub/Properties/PublishProfiles/IISProfile.pubxml -Raw)
    $local = [xml](Get-Content Fan-Hub/Properties/PublishProfiles/IISProfile.pubxml.user -Raw)
    Add-Type -AssemblyName System.Security
    $bytes = [Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($local.Project.PropertyGroup.EncryptedPassword), $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)
    $password = if ($bytes.Length -gt 1 -and $bytes[1] -eq 0) { [Text.Encoding]::Unicode.GetString($bytes) } else { [Text.Encoding]::UTF8.GetString($bytes) }
    [Array]::Clear($bytes,0,$bytes.Length)
    $settings = $profile.Project.PropertyGroup
    $source = (Resolve-Path artifacts/publish).Path
    $endpoint = "https://$($settings.MSDeployServiceURL):8172/msdeploy.axd?site=$($settings.DeployIisAppPath)"
    $arguments = @('-verb:sync', "-source:iisApp='$source'", "-dest:iisApp='$($settings.DeployIisAppPath)',computerName='$endpoint',userName='$($settings.UserName)',password='$password',authType='Basic'", '-enableRule:AppOffline', '-enableRule:DoNotDeleteRule', '-retryAttempts:2')
    if ($Preview) { $arguments += '-whatif' }
    $output = & 'C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe' @arguments 2>&1
    $code = $LASTEXITCODE
    $output | ForEach-Object { $_.ToString().Replace($password, '[REDACTED]') }
    if ($code -ne 0) { throw "Deployment failed with exit code $code." }
} finally {
    $password = $null
    Pop-Location
}
