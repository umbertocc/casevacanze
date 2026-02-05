# Crea versioni mobile delle immagini (800px)

Write-Host "CREAZIONE IMMAGINI RESPONSIVE" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

Add-Type -AssemblyName System.Drawing

$immagini = @(
    @{Src="c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-bella-vista\prospetto.jpg"; Target="prospetto-mobile.jpg"; Width=800},
    @{Src="c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-giorgio\prospetto.jpg"; Target="prospetto-mobile.jpg"; Width=800},
    @{Src="c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-giorgio2\balcone.jpg"; Target="balcone-mobile.jpg"; Width=800}
)

$totaleRisparmio = 0

foreach ($img in $immagini) {
    if (Test-Path $img.Src) {
        $fileInfo = Get-Item $img.Src
        $sizePrima = [math]::Round($fileInfo.Length / 1KB, 0)
        $folder = $fileInfo.DirectoryName
        $targetPath = Join-Path $folder $img.Target
        
        Write-Host "Elaboro: $($fileInfo.Name)" -ForegroundColor White
        Write-Host "  Originale: $sizePrima KB" -ForegroundColor Gray
        
        # Carica immagine
        $image = [System.Drawing.Image]::FromFile($img.Src)
        $ratio = $img.Width / $image.Width
        $targetHeight = [int]($image.Height * $ratio)
        
        Write-Host "  Ridimensiono: $($image.Width)x$($image.Height) -> $($img.Width)x$targetHeight" -ForegroundColor Gray
        
        # Crea versione ridimensionata
        $newImage = New-Object System.Drawing.Bitmap($img.Width, $targetHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($newImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($image, 0, 0, $img.Width, $targetHeight)
        
        # Salva con qualita 80%
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80)
        
        $newImage.Save($targetPath, $encoder, $encoderParams)
        
        $graphics.Dispose()
        $newImage.Dispose()
        $image.Dispose()
        
        $fileInfoNuovo = Get-Item $targetPath
        $sizeDopo = [math]::Round($fileInfoNuovo.Length / 1KB, 0)
        $risparmio = $sizePrima - $sizeDopo
        $totaleRisparmio += $risparmio
        
        Write-Host "  Mobile: $sizeDopo KB" -ForegroundColor Green
        Write-Host "  Risparmio: -$risparmio KB" -ForegroundColor Green
        Write-Host ""
    }
}

Write-Host "=============================" -ForegroundColor Cyan
Write-Host "COMPLETATO!" -ForegroundColor Green
Write-Host "  Risparmio totale mobile: -$totaleRisparmio KB" -ForegroundColor Green
Write-Host ""
