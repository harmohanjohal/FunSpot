@echo off
echo Starting Event App on port 8081...
cd /d "g:\Volume G data\SOCT Docker\eventapp"
set "JAVA_HOME=C:\Program Files\Java\jdk-18.0.2.1"
set "JWT_SECRET=soct_secret_key_2025_must_be_at_least_32_bytes_long_for_security_123456789"
set "PIXABAY_API_KEY=49345664-e289344f8497d7983c96d93f4"
set "CURRENCY_API_KEY=da8f8725a9a3fd222de9a9c04b9b038c"
set "GOOGLE_API_KEY=AIzaSyAdAZ_UNOF3iTBw8TeXSWLlGvpGjEtJCGA"
call "g:\Volume G data\SOCT Docker\.tools\apache-maven-3.9.9\bin\mvn.cmd" jetty:run
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Maven failed to start the service.
)
pause
