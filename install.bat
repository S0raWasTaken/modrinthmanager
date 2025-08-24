@echo off
echo Installing Modrinth Manager CLI...

REM Build the project
echo Building project...
call npm run build

REM Create a batch file for Windows
echo Creating Windows batch file...
echo @echo off > "%USERPROFILE%\AppData\Local\Microsoft\WinGet\Packages\mr.bat"
echo node "%~dp0dist\cli.js" %%* >> "%USERPROFILE%\AppData\Local\Microsoft\WinGet\Packages\mr.bat"

REM Add to PATH if not already there
echo Adding to PATH...
set "PATH_TO_ADD=%USERPROFILE%\AppData\Local\Microsoft\WinGet\Packages"
echo %PATH% | find /i "%PATH_TO_ADD%" >nul
if errorlevel 1 (
    setx PATH "%PATH%;%PATH_TO_ADD%"
    echo Added to PATH. Please restart your command prompt.
) else (
    echo Already in PATH.
)

echo.
echo Installation complete!
echo You can now use 'mr' command from anywhere.
echo.
echo Examples:
echo   mr init
echo   mr search "fabric api"
echo   mr download fabric-api
echo   mr info fabric-api
pause
