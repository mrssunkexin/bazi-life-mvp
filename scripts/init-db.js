const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

console.log('Creating database at:', dbPath);

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database
const db = new Database(dbPath);

// Create Report table
db.exec(`
  CREATE TABLE IF NOT EXISTS Report (
    id TEXT PRIMARY KEY NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL,
    basicSummary TEXT NOT NULL DEFAULT '',
    fullContent TEXT NOT NULL DEFAULT '',
    publishAt DATETIME,
    formJson TEXT NOT NULL DEFAULT '{}'
  );
`);

console.log('✅ Database created successfully!');
console.log('📍 Location:', dbPath);

db.close();
