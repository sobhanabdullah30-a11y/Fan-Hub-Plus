$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$outputDirectory = Join-Path $root 'artifacts'
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
$outputPath = Join-Path $outputDirectory 'Fan-Hub-Submission.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
if (Test-Path -LiteralPath $outputPath) { Remove-Item -LiteralPath $outputPath }
$archive = [IO.Compression.ZipFile]::Open($outputPath, [IO.Compression.ZipArchiveMode]::Create)
$excludedDirectories = @('.git', '.vs', '.agents', '.codex', 'node_modules', 'bin', 'obj', 'artifacts', 'tmp', 'dist', 'App_Data', 'PublishProfiles')
$count = 0
function Add-SourceDirectory([string]$directory) {
    foreach ($item in Get-ChildItem -LiteralPath $directory -Force) {
        $relative = [IO.Path]::GetRelativePath($root, $item.FullName).Replace('\', '/')
        if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
        if ($item.PSIsContainer) {
            if ($item.Name -in $excludedDirectories -or $relative -eq 'Fan-Hub/wwwroot') { continue }
            Add-SourceDirectory $item.FullName
            continue
        }
        if ($item.Name -eq '.env' -or $item.Name -like '*.user' -or $item.Name -like 'appsettings.Local.json' -or $item.Extension -in @('.pfx', '.pem', '.key', '.log')) { continue }
        if ($relative -eq 'Fan-Hub/appsettings.json') {
            $settings = Get-Content -LiteralPath $item.FullName -Raw | ConvertFrom-Json
            $settings.ConnectionStrings.DefaultConnection = ''
            $settings.Jwt.Key = ''
            $settings.Email.Password = ''
            $entry = $archive.CreateEntry($relative)
            $writer = [IO.StreamWriter]::new($entry.Open())
            try { $writer.Write(($settings | ConvertTo-Json -Depth 20)) } finally { $writer.Dispose() }
        } else {
            [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $item.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
        $script:count++
    }
}
try { Add-SourceDirectory $root } finally { $archive.Dispose() }
Write-Output "Created $outputPath with $count source files. Runtime secrets and local publish credentials are excluded."
