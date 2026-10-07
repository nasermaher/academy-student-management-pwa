
# Start Local Server on port 8000
Start-Process python -ArgumentList "-m http.server 8000" -NoNewWindow
Write-Host "Server started at http://localhost:8000"
Start-Process "http://localhost:8000"
