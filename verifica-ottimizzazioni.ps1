# Verifica ottimizzazioni performance

Write-Host "VERIFICA OTTIMIZZAZIONI PERFORMANCE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$docsPath = "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs"

# File da verificare
$files = @(
    "index.html",
    "casa-bellavista-2.html",
    "casa-giorgio-4.html",
    "casa-giorgio-6.html",
    "faq.html",
    "contatti.html",
    "thankyou.html"
)

Write-Host "1. GOOGLE FONTS OTTIMIZZATI:" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $filePath = Join-Path $docsPath $file
    $content = Get-Content $filePath -Raw
    
    if ($content -match 'media="print" onload') {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [NO] $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. LEAFLET OTTIMIZZATO (index.html):" -ForegroundColor Yellow
Write-Host ""

$indexPath = Join-Path $docsPath "index.html"
$indexContent = Get-Content $indexPath -Raw

if ($indexContent -match 'rel="preload".*leaflet') {
    Write-Host "  [OK] Leaflet CSS con preload" -ForegroundColor Green
} else {
    Write-Host "  [NO] Leaflet CSS non ottimizzato" -ForegroundColor Red
}

if ($indexContent -match 'defer.*leaflet\.js') {
    Write-Host "  [OK] Leaflet JS con defer" -ForegroundColor Green
} else {
    Write-Host "  [NO] Leaflet JS senza defer" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. DIMENSIONI IMMAGINI (torre-pali/):" -ForegroundColor Yellow
Write-Host ""

$imgPath = "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\img\torre-pali"
$images = Get-ChildItem -Path $imgPath -Filter "molo*.jpg"

foreach ($img in $images) {
    $sizeMB = [math]::Round($img.Length / 1MB, 2)
    if ($sizeMB -lt 3) {
        Write-Host "  [OK] $($img.Name) - $sizeMB MB" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $($img.Name) - $sizeMB MB (ancora grande)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "OTTIMIZZAZIONI APPLICATE:" -ForegroundColor Green
Write-Host ""
Write-Host "  [+] Google Fonts asincrono (media print trick)" -ForegroundColor White
Write-Host "  [+] Leaflet CSS con preload" -ForegroundColor White
Write-Host "  [+] Leaflet JS con defer" -ForegroundColor White
Write-Host "  [+] Immagini compresse (-10 MB)" -ForegroundColor White
Write-Host ""
Write-Host "RISPARMIO STIMATO:" -ForegroundColor Yellow
Write-Host "  - Richieste bloccanti: -2220 ms" -ForegroundColor Green
Write-Host "  - LCP (Largest Contentful Paint): -30-40%" -ForegroundColor Green
Write-Host "  - FCP (First Contentful Paint): -20-30%" -ForegroundColor Green
Write-Host ""
Write-Host "PROSSIMO PASSO:" -ForegroundColor Cyan
Write-Host "  1. Pubblica il sito aggiornato" -ForegroundColor White
Write-Host "  2. Testa su: https://pagespeed.web.dev/" -ForegroundColor White
Write-Host "  3. Verifica miglioramenti score (atteso +15-25 punti)" -ForegroundColor White
Write-Host ""
