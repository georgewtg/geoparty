$currentDir = Get-Location

# launch processes
$proc1 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'DEV: Frontend'; Set-Location '$currentDir\frontend'; npm run dev" -PassThru
$proc2 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'DEV: Backend'; Set-Location '$currentDir\backend'; npm run dev" -PassThru
$proc3 = Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$host.UI.RawUI.WindowTitle = 'DEV: Socket'; Set-Location '$currentDir\socket'; npm run dev" -PassThru

Write-Host "Running frontend, backend, and socket in separate windows..." -ForegroundColor Green
Write-Host "Press Ctrl+C in THIS window to stop all processes." -ForegroundColor Yellow

try {
  while ($true) {
    Start-Sleep -Seconds 1
  }
} finally {
  Write-Host "`nStopping process trees..." -ForegroundColor Red
  taskkill /PID $proc1.Id /T /F | Out-Null
  taskkill /PID $proc2.Id /T /F | Out-Null
  taskkill /PID $proc3.Id /T /F | Out-Null
}