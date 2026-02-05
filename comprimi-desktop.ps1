# Comprimi immagini DESKTOP (1600px) con qualità 75% invece di 100%

Write-Host "COMPRESSIONE IMMAGINI DESKTOP" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Add-Type -AssemblyName System.Drawing

$immagini = @(
    "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-bella-vista\prospetto.jpg",
    "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-giorgio\prospetto.jpg",
    "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\casa-giorgio2\balcone.jpg"
)

$totaleRisparmio = 0

foreach ($imgPath in $immagini) {
    if (Test-Path $imgPath) {
        $fileInfo = Get-Item $imgPath
        $sizePrima = [math]::Round($fileInfo.Length / 1KB, 0)
        
        Write-Host "Comprimo: $($fileInfo.Name)" -ForegroundColor White
        Write-Host "  Prima: $sizePrima KB" -ForegroundColor Gray
        
        # Backup temporaneo
        $tempPath = "$imgPath.temp"
        Copy-Item $imgPath $tempPath -Force
        
        try {
            # Carica e ricomprimi con qualità 75%
            $image = [System.Drawing.Image]::FromFile($tempPath)
            
            $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75)
            
            $image.Save($imgPath, $encoder, $encoderParams)
            $image.Dispose()
            
            Remove-Item $tempPath -Force
            
            $fileInfoNuovo = Get-Item $imgPath
            $sizeDopo = [math]::Round($fileInfoNuovo.Length / 1KB, 0)
            $risparmio = $sizePrima - $sizeDopo
            $totaleRisparmio += $risparmio
            
            Write-Host "  Dopo: $sizeDopo KB" -ForegroundColor Green
            Write-Host "  Risparmio: -$risparmio KB (-$([math]::Round(($risparmio/$sizePrima)*100, 0))%)" -ForegroundColor Green
            Write-Host ""
        }
        catch {
            Write-Host "  ERRORE: $_" -ForegroundColor Red
            if (Test-Path $tempPath) {
                Copy-Item $tempPath $imgPath -Force
                Remove-Item $tempPath -Force
            }
        }
    }
}

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "COMPLETATO!" -ForegroundColor Green
Write-Host "  Risparmio totale desktop: -$totaleRisparmio KB" -ForegroundColor Green
Write-Host "  Nuovo peso totale stimato: $([math]::Round(1052 - $totaleRisparmio, 0)) KB" -ForegroundColor Green
Write-Host ""
Write-Host "CACHE: Il Service Worker (sw.js) cachera' le immagini per 1 anno lato client!" -ForegroundColor Yellow
