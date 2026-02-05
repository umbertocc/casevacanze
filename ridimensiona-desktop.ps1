# Ridimensiona immagini desktop da 1600px a 1200px per ottimizzare PageSpeed Desktop

Write-Host "RIDIMENSIONAMENTO IMMAGINI DESKTOP" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Da 1600px -> 1200px (ottimale per monitor desktop)" -ForegroundColor Yellow
Write-Host ""

Add-Type -AssemblyName System.Drawing

$immagini = @(
    @{Path="c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-bella-vista\prospetto.jpg"; Width=1200},
    @{Path="c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-giorgio\prospetto.jpg"; Width=1200},
    @{Path="c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-giorgio2\balcone.jpg"; Width=1200}
)

$totaleRisparmio = 0

foreach ($img in $immagini) {
    if (Test-Path $img.Path) {
        $fileInfo = Get-Item $img.Path
        $sizePrima = [math]::Round($fileInfo.Length / 1KB, 0)
        
        Write-Host "Elaboro: $($fileInfo.Name)" -ForegroundColor White
        Write-Host "  Dimensione attuale: $sizePrima KB" -ForegroundColor Gray
        
        # Backup
        $backupPath = "$($img.Path).backup"
        Copy-Item $img.Path $backupPath -Force
        
        try {
            # Carica immagine originale
            $image = [System.Drawing.Image]::FromFile($backupPath)
            
            Write-Host "  Originale: $($image.Width)x$($image.Height)px" -ForegroundColor Gray
            
            # Calcola nuove dimensioni
            $ratio = $img.Width / $image.Width
            $targetHeight = [int]($image.Height * $ratio)
            
            Write-Host "  Ridimensiono: $($img.Width)x${targetHeight}px" -ForegroundColor Gray
            
            # Crea nuova immagine ridimensionata
            $newImage = New-Object System.Drawing.Bitmap($img.Width, $targetHeight)
            $graphics = [System.Drawing.Graphics]::FromImage($newImage)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            
            $graphics.DrawImage($image, 0, 0, $img.Width, $targetHeight)
            
            # Salva con qualità 80%
            $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80)
            
            $newImage.Save($img.Path, $encoder, $encoderParams)
            
            $graphics.Dispose()
            $newImage.Dispose()
            $image.Dispose()
            
            Remove-Item $backupPath -Force
            
            $fileInfoNuovo = Get-Item $img.Path
            $sizeDopo = [math]::Round($fileInfoNuovo.Length / 1KB, 0)
            $risparmio = $sizePrima - $sizeDopo
            $totaleRisparmio += $risparmio
            
            Write-Host "  Nuova dimensione: $sizeDopo KB" -ForegroundColor Green
            Write-Host "  Risparmio: -$risparmio KB (-$([math]::Round(($risparmio/$sizePrima)*100, 0))%)" -ForegroundColor Green
            Write-Host ""
        }
        catch {
            Write-Host "  ERRORE: $_" -ForegroundColor Red
            if (Test-Path $backupPath) {
                Copy-Item $backupPath $img.Path -Force
                Remove-Item $backupPath -Force
            }
        }
    }
}

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "COMPLETATO!" -ForegroundColor Green
Write-Host "  Risparmio totale: -$totaleRisparmio KB" -ForegroundColor Green
Write-Host "  Immagini ottimizzate per desktop 1200-1400px" -ForegroundColor Green
Write-Host ""
Write-Host "NOTA: 1200px e' perfetto per monitor desktop standard!" -ForegroundColor Yellow
