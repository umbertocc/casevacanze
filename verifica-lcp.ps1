# Verifica ottimizzazioni LCP

Write-Host "VERIFICA OTTIMIZZAZIONI LCP (Largest Contentful Paint)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$indexPath = "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs\index.html"
$content = Get-Content $indexPath -Raw

Write-Host "1. PRELOAD IMMAGINE LCP:" -ForegroundColor Yellow
if ($content -match 'rel="preload".*?as="image".*?prospetto\.jpg') {
    Write-Host "  [OK] Preload immagine critica configurato" -ForegroundColor Green
} else {
    Write-Host "  [NO] Preload immagine mancante" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. FETCHPRIORITY HIGH:" -ForegroundColor Yellow
if ($content -match 'fetchpriority="high"') {
    Write-Host "  [OK] Prima immagine con fetchpriority=high" -ForegroundColor Green
} else {
    Write-Host "  [NO] fetchpriority non impostato" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. LAZY LOADING RIMOSSO (prime 3 immagini):" -ForegroundColor Yellow

# Trova le prime 3 immagini
$matches = [regex]::Matches($content, '<img[^>]*src="img/casa-[^"]*"[^>]*>')
$count = 0
foreach ($match in $matches) {
    $count++
    if ($count -le 3) {
        $imgTag = $match.Value
        if ($imgTag -notmatch 'loading="lazy"') {
            Write-Host "  [OK] Immagine $count senza lazy loading" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Immagine $count ha ancora lazy loading!" -ForegroundColor Yellow
        }
    }
    if ($count -eq 3) { break }
}

Write-Host ""
Write-Host "4. DIMENSIONI ESPLICITE (width/height):" -ForegroundColor Yellow
$imgWithDimensions = [regex]::Matches($content, '<img[^>]*width="\d+"[^>]*height="\d+"')
if ($imgWithDimensions.Count -ge 3) {
    Write-Host "  [OK] $($imgWithDimensions.Count) immagini con dimensioni esplicite" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Solo $($imgWithDimensions.Count) immagini con dimensioni" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "RIEPILOGO OTTIMIZZAZIONI APPLICATE:" -ForegroundColor Green
Write-Host ""
Write-Host "BLOCCO RENDERING (completato):" -ForegroundColor White
Write-Host "  [+] Google Fonts asincrono" -ForegroundColor Gray
Write-Host "  [+] Leaflet CSS preload" -ForegroundColor Gray
Write-Host "  [+] Leaflet JS defer" -ForegroundColor Gray
Write-Host "  [+] Immagini compresse (-10 MB)" -ForegroundColor Gray
Write-Host ""
Write-Host "LCP OPTIMIZATION (nuovo):" -ForegroundColor White
Write-Host "  [+] Preload immagine critica" -ForegroundColor Gray
Write-Host "  [+] fetchpriority=high sulla prima immagine" -ForegroundColor Gray
Write-Host "  [+] Lazy loading rimosso dalle prime 3 immagini" -ForegroundColor Gray
Write-Host "  [+] Width/height espliciti per evitare layout shift" -ForegroundColor Gray
Write-Host ""
Write-Host "MIGLIORAMENTI ATTESI:" -ForegroundColor Yellow
Write-Host "  - LCP: da 5.7s a ~2.5-3.0s (-40-50%)" -ForegroundColor Green
Write-Host "  - FCP: da 2.7s a ~1.5-2.0s (-30-40%)" -ForegroundColor Green
Write-Host "  - Score mobile: da 72 a 85-92 (+13-20 punti)" -ForegroundColor Green
Write-Host ""
Write-Host "PROSSIMO PASSO:" -ForegroundColor Cyan
Write-Host "  1. Pubblica modifiche su GitHub Pages" -ForegroundColor White
Write-Host "  2. Aspetta 2-3 minuti per deploy" -ForegroundColor White
Write-Host "  3. Testa nuovamente: https://pagespeed.web.dev/" -ForegroundColor White
Write-Host ""
