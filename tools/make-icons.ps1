param(
  [string]$SourcePath = "$(Resolve-Path (Join-Path $PSScriptRoot ".."))\\icons\\source.png",
  [string]$OutDir = "$(Resolve-Path (Join-Path $PSScriptRoot ".."))\\icons"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

function New-IconPngFromSource {
  param(
    [System.Drawing.Image]$Source,
    [int]$Size,
    [string]$Path,
    [int]$PaddingPx
  )

  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $bg = [System.Drawing.ColorTranslator]::FromHtml('#0b0f14')
  $g.Clear($bg)

  $inner = $Size - (2 * $PaddingPx)
  if ($inner -le 0) { throw "Padding too large for size $Size" }

  # Cover fit into square (keeps aspect ratio, crops edges if needed)
  $scale = [math]::Max($inner / $Source.Width, $inner / $Source.Height)
  $w = [int]([math]::Round($Source.Width * $scale))
  $h = [int]([math]::Round($Source.Height * $scale))
  $x = [int]([math]::Round(($Size - $w) / 2))
  $y = [int]([math]::Round(($Size - $h) / 2))

  $dest = New-Object System.Drawing.Rectangle $x, $y, $w, $h
  $g.DrawImage($Source, $dest)

  $dir = Split-Path -Parent $Path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose(); $bmp.Dispose()
}

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }
if (!(Test-Path $SourcePath)) {
  throw "Missing source icon image. Save your logo as: $SourcePath"
}

$img = [System.Drawing.Image]::FromFile($SourcePath)
try {
  # Standard icons: small padding
  New-IconPngFromSource -Source $img -Size 192 -Path (Join-Path $OutDir 'icon-192.png') -PaddingPx 12
  New-IconPngFromSource -Source $img -Size 512 -Path (Join-Path $OutDir 'icon-512.png') -PaddingPx 28
  # Maskable: larger safe-zone padding
  New-IconPngFromSource -Source $img -Size 512 -Path (Join-Path $OutDir 'icon-maskable-512.png') -PaddingPx 72
} finally {
  $img.Dispose()
}

Write-Host "Icons generated from source: $SourcePath" -ForegroundColor Green
Write-Host "Written to: $OutDir" -ForegroundColor Green
