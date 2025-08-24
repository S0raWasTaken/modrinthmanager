# Modrinth Manager CLI Installer
Write-Host "Installing Modrinth Manager CLI..." -ForegroundColor Green

# Build the project
Write-Host "Building project..." -ForegroundColor Yellow
npm run build

# Create installation directory
$installDir = "$env:USERPROFILE\AppData\Local\ModrinthManager"
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force
}

# Copy files
Write-Host "Copying files..." -ForegroundColor Yellow
Copy-Item "dist\*" -Destination $installDir -Recurse -Force
Copy-Item "node_modules" -Destination $installDir -Recurse -Force

# Create batch file
$batchContent = @"
@echo off
node "$installDir\cli.js" %*
"@

$batchContent | Out-File -FilePath "$installDir\mr.bat" -Encoding ASCII

# Add to PATH
Write-Host "Adding to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$installDir*") {
    $newPath = "$currentPath;$installDir"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "Added to PATH. Please restart your terminal." -ForegroundColor Green
} else {
    Write-Host "Already in PATH." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "You can now use 'mr' command from anywhere." -ForegroundColor Cyan
Write-Host ""
Write-Host "Examples:" -ForegroundColor White
Write-Host "  mr init" -ForegroundColor Gray
Write-Host "  mr search 'fabric api'" -ForegroundColor Gray
Write-Host "  mr download fabric-api" -ForegroundColor Gray
Write-Host "  mr info fabric-api" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to continue"
