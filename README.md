# empatspeech-demo

Comando para levantar el frontend:

pnpm --filter @app/frontend dev

demia@demian01 MINGW64 ~/Desktop/vilo/empatspeech-demo (feature/backend)
$ curl -X POST <http://localhost:4000/api/v1/sessions> \
 -H "Content-Type: application/json" \
 -d '{
"slpId": "5a7d2c4b-3f81-4b94-9a8d-bd9f7a2cbb02",
"studentId": "8b3d1a2f-4c9b-4f1e-8a9b-b2c3d4e5f003",
"notes": "Primera sesión demo",
"seed": 12345
}'
{"sessionId":"79b55207-5f31-4acc-b2ee-811a9915e8dd","seed":12345,"createdAtIso":"2025-11-12T11:49:40.395Z"}

<http://localhost:3000/sessions/79b55207-5f31-4acc-b2ee-811a9915e8dd/play?userId=5a7d2c4b-3f81-4b94-9a8d-bd9f7a2cbb02>

<http://localhost:3000/sessions/79b55207-5f31-4acc-b2ee-811a9915e8dd/play?userId=8b3d1a2f-4c9b-4f1e-8a9b-b2c3d4e5f003>
