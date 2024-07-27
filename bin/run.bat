@echo off
setlocal

cd /d %~dp0
set CLOrigin=D:\Projects\ChatApp\CLorigin.txt
set DatabaseCred=D:\Projects\ChatApp\DBcredentials.txt
set LogLocation=D:\Projects\ChatApp\bin\log\error.txt
start ChatApp.exe /i

endlocal
exit 