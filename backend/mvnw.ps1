#!/usr/bin/env powershell

# Maven wrapper script for Windows
# Downloads Maven if not present and runs it

$ErrorActionPreference = "Stop"

$MAVEN_HOME = "$PSScriptRoot\.mvn\maven"
$WRAPPER_JAR = "$PSScriptRoot\.mvn\wrapper\maven-wrapper.jar"
$WRAPPER_PROPS = "$PSScriptRoot\.mvn\wrapper\maven-wrapper.properties"

# Create directories if they don't exist
if (-not (Test-Path (Split-Path $WRAPPER_JAR))) {
    New-Item -ItemType Directory -Force -Path (Split-Path $WRAPPER_JAR) | Out-Null
}

# Read wrapper properties
$props = @{}
if (Test-Path $WRAPPER_PROPS) {
    Get-Content $WRAPPER_PROPS | ForEach-Object {
        if ($_ -match "^([^#=]+)=(.*)") {
            $props[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
}

$MAVEN_VERSION = $props["distributionUrl"] -replace ".*apache-maven-(.+?)-bin.*", '$1'
$MAVEN_DIST = "$MAVEN_HOME\apache-maven-$MAVEN_VERSION"
$MAVEN_EXE = "$MAVEN_DIST\bin\mvn.cmd"

# Download Maven if not present
if (-not (Test-Path $MAVEN_EXE)) {
    Write-Host "Downloading Apache Maven $MAVEN_VERSION..."
    $url = "https://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip"
    $zip = "$MAVEN_HOME\maven.zip"
    
    # Create directory
    New-Item -ItemType Directory -Force -Path $MAVEN_HOME | Out-Null
    
    # Download using .NET
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    (New-Object System.Net.WebClient).DownloadFile($url, $zip)
    
    # Extract
    Write-Host "Extracting Maven..."
    Expand-Archive -Path $zip -DestinationPath $MAVEN_HOME -Force
    Remove-Item $zip
}

# Run Maven
Write-Host "Running Maven..."
& $MAVEN_EXE $args
exit $LASTEXITCODE
