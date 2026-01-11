/**
 * 周公解梦数据导入脚本
 * 从 GitHub 下载 JSON 数据并生成 SQL 导入语句
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// GitHub 原始文件 URL
const DATA_URL = 'https://raw.githubusercontent.com/saiwaiyanyu/tensorflow-bert-seq2seq-dream-decoder/master/data/data.csv';

// 输出文件路径
const OUTPUT_DIR = path.join(__dirname, '../data');
const SQL_OUTPUT = path.join(OUTPUT_DIR, 'dreams_import.sql');
const CLEANED_JSON = path.join(OUTPUT_DIR, 'dreams_cleaned.json');

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 下载 JSON 数据
 */
function downloadData() {
  return new Promise((resolve, reject) => {
    console.log('📥 开始下载数据...');

    https.get(DATA_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('✅ 数据下载完成');
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 清洗单条记录
 */
function cleanRecord(record) {
  // 去除前后空格
  let keyword = (record.dream || '').trim();
  let interpretation = (record.decode || '').trim();

  // 过滤空值
  if (!keyword || !interpretation) {
    return null;
  }

  // 长度限制
  if (keyword.length > 200) {
    keyword = keyword.substring(0, 200);
  }

  // 清理多余空格和换行符
  keyword = keyword.replace(/\s+/g, ' ');
  interpretation = interpretation.replace(/\s+/g, ' ');

  // 去除可能的引号问题（但保留内容中的引号）
  keyword = keyword.replace(/^["']|["']$/g, '');

  return {
    keyword,
    interpretation
  };
}

/**
 * SQL 转义字符串
 */
function escapeSql(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "''")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * 清洗和去重数据
 */
function cleanData(rawData) {
  console.log('🧹 开始清洗数据...');

  const lines = rawData.trim().split('\n');
  const records = [];
  const seenKeywords = new Set();

  let duplicates = 0;
  let invalid = 0;

  for (const line of lines) {
    try {
      const record = JSON.parse(line);
      const cleaned = cleanRecord(record);

      if (!cleaned) {
        invalid++;
        continue;
      }

      // 去重：如果关键词已存在，跳过
      if (seenKeywords.has(cleaned.keyword)) {
        duplicates++;
        continue;
      }

      seenKeywords.add(cleaned.keyword);
      records.push(cleaned);
    } catch (err) {
      console.warn('⚠️ 解析失败，跳过:', line.substring(0, 50));
      invalid++;
    }
  }

  console.log(`✅ 数据清洗完成:`);
  console.log(`   - 原始记录: ${lines.length}`);
  console.log(`   - 有效记录: ${records.length}`);
  console.log(`   - 去重数量: ${duplicates}`);
  console.log(`   - 无效数量: ${invalid}`);

  return records;
}

/**
 * 生成 SQL 插入语句
 */
function generateSql(records) {
  console.log('📝 生成 SQL 语句...');

  let sql = `-- 周公解梦数据导入脚本
-- 生成时间: ${new Date().toISOString()}
-- 记录数量: ${records.length}

-- 创建表（如果不存在）
CREATE TABLE IF NOT EXISTS dreams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(200) NOT NULL COMMENT '梦境关键词',
  interpretation TEXT NOT NULL COMMENT '解梦内容',
  view_count INT DEFAULT 0 COMMENT '查看次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_keyword (keyword),
  FULLTEXT INDEX idx_fulltext_keyword (keyword)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 清空现有数据（可选，首次导入时使用）
-- TRUNCATE TABLE dreams;

-- 批量插入数据
INSERT INTO dreams (keyword, interpretation) VALUES\n`;

  // 分批插入，每 500 条一个 INSERT 语句
  const batchSize = 500;
  const batches = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const values = batch.map(record =>
      `('${escapeSql(record.keyword)}', '${escapeSql(record.interpretation)}')`
    ).join(',\n');

    batches.push(values);
  }

  sql += batches.join(';\n\nINSERT INTO dreams (keyword, interpretation) VALUES\n');
  sql += ';\n';

  console.log(`✅ SQL 生成完成，共 ${batches.length} 个批次`);

  return sql;
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始处理周公解梦数据...\n');

    // 1. 下载数据
    const rawData = await downloadData();

    // 2. 清洗数据
    const cleanedRecords = cleanData(rawData);

    // 3. 保存清洗后的 JSON（可选，用于检查）
    console.log('💾 保存清洗后的 JSON...');
    fs.writeFileSync(
      CLEANED_JSON,
      cleanedRecords.map(r => JSON.stringify(r)).join('\n'),
      'utf8'
    );
    console.log(`✅ 已保存到: ${CLEANED_JSON}`);

    // 4. 生成 SQL
    const sql = generateSql(cleanedRecords);

    // 5. 保存 SQL 文件
    console.log('💾 保存 SQL 文件...');
    fs.writeFileSync(SQL_OUTPUT, sql, 'utf8');
    console.log(`✅ 已保存到: ${SQL_OUTPUT}`);

    console.log('\n🎉 全部完成！');
    console.log('\n📖 使用方法:');
    console.log('   1. 在 MySQL 中执行 SQL 文件:');
    console.log(`      mysql -u root -p your_database < ${SQL_OUTPUT}`);
    console.log('   2. 或者直接在数据库工具中导入 SQL 文件');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 执行
main();
