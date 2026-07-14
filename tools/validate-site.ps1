$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$errors = [System.Collections.Generic.List[string]]::new()
$htmlFiles = Get-ChildItem -LiteralPath $root -File -Filter '*.html' | Sort-Object Name

if ($htmlFiles.Count -lt 12) {
  $errors.Add("Esperadas pelo menos 12 páginas HTML; encontradas $($htmlFiles.Count).")
}

foreach ($file in $htmlFiles) {
  $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
  if ($content -notmatch '<!doctype html>') { $errors.Add("$($file.Name): doctype ausente.") }
  if ($content -notmatch '<html lang="pt-BR">') { $errors.Add("$($file.Name): lang pt-BR ausente.") }
  if ($content -notmatch '<meta\s+name="description"') { $errors.Add("$($file.Name): meta description ausente.") }
  if ($content -notmatch '<title>[^<]+</title>') { $errors.Add("$($file.Name): título ausente.") }
  if ($content -notmatch '<main[^>]+id="conteudo"') { $errors.Add("$($file.Name): landmark principal ausente.") }
  if ($content -notmatch '<h1[\s>]') { $errors.Add("$($file.Name): h1 ausente.") }
  if ($content -match '<iframe') { $errors.Add("$($file.Name): iframe encontrado.") }
  if ($content -notmatch '<script src="script.js" defer></script>') { $errors.Add("$($file.Name): script.js sem defer.") }

  $ids = [regex]::Matches($content, '\bid="([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
  $duplicateIds = $ids | Group-Object | Where-Object { $_.Count -gt 1 }
  foreach ($duplicate in $duplicateIds) {
    $errors.Add("$($file.Name): id duplicado: $($duplicate.Name).")
  }

  $images = [regex]::Matches($content, '<img\b[^>]*>')
  foreach ($image in $images) {
    if ($image.Value -notmatch '\balt="[^"]*"') {
      $errors.Add("$($file.Name): imagem sem atributo alt.")
    }
    if ($image.Value -notmatch '\bwidth="\d+"' -or $image.Value -notmatch '\bheight="\d+"') {
      $errors.Add("$($file.Name): imagem sem width e height.")
    }
  }

  $blankLinks = [regex]::Matches($content, '<a\b[^>]*target="_blank"[^>]*>')
  foreach ($link in $blankLinks) {
    if ($link.Value -notmatch '\brel="[^"]*noopener') {
      $errors.Add("$($file.Name): link target=_blank sem noopener.")
    }
  }

  $references = [regex]::Matches($content, '(?:href|src)="([^"]+)"')
  foreach ($match in $references) {
    $reference = $match.Groups[1].Value
    if ($reference -match '^(#|https?:|mailto:|tel:|data:)') { continue }
    $path = ($reference -split '[?#]')[0]
    if ([string]::IsNullOrWhiteSpace($path)) { continue }
    $path = $path -replace '/', [System.IO.Path]::DirectorySeparatorChar
    $target = [System.IO.Path]::GetFullPath((Join-Path $root $path))
    if (-not $target.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
      $errors.Add("$($file.Name): referência fora do projeto: $reference")
      continue
    }
    if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
      $errors.Add("$($file.Name): arquivo local não encontrado: $reference")
    }
  }
}

$articleFile = Join-Path $root 'artigos.js'
$articleText = Get-Content -LiteralPath $articleFile -Raw -Encoding UTF8
$articleCount = [regex]::Matches($articleText, '"id"\s*:').Count
if ($articleCount -ne 48) {
  $errors.Add("artigos.js: esperados 48 artigos; encontrados $articleCount.")
}

$css = Get-Content -LiteralPath (Join-Path $root 'styles.css') -Raw -Encoding UTF8
if (([regex]::Matches($css, '\{').Count) -ne ([regex]::Matches($css, '\}').Count)) {
  $errors.Add('styles.css: quantidade de chaves de abertura e fechamento é diferente.')
}

try {
  [xml](Get-Content -LiteralPath (Join-Path $root 'sitemap.xml') -Raw -Encoding UTF8) | Out-Null
} catch {
  $errors.Add('sitemap.xml: XML inválido.')
}

$requiredFiles = @(
  'assets/jornal-outubro-2025-capa.png',
  'jornais/jornal-uep-outubro-2025.pdf',
  'robots.txt',
  '.nojekyll'
)
foreach ($requiredFile in $requiredFiles) {
  if (-not (Test-Path -LiteralPath (Join-Path $root $requiredFile) -PathType Leaf)) {
    $errors.Add("Arquivo obrigatório ausente: $requiredFile")
  }
}

if ($errors.Count) {
  $errors | ForEach-Object { Write-Host "ERRO: $_" -ForegroundColor Red }
  exit 1
}

Write-Host "Validação concluída: $($htmlFiles.Count) páginas, $articleCount artigos e referências locais íntegras."
