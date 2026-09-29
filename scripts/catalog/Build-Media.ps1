param([Parameter(Mandatory=$true)][string]$Ffmpeg)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$media = Join-Path $root 'frontend/public/catalog'
$scratch = Join-Path $root 'tmp/catalog-plates'
$jobs = Get-Content (Join-Path $PSScriptRoot 'narration.json') -Raw | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$speech = [System.Speech.Synthesis.SpeechSynthesizer]::new()
try {
    foreach ($job in $jobs) {
        $wave = Join-Path $scratch ($job.key + '.wav')
        $speech.SelectVoice($job.voice)
        $speech.Rate = -1
        $speech.SetOutputToWaveFile($wave)
        $speech.Speak($job.text)
        $speech.SetOutputToNull()
        if (-not $job.video) {
            & $Ffmpeg -v error -y -i $wave -codec:a libmp3lame -q:a 3 (Join-Path $media ($job.key + '.mp3'))
        } else {
            $details = (& $Ffmpeg -i $wave 2>&1 | Out-String)
            $match = [regex]::Match($details, 'Duration: (\d+):(\d+):(\d+\.\d+)')
            if (-not $match.Success) { throw "Cannot determine duration: $($job.key)" }
            $duration = [double]$match.Groups[1].Value * 3600 + [double]$match.Groups[2].Value * 60 + [double]$match.Groups[3].Value
            $segment = $duration / 3
            $frames = [int][Math]::Ceiling($segment * 24)
            $inputs = @()
            foreach ($plate in $job.plates) { $inputs += @('-i', (Join-Path $scratch ($plate + '.png'))) }
            $filters = (0..2 | ForEach-Object { "[$($_):v]scale=1280:800,zoompan=z='min(zoom+0.00025,1.05)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=${frames}:s=1280x800:fps=24,setsar=1,fade=t=in:st=0:d=0.4[v$_]" }) -join ';'
            $filters += ';[v0][v1][v2]concat=n=3:v=1:a=0,format=yuv420p[out]'
            & $Ffmpeg -v error -y @inputs -i $wave -filter_complex $filters -map '[out]' -map 3:a -c:v libx264 -preset veryfast -crf 25 -c:a aac -b:a 96k -shortest -movflags +faststart (Join-Path $media ($job.key + '.mp4'))
            $sentences = [regex]::Split($job.text, '(?<=[.!?])\s+')
            $vtt = "WEBVTT`n`n"
            $elapsed = 0.0
            $letters = ($sentences | ForEach-Object { $_.Length } | Measure-Object -Sum).Sum
            foreach ($sentence in $sentences) {
                $start = [TimeSpan]::FromSeconds($elapsed).ToString('hh\:mm\:ss\.fff')
                $elapsed += $duration * $sentence.Length / $letters
                $end = [TimeSpan]::FromSeconds($elapsed).ToString('hh\:mm\:ss\.fff')
                $vtt += "$start --> $end`n$sentence`n`n"
            }
            [IO.File]::WriteAllText((Join-Path $media ($job.key + '.vtt')), $vtt)
        }
        if ($LASTEXITCODE -ne 0) { throw "Media encoding failed: $($job.key)" }
        Write-Output "Created $($job.key)"
    }
} finally { $speech.Dispose() }
