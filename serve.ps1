param(
  [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)

$mimeTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.css' = 'text/css; charset=utf-8'
  '.js' = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.xml' = 'application/xml; charset=utf-8'
  '.txt' = 'text/plain; charset=utf-8'
  '.svg' = 'image/svg+xml'
  '.png' = 'image/png'
  '.jpg' = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.jfif' = 'image/jpeg'
  '.webp' = 'image/webp'
  '.pdf' = 'application/pdf'
}

function Write-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$Reason,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$SendBody = $true
  )

  $header = "HTTP/1.1 $StatusCode $Reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`nX-Content-Type-Options: nosniff`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($SendBody -and $Body.Length) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$listener.Start()
Write-Host "Portal disponível em http://127.0.0.1:$Port/"

try {
  while ($true) {
    $reader = $null
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()

      while ($reader.ReadLine()) { }

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      $requestParts = $requestLine.Split(' ')
      if ($requestParts.Count -lt 2) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Requisição inválida.')
        Write-Response $stream 400 'Bad Request' 'text/plain; charset=utf-8' $body
        continue
      }

      $method = $requestParts[0].ToUpperInvariant()
      if ($method -ne 'GET' -and $method -ne 'HEAD') {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Método não permitido.')
        Write-Response $stream 405 'Method Not Allowed' 'text/plain; charset=utf-8' $body ($method -ne 'HEAD')
        continue
      }

      $requestPath = ($requestParts[1] -split '\?', 2)[0]
      $relativePath = [System.Uri]::UnescapeDataString($requestPath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
      $relativePath = $relativePath -replace '/', [System.IO.Path]::DirectorySeparatorChar
      $target = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativePath))

      if (-not $target.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Acesso negado.')
        Write-Response $stream 403 'Forbidden' 'text/plain; charset=utf-8' $body ($method -eq 'GET')
        continue
      }
      if ([System.IO.Directory]::Exists($target)) {
        $target = [System.IO.Path]::Combine($target, 'index.html')
      }
      if (-not [System.IO.File]::Exists($target)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes('Arquivo não encontrado.')
        Write-Response $stream 404 'Not Found' 'text/plain; charset=utf-8' $body ($method -eq 'GET')
        continue
      }

      $extension = [System.IO.Path]::GetExtension($target).ToLowerInvariant()
      if ($mimeTypes.ContainsKey($extension)) {
        $contentType = $mimeTypes[$extension]
      } else {
        $contentType = 'application/octet-stream'
      }

      $body = [System.IO.File]::ReadAllBytes($target)
      Write-Response $stream 200 'OK' $contentType $body ($method -eq 'GET')
    } catch {
      Write-Warning $_.Exception.Message
    } finally {
      if ($reader) { $reader.Dispose() }
      $client.Dispose()
    }
  }
} finally {
  $listener.Stop()
}
