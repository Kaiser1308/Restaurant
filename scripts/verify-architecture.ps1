$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$violations = [System.Collections.Generic.List[string]]::new()

function Add-Violation {
    param([string]$Message)
    $violations.Add($Message)
}

function Get-Lines {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        return @()
    }

    return Get-Content $Path
}

$appPath = Join-Path $repoRoot 'apps\web\src\App.tsx'
$routerPath = Join-Path $repoRoot 'apps\web\src\app\router.tsx'
$featuresRoot = Join-Path $repoRoot 'apps\web\src\features'
$servicesRoot = Join-Path $repoRoot 'apps\api\Restaurant.Api\Services'
$posAggregatorPath = Join-Path $repoRoot 'apps\web\src\features\pos\hooks\usePosData.ts'

Write-Host 'Architecture verification'
Write-Host "Repo: $repoRoot"

if (-not (Test-Path $appPath)) {
    Add-Violation "Missing web app entry file: $appPath"
} else {
    $appLines = Get-Lines $appPath
    if ($appLines.Count -gt 160) {
        Add-Violation "App.tsx is too large ($($appLines.Count) lines). It should stay bootstrap-only."
    }

    $appText = $appLines -join "`n"
    if ($appText -match 'path="/(waiter|cashier|owner|login)' -or $appText -match '<Routes>' -or $appText -match 'function\s+\w+Page\s*\(') {
        Add-Violation 'App.tsx still appears to contain route/page logic. Move it to apps/web/src/app/router.tsx and pages/.'
    }
}

if (-not (Test-Path $routerPath)) {
    Add-Violation "Missing router module: $routerPath"
}

if (Test-Path $featuresRoot) {
    $featureDirs = Get-ChildItem $featuresRoot -Directory
    foreach ($featureDir in $featureDirs) {
        if ($featureDir.Name -eq 'pos') {
            Add-Violation "Forbidden aggregator feature still exists: $($featureDir.FullName)"
            continue
        }

        $indexPath = Join-Path $featureDir.FullName 'index.ts'
        if (-not (Test-Path $indexPath)) {
            Add-Violation "Feature missing public index.ts: $indexPath"
        }
    }
}

$webFiles = Get-ChildItem (Join-Path $repoRoot 'apps\web\src') -Recurse -Include *.ts,*.tsx -File
foreach ($file in $webFiles) {
    $matches = Select-String -Path $file.FullName -Pattern '@/features/[^/]+/(api|hooks|types|utils|components)/', '\.\./features/', '\./features/' -SimpleMatch:$false
    foreach ($match in $matches) {
        Add-Violation "Cross-feature deep import: $($match.Path):$($match.LineNumber): $($match.Line.Trim())"
    }
}

if (Test-Path $servicesRoot) {
    $serviceFiles = Get-ChildItem $servicesRoot -Filter *.cs -File
    foreach ($file in $serviceFiles) {
        $directContextMatches = Select-String -Path $file.FullName -Pattern 'tenantContext\.(TenantId|UserId|Role)(?!\s*\()'
        foreach ($match in $directContextMatches) {
            Add-Violation "Direct tenant context access in service write layer: $($match.Path):$($match.LineNumber): $($match.Line.Trim())"
        }

        $guidEmptyMatches = Select-String -Path $file.FullName -Pattern 'Guid\.Empty'
        foreach ($match in $guidEmptyMatches) {
            Add-Violation "Guid.Empty fallback in service layer: $($match.Path):$($match.LineNumber): $($match.Line.Trim())"
        }
    }
}

if ($violations.Count -eq 0) {
    Write-Host 'Architecture verification passed.' -ForegroundColor Green
    exit 0
}

Write-Host ''
Write-Host 'Architecture verification failed with the following violations:' -ForegroundColor Red
foreach ($violation in $violations) {
    Write-Host "- $violation"
}

exit 1
