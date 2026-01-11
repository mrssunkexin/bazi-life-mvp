# 周公解梦数据导入统计报告

## 📊 数据概览

- **数据源**: [saiwaiyanyu/tensorflow-bert-seq2seq-dream-decoder](https://github.com/saiwaiyanyu/tensorflow-bert-seq2seq-dream-decoder)
- **原始记录数**: 33,830 条
- **有效记录数**: **33,808 条**
- **去重数量**: 22 条
- **无效记录**: 0 条
- **数据完整率**: 99.93%

## 🗂️ 数据结构

### 字段信息

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `keyword` | VARCHAR(200) | 梦境关键词 | "梦见蛇" |
| `interpretation` | TEXT | 解梦内容 | "梦见蛇是吉兆，预示着..." |
| `view_count` | INT | 查看次数（初始为0） | 0 |
| `created_at` | TIMESTAMP | 创建时间（自动生成） | 2026-01-09 14:18:26 |
| `updated_at` | TIMESTAMP | 更新时间（自动更新） | 2026-01-09 14:18:26 |

### 索引信息

- ✅ **主键**: `id` (自增)
- ✅ **普通索引**: `idx_keyword` (用于精确查询)
- ✅ **全文索引**: `idx_fulltext_keyword` (用于模糊搜索)

## 📁 生成的文件

1. **dreams_cleaned.json** (33,808 行)
   - 清洗后的 JSON 数据
   - 每行一个 JSON 对象
   - 用于数据验证和备份

2. **dreams_import.sql** (33,963 行)
   - SQL 导入脚本
   - 包含建表语句
   - 68 个批次，每批最多 500 条记录

## 🧹 数据清洗过程

脚本执行了以下清洗操作：

1. ✅ **去重**: 移除了 22 条重复的关键词
2. ✅ **过滤空值**: 确保所有记录都有 keyword 和 interpretation
3. ✅ **长度限制**: keyword 限制在 200 字符以内
4. ✅ **文本清理**: 去除多余空格、统一换行符
5. ✅ **SQL 转义**: 正确处理引号、反斜杠等特殊字符

## 📈 数据样例

### 样例 1: 简单解梦
```json
{
  "keyword": "梦到体育教练",
  "interpretation": "暗示你的投资不会有利润。"
}
```

### 样例 2: 详细解梦
```json
{
  "keyword": "梦见与贵族说话",
  "interpretation": "若平静的说话，表示会发生烦恼的事;若是对方骂你，表示幸运即将来临;相反的，若你骂对方，则为凶兆，一定会遭遇灾难。"
}
```

### 样例 3: 复杂梦境
```json
{
  "keyword": "梦见墙上种着一棵白菜",
  "interpretation": "其二是梦见自己在屋里打伞；其三梦见自己和小姨光着身子背对着背躺在一张床上。"
}
```

## 💾 导入数据库

### 方式 1: 命令行（推荐）

```bash
# 本地 MySQL
mysql -u root -p your_database < data/dreams_import.sql

# 云数据库
mysql -h your-host -u your-user -p your_database < data/dreams_import.sql
```

### 方式 2: 图形工具

使用 Navicat / DBeaver / phpMyAdmin 等工具直接导入 `dreams_import.sql` 文件。

## 🔍 测试查询

导入完成后，可以使用以下 SQL 测试：

### 1. 查看总记录数
```sql
SELECT COUNT(*) FROM dreams;
-- 预期结果: 33808
```

### 2. 精确查询
```sql
SELECT * FROM dreams WHERE keyword = '梦见蛇';
```

### 3. 模糊查询（LIKE）
```sql
SELECT keyword, interpretation 
FROM dreams 
WHERE keyword LIKE '%蛇%' 
LIMIT 10;
```

### 4. 全文搜索（推荐，更快）
```sql
SELECT keyword, interpretation
FROM dreams
WHERE MATCH(keyword) AGAINST('蛇' IN NATURAL LANGUAGE MODE)
LIMIT 10;
```

### 5. 查看最热门的梦境
```sql
SELECT keyword, view_count
FROM dreams
ORDER BY view_count DESC
LIMIT 20;
```

## ⚙️ 性能优化建议

1. **批量插入**: 已使用每 500 条记录一个 INSERT 语句
2. **索引优化**: 
   - 普通索引支持快速精确查询
   - 全文索引支持高效模糊搜索
3. **字符集**: utf8mb4_unicode_ci 支持所有中文和 emoji
4. **存储引擎**: InnoDB 支持事务和更好的并发性能

## 📝 后续工作建议

1. **添加分类字段**: 可以根据关键词自动归类（如动物、人物、场景等）
2. **添加标签系统**: 支持多标签分类和搜索
3. **热度统计**: 记录每个梦境的查看次数，推荐热门梦境
4. **相关推荐**: 基于关键词相似度推荐相关梦境
5. **用户反馈**: 添加评分和评论功能

## ✅ 数据质量评估

- **完整性**: ★★★★★ (99.93%)
- **准确性**: ★★★★☆ (需人工抽查验证)
- **一致性**: ★★★★★ (格式统一)
- **时效性**: ★★★★☆ (传统解梦内容，较为稳定)

---

**生成时间**: 2026-01-09 14:18:26  
**脚本版本**: v1.0  
**处理耗时**: ~5秒
