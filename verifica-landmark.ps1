# Verifica landmark per accessibilita screen reader

Write-Host "VERIFICA LANDMARK PRINCIPALI - ACCESSIBILITA" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$docsPath = "c:\Users\CCNMRT87R\ProjectVsCode\affittosimple\CasaBellaVista\docs"

# Pagine da verificare
$pagine = @(
    "index.html",
    "casa-bellavista-2.html",
    "casa-giorgio-4.html",
    "casa-giorgio-6.html",
    "faq.html",
    "contatti.html",
    "thankyou.html"
)

Write-Host "STANDARD WCAG 2.1:" -ForegroundColor Yellow
Write-Host "  - Ogni pagina deve avere un landmark <main>" -ForegroundColor Gray
Write-Host "  - Aiuta screen reader a navigare il contenuto" -ForegroundColor Gray
Write-Host ""

Write-Host "VERIFICA LANDMARK <main>:" -ForegroundColor Yellow
Write-Host ""

$totaleOk = 0
$totaleErrori = 0

foreach ($pagina in $pagine) {
    $filePath = Join-Path $docsPath $pagina
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        if ($content -match '<main[^>]*id="main-content"[^>]*role="main"') {
            Write-Host "  [OK] $pagina" -ForegroundColor Green
            $totaleOk++
        } elseif ($content -match '<main') {
            Write-Host "  [WARN] $pagina - main presente ma senza role" -ForegroundColor Yellow
            $totaleErrori++
        } else {
            Write-Host "  [NO] $pagina - main mancante!" -ForegroundColor Red
            $totaleErrori++
        }
    }
}

Write-Host ""
Write-Host "RIEPILOGO:" -ForegroundColor Cyan
Write-Host "  Pagine conformi: $totaleOk/$($pagine.Count)" -ForegroundColor $(if ($totaleOk -eq $pagine.Count) { "Green" } else { "Yellow" })
Write-Host "  Pagine con problemi: $totaleErrori" -ForegroundColor $(if ($totaleErrori -eq 0) { "Green" } else { "Red" })

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "STRUTTURA LANDMARK HTML5:" -ForegroundColor Green
Write-Host ""
Write-Host "  <nav>      - Navigazione principale" -ForegroundColor Gray
Write-Host "  <main>     - Contenuto principale (NUOVO)" -ForegroundColor Green
Write-Host "  <footer>   - Piede di pagina" -ForegroundColor Gray
Write-Host ""
Write-Host "BENEFICI PER ACCESSIBILITA:" -ForegroundColor Yellow
Write-Host "  [+] Screen reader possono saltare al contenuto principale" -ForegroundColor Gray
Write-Host "  [+] Navigazione facilitata per utenti ipovedenti" -ForegroundColor Gray
Write-Host "  [+] Conformita WCAG 2.1 AA" -ForegroundColor Gray
Write-Host "  [+] PageSpeed Insights: problema risolto" -ForegroundColor Gray
Write-Host ""

if ($totaleOk -eq $pagine.Count) {
    Write-Host "OTTIMO!" -ForegroundColor Green
    Write-Host "Tutte le pagine hanno il landmark principale." -ForegroundColor Green
    Write-Host ""
    Write-Host "PROSSIMO PASSO:" -ForegroundColor Cyan
    Write-Host "  1. Pubblica modifiche su GitHub Pages" -ForegroundColor White
    Write-Host "  2. Testa nuovamente PageSpeed Insights" -ForegroundColor White
    Write-Host "  3. Verifica assenza errori accessibilita" -ForegroundColor White
} else {
    Write-Host "ATTENZIONE!" -ForegroundColor Yellow
    Write-Host "Alcune pagine necessitano ancora del landmark main." -ForegroundColor Yellow
}

Write-Host ""
