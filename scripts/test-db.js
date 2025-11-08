const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

try {
  // Test connection
  const count = db.prepare('SELECT COUNT(*) as count FROM Report').get();
  console.log('✅ 数据库连接成功！');
  console.log(`📊 当前报告数量: ${count.count}`);

  // Show table structure
  const columns = db.prepare("PRAGMA table_info(Report)").all();
  console.log('\n📋 数据表结构:');
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type}`);
  });

} catch (error) {
  console.error('❌ 数据库错误:', error.message);
} finally {
  db.close();
}
