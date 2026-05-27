# Убирает чёрный фон у ornament-frame.png → прозрачный (для белой карточки)
Add-Type -AssemblyName System.Drawing

$base = Join-Path $PSScriptRoot '..\public\qr-ornaments\kazakh'
$srcPath = (Resolve-Path (Join-Path $base 'ornament-frame-source.png')).Path
if (-not (Test-Path $srcPath)) {
  $srcPath = (Resolve-Path (Join-Path $base 'ornament-frame.png')).Path
  Copy-Item $srcPath (Join-Path $base 'ornament-frame-source.png')
}

$outPath = Join-Path $base 'ornament-frame.png'
$tmpPath = Join-Path $base 'ornament-frame-tmp.png'

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$out = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$w = $src.Width
$h = $src.Height
$threshold = 48

for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $c = $src.GetPixel($x, $y)
    if ($c.R -le $threshold -and $c.G -le $threshold -and $c.B -le $threshold) {
      $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    } else {
      $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
    }
  }
}

$src.Dispose()
$out.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()

Move-Item -Force $tmpPath $outPath
Write-Host "Saved transparent frame: ${w}x${h}"
