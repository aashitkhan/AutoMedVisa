$headers = @{ Authorization = "Bearer $token" }
$body = @{ submittedJobTitle = "Taxi Driver"; visaCode = "UAE-DRV-01"; country = "UAE" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/verification" -Method Post -Headers $headers -ContentType "application/json" -Body $body

#$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -ContentType "application/json" -Body '{"name":"Test Worker","email":"worker1@test.com","password":"test123","role":"worker"}'
#$response#
#$token = $response.token#