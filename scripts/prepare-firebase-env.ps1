#Requires -Version 5.1
<#
.SYNOPSIS
  Prepara FIREBASE_SERVICE_ACCOUNT_JSON a partir do arquivo .json da service account.

.DESCRIPTION
  Gera .firebase-env.min.json e .firebase-env.b64.txt na raiz do projeto.
  Opcionalmente valida com firebase-admin (Node) e copia o base64 para a área de transferência.

  NÃO commitar os arquivos gerados (.firebase-env.*).

.EXAMPLE
  .\scripts\prepare-firebase-env.ps1 -Path ".\checar-d8205-firebase-adminsdk.json"

.EXAMPLE
  .\scripts\prepare-firebase-env.ps1
  # Abre seletor de arquivo
#>
[CmdletBinding()]
param(
  [Parameter()]
  [string] $Path,

  [switch] $NoClipboard,

  [switch] $SkipNodeValidation
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $repoRoot

function Write-Step($message) {
  Write-Host $message -ForegroundColor Cyan
}

function Write-Ok($message) {
  Write-Host $message -ForegroundColor Green
}

function Write-Err($message) {
  Write-Host $message -ForegroundColor Red
}

if (-not $Path) {
  Add-Type -AssemblyName System.Windows.Forms | Out-Null
  $dialog = New-Object System.Windows.Forms.OpenFileDialog
  $dialog.Title = 'Selecione o JSON da Firebase Service Account'
  $dialog.Filter = 'JSON (*.json)|*.json|Todos (*.*)|*.*'
  $dialog.InitialDirectory = $repoRoot

  if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
    Write-Err 'Operação cancelada.'
    exit 1
  }

  $Path = $dialog.FileName
}

$resolvedPath = Resolve-Path -LiteralPath $Path

Write-Step "Lendo: $resolvedPath"

try {
  $raw = Get-Content -LiteralPath $resolvedPath -Raw -Encoding UTF8
  $sa = $raw | ConvertFrom-Json
} catch {
  Write-Err "ERRO: não foi possível ler/parsear o JSON."
  Write-Err $_.Exception.Message
  exit 1
}

if ($sa.type -ne 'service_account' -or -not $sa.private_key -or -not $sa.client_email) {
  Write-Err 'ERRO: arquivo não parece uma Firebase service account válida.'
  exit 1
}

# Normaliza private_key (escapes comuns ao colar no Azure)
$key = [string]$sa.private_key
$key = $key -replace '\\n', "`n"
$key = $key -replace '\\r', ''
$key = $key.Trim()

if ($key -notmatch '-----BEGIN PRIVATE KEY-----' -or $key -notmatch '-----END PRIVATE KEY-----') {
  Write-Err 'ERRO: private_key não contém marcadores PEM BEGIN/END.'
  exit 1
}

$sa.private_key = $key

# Minifica JSON (private_key vira \n escapado no JSON)
$minified = ($sa | ConvertTo-Json -Compress -Depth 10)
$bytes = [System.Text.Encoding]::UTF8.GetBytes($minified)
$base64 = [Convert]::ToBase64String($bytes)

$minFile = Join-Path $repoRoot '.firebase-env.min.json'
$b64File = Join-Path $repoRoot '.firebase-env.b64.txt'

Set-Content -LiteralPath $minFile -Value $minified -Encoding UTF8 -NoNewline
Set-Content -LiteralPath $b64File -Value $base64 -Encoding UTF8 -NoNewline

Write-Ok 'OK: estrutura e PEM da chave parecem válidos'
Write-Host "client_email: $($sa.client_email)"
Write-Host ''

# Validação completa com firebase-admin (mesma lib usada em produção)
if (-not $SkipNodeValidation) {
  $nodeScript = Join-Path $repoRoot 'scripts\prepare-firebase-env.mjs'
  if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Step 'Validando com firebase-admin (Node)...'
    & node $nodeScript $resolvedPath
    if ($LASTEXITCODE -ne 0) {
      Write-Err 'Validação Node falhou. Corrija a chave ou gere uma nova no Firebase Console.'
      exit $LASTEXITCODE
    }
    Write-Host ''
  } else {
    Write-Host 'Aviso: Node não encontrado — pulando validação firebase-admin.' -ForegroundColor Yellow
    Write-Host 'Instale Node ou rode: node scripts/prepare-firebase-env.mjs <arquivo.json>'
    Write-Host ''
  }
}

Write-Ok 'Arquivos gerados (NÃO commitar):'
Write-Host "  $minFile"
Write-Host "  $b64File"
Write-Host ''

if (-not $NoClipboard) {
  Set-Clipboard -Value $base64
  Write-Ok 'Base64 copiado para a área de transferência.'
  Write-Host ''
}

Write-Step 'Próximo passo — Azure App Service:'
Write-Host '  1. Configuration → FIREBASE_SERVICE_ACCOUNT_JSON'
Write-Host '  2. Cole o base64 (já copiado ou use .firebase-env.b64.txt)'
Write-Host '  3. Save → Restart'
Write-Host '  4. GET /health → "firebase": true'
Write-Host ''

Write-Step 'Desenvolvimento local (.env):'
Write-Host '  Adicione uma linha (JSON minificado em uma linha):'
Write-Host '  FIREBASE_SERVICE_ACCOUNT_JSON=<conteúdo de .firebase-env.min.json>'
Write-Host ''
