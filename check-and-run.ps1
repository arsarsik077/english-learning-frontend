# Проверка и запуск Frontend
Write-Host "=== English Learning Platform - Frontend ===" -ForegroundColor Cyan
Write-Host ""

# Поиск Node.js
$nodePath = $null
$npmPath = $null
$possiblePaths = @(
    "node",
    "C:\Program Files\nodejs\node.exe",
    "$env:APPDATA\npm\node.exe"
)

foreach ($path in $possiblePaths) {
    try {
        $result = & $path -v 2>&1
        if ($LASTEXITCODE -eq 0) {
            $nodePath = $path
            Write-Host "✓ Node.js найден: $path (версия: $result)" -ForegroundColor Green
            
            # Поиск npm
            $npmDir = Split-Path $path
            if (Test-Path "$npmDir\npm.cmd") {
                $npmPath = "$npmDir\npm.cmd"
            } else {
                $npmPath = "npm"
            }
            break
        }
    } catch {
        continue
    }
}

if (-not $nodePath) {
    Write-Host "✗ Node.js не найден!" -ForegroundColor Red
    Write-Host "Установите Node.js:" -ForegroundColor Yellow
    Write-Host "  1. Скачайте с https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "  2. Или используйте: choco install nodejs" -ForegroundColor Yellow
    exit 1
}

# Установка зависимостей
Write-Host ""
Write-Host "Установка зависимостей..." -ForegroundColor Cyan
& $npmPath install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Ошибка при установке зависимостей!" -ForegroundColor Red
    exit 1
}

# Запуск проекта
Write-Host ""
Write-Host "Запуск React приложения..." -ForegroundColor Cyan
Write-Host "Frontend будет доступен на http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

& $npmPath start


