# Fix DNS Settings - Run as Administrator
Write-Host "Fixing DNS Settings..." -ForegroundColor Green

# Get active network adapter
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1

if ($adapter) {
    Write-Host "Found active adapter: $($adapter.Name)" -ForegroundColor Yellow
    
    # Set DNS to Google Public DNS
    Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("8.8.8.8","8.8.4.4")
    
    Write-Host "DNS changed to Google DNS (8.8.8.8, 8.8.4.4)" -ForegroundColor Green
    
    # Flush DNS cache
    ipconfig /flushdns | Out-Null
    Write-Host "DNS cache flushed" -ForegroundColor Green
    
    # Test connection
    Write-Host "`nTesting connection to Amadeus API..." -ForegroundColor Yellow
    $result = Test-NetConnection test.api.amadeus.com -Port 443 -WarningAction SilentlyContinue
    
    if ($result.TcpTestSucceeded) {
        Write-Host "SUCCESS! Connection to Amadeus API is working!" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Still cannot connect. You may need to restart your computer." -ForegroundColor Red
    }
} else {
    Write-Host "ERROR: No active network adapter found!" -ForegroundColor Red
}

Write-Host "`nPress any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
