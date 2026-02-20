# Script PowerShell per convertire tutte le immagini JPG/PNG in WebP ricorsivamente
# Richiede ImageMagick installato (https://imagemagick.org)

$root = "docs/img"
$images = Get-ChildItem -Path $root -Recurse -Include *.jpg,*.jpeg,*.png

foreach ($img in $images) {
    $webp = $img.DirectoryName + "\" + [System.IO.Path]::GetFileNameWithoutExtension($img.Name) + ".webp"
    magick "$($img.FullName)" -quality 80 "$webp"
    Write-Host "Convertito: $($img.FullName) -> $webp"
}

Write-Host "Conversione completata. Tutte le immagini WebP sono state create nelle rispettive cartelle."
