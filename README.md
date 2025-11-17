# empatspeech-demo

Up the proyect:
pnpm

INSTALL A NEW DEPENDENCY
pnpm -F @app/frontend add react-hook-form zod @hookform/resolvers

pnpm --filter @app/frontend dev

Modify any type in root:
pnpm -C packages/shared build

Paths/

### Con el servidor corriendo

## Check service status

# Health

```bash
curl http://localhost:4000/v1/health
```

HealthOutput:
{"ok":true,"timestamp":"2025-11-15T21:04:46.523Z"}

```bash
curl -X POST http://localhost:4000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "role": "Teacher"
  }'

```

Response: {"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....."}

Save token:
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

Create Session:

```bash
curl -X POST http://localhost:4000/v1/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "studentEmail": "student@example.com",
    "notes": "Primera sesión de prueba",
    "seed": 42
  }'
```

CreateSessionOutput
{
"id": "b07ad682-6f52-4cf8-87ab-5a0e4f47a3de",
"teacherId": "9beb1edd-8c46-476b-9eb9-50557175f686",
"studentId": "a5bcb0e3-1c12-4e7d-9d3c-0adf19e7e001",
"notes": "Primera sesión de prueba",
"status": "active",
"createdAtIso": "2025-11-15T20:00:00.000Z"
}

saved:
SESSION_ID=68b36ec5-e4e0-44e4-a765-59df2f64d417

Add Correct Trial:

```bash
curl -X POST http://localhost:4000/v1/sessions/$SESSION_ID/trials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "correct": true
  }'

```

AddCorrectTrialOutput:
{
"sessionId":"68b36ec5-e4e0-44e4-a765-59df2f64d417",
"totalTrials":1,
"accuracyPercent":100
}

Add incorrect Trial:

```bash
curl -X POST http://localhost:4000/v1/sessions/$SESSION_ID/trials   -H "Content-Type: application/json"   -H "Authorization: Bearer $TOKEN"   -d '{
    "correct": false
  }'
```

AddIncorrectTrialOutput:
{"sessionId":"68b36ec5-e4e0-44e4-a765-59df2f64d417","totalTrials":2,"accuracyPercent":50}

AddNotes:

```bash
curl -X PATCH http://localhost:4000/v1/sessions/$SESSION_ID/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "notes": "New Note"
  }'
```

AddNoteOutput:
{"sessionId":"68b36ec5-e4e0-44e4-a765-59df2f64d417","notes":"New Note"}

EndSession:

```bash

curl -X POST <http://localhost:4000/v1/sessions/$SESSION_ID/finish> \
 -H "Authorization: Bearer $TOKEN"

```

EndSessionOutput:
{"sessionId":"68b36ec5-e4e0-44e4-a765-59df2f64d417","finishedAtIso":"2025-11-15T21:04:01.065Z"}
