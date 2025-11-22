# DrivePro - GitHub Setup Script
# This script will configure Git and help you push to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git & GitHub Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Git configuration
$currentName = git config --global user.name 2>$null
$currentEmail = git config --global user.email 2>$null

if ($currentName -and $currentEmail) {
    Write-Host "Current Git configuration:" -ForegroundColor Green
    Write-Host "  Name:  $currentName" -ForegroundColor White
    Write-Host "  Email: $currentEmail" -ForegroundColor White
    Write-Host ""
    $change = Read-Host "Change configuration? (y/n)"
    if ($change -eq "y" -or $change -eq "Y") {
        $currentName = $null
        $currentEmail = $null
    }
}

if (-not $currentName) {
    Write-Host "Enter your name (for Git commits):" -ForegroundColor Yellow
    $name = Read-Host "Name"
    if ($name) {
        git config --global user.name $name
        Write-Host "✓ Name configured: $name" -ForegroundColor Green
    }
}

if (-not $currentEmail) {
    Write-Host ""
    Write-Host "Enter your GitHub email address:" -ForegroundColor Yellow
    $email = Read-Host "Email"
    if ($email) {
        git config --global user.email $email
        Write-Host "✓ Email configured: $email" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Repository Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if already initialized
if (Test-Path ".git") {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .
$fileCount = (git status --short | Measure-Object -Line).Lines
Write-Host "✓ Added $fileCount files" -ForegroundColor Green

Write-Host ""
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: DrivePro Student Management System"
Write-Host "✓ Commit created" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now you need to create a repository on GitHub:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name: nuru-driving-student (or your choice)" -ForegroundColor White
Write-Host "3. Choose Public or Private" -ForegroundColor White
Write-Host "4. DO NOT check 'Initialize with README'" -ForegroundColor White
Write-Host "5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/nuru-driving-student.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "No repository URL provided. You can add it later with:" -ForegroundColor Yellow
    Write-Host "  git remote add origin YOUR_REPO_URL" -ForegroundColor White
    Write-Host "  git push -u origin main" -ForegroundColor White
    exit 0
}

# Add remote
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host ""
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $update = Read-Host "Update to new URL? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin $repoUrl
        Write-Host "✓ Remote URL updated" -ForegroundColor Green
    }
} else {
    git remote add origin $repoUrl
    Write-Host "✓ Remote repository added" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: You need a Personal Access Token!" -ForegroundColor Yellow
Write-Host ""
Write-Host "GitHub no longer accepts passwords. You need a token:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/settings/tokens" -ForegroundColor White
Write-Host "2. Click 'Generate new token' -> 'Generate new token (classic)'" -ForegroundColor White
Write-Host "3. Name: 'DrivePro Project'" -ForegroundColor White
Write-Host "4. Check 'repo' scope" -ForegroundColor White
Write-Host "5. Click 'Generate token'" -ForegroundColor White
Write-Host "6. COPY THE TOKEN (you won't see it again!)" -ForegroundColor Red
Write-Host ""
Write-Host "When prompted for password, paste your TOKEN (not your password)" -ForegroundColor Yellow
Write-Host ""

$ready = Read-Host "Ready to push? (y/n)"

if ($ready -eq "y" -or $ready -eq "Y") {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✓ Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your code is now at: $repoUrl" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. Common issues:" -ForegroundColor Red
        Write-Host "- Wrong username or token" -ForegroundColor Yellow
        Write-Host "- Token doesn't have repo permission" -ForegroundColor Yellow
        Write-Host "- Repository doesn't exist or you don't have access" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "You can push later with:" -ForegroundColor Yellow
    Write-Host "  git push -u origin main" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"

