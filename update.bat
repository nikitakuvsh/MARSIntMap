@echo off
REM --- Settings ---
set REPO_URL=https://github.com/nikitakuvsh/MARSIntMap
set ZIP_URL=%REPO_URL%/archive/refs/heads/main.zip
set TEMP_ZIP=%CD%\repo_update.zip
set TEMP_DIR=%CD%\repo_temp

REM --- Download the repository as zip ---
echo Downloading repository...
powershell -Command "Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%TEMP_ZIP%'"

REM --- Create temporary folder ---
if exist "%TEMP_DIR%" rd /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

REM --- Extract the zip ---
powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%TEMP_DIR%' -Force"

REM --- Copy files to the current directory ---
echo Copying files to current folder...
xcopy "%TEMP_DIR%\MARSIntMap-main\*" "%CD%\" /E /Y /I

REM --- Clean up temporary files ---
rd /s /q "%TEMP_DIR%"
del "%TEMP_ZIP%"

echo Update complete!

REM --- Install dependencies ---
echo Installing dependencies...
where npm
if %errorlevel% neq 0 (
    echo NPM not found. Please install Node.js and make sure npm is in PATH.
    pause
    exit /b
)
npm install

echo.
echo All done! Press any key to exit...
pause
