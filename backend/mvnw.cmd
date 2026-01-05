@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM This batch file is used to call the Maven Wrapper executable.
@REM----------------------------------------------------------------------------

@echo off
setlocal enabledelayedexpansion

set ERROR_CODE=0

@REM To isolate internal variables from possible post scripts, we use another setlocal
@setlocal

set WRAPPER_VERSION=3.1.2

set WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.1.2/maven-wrapper-3.1.2.jar
set WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar

set WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties

if not "%MAVEN_PROJECTBASEDIR%"=="" (
    set WRAPPER_JAR=!MAVEN_PROJECTBASEDIR!\.mvn\wrapper\maven-wrapper.jar
    set WRAPPER_PROPERTIES=!MAVEN_PROJECTBASEDIR!\.mvn\wrapper\maven-wrapper.properties
)

@REM Provide default values for variables
if not defined JAVA_HOME (
    set JAVA_HOME=!SystemRoot!\Program Files\Java\jdk-17
)

for /f "tokens=*" %%i in ('dir /b "%JAVA_HOME%\bin\java.exe" 2^>nul') do set JAVA_EXE=%%i
if not defined JAVA_EXE (
    echo Error: JAVA_HOME is not properly set. >&2
    exit /b 1
)

if not exist "%WRAPPER_JAR%" (
    echo Downloading maven-wrapper.jar from %WRAPPER_URL%
    powershell -Command "(New-Object System.Net.ServicePointManager).SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%')"
    if errorlevel 1 (
        echo Failed to download %WRAPPER_URL%
        exit /b 1
    )
)

"%JAVA_HOME%\bin\java.exe" -cp "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
if errorlevel 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

exit /b %ERROR_CODE%
