#  file_ProcessBackend

A Node.js backend application built with Express.js to handle file uploads, parsing, validation, and batch insertion into PostgreSQL through API endpoints.

### Express + Prisma + PostgreSQL + Neon Serverless

This backend API:

- Accepts `.csv`, `.xls`, `.xlsx` user data files  
- Validates and imports rows in batches  
- Logs skipped or duplicate entries  
- Returns paginated & filtered user records  

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- Neon Serverless PostgreSQL
- Multer (file upload)
- csv-parser (streaming import)

## Features & Endpoints

---

### Upload File — Save to `/uploads`

**POST** `/files/upload`

- Field name: `file`
- Max size: **5MB**
- Allowed: `.csv`, `.xls`, `.xlsx`

#### Sample cURL
```sh
curl -X POST http://localhost:3000/files/upload   -H "Content-Type: multipart/form-data"   -F "file=@./sample-users.csv"
```

---

### Process Uploaded File

**POST** `/files/process-file`

Request body:
```json
{ "path": "uploads/my-file.csv" }
```

- Validates rows  
- Inserts in batches of **250**
- Logs invalid/duplicate rows to `/logs`

#### Sample cURL
```sh
curl -X POST http://localhost:3000/files/process-file   -H "Content-Type: application/json"   -d '{"path": "uploads/sample-users.csv"}'
```

---

###  Get Users (Pagination + Filters)

**GET** `/getUser?page=&limit=&education=`

Defaults:
- `page=1`
- `limit=50`
- `education` optional

#### Sample cURL
```sh
curl "http://localhost:3000/getUser?page=2&limit=25&education=Masters"
```

---

## Folder Structure

```
src/
 ├─ app.ts
 ├─ routes/
 ├─ controllers/
 ├─ services/
 ├─ db/
 ├─ generated/
uploads/
logs/
```

## Environment Variables

Create `.env`
```
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
```

## ▶Run Locally

```sh
npm install
npx prisma generate
npm run dev
```

Health check:
```
GET http://localhost:3000/
```

## Future Ideas

- S3 storage
- XLS/XLSX streaming
- Bulk background processing
- Authentication
