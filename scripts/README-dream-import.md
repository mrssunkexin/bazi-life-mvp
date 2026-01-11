# 周公解梦数据导入说明

## 概述

这个脚本从 GitHub 下载周公解梦数据（33,000+ 条记录），清洗后生成 SQL 导入语句。

## 数据源

- **项目**: [saiwaiyanyu/tensorflow-bert-seq2seq-dream-decoder](https://github.com/saiwaiyanyu/tensorflow-bert-seq2seq-dream-decoder)
- **数据文件**: `data/data/csv/train.json`
- **记录数量**: 约 33,000 条
- **数据格式**: JSON（每行一个对象）

## 数据清洗流程

脚本会自动执行以下清洗操作：

1. ✅ **去重**: 相同关键词只保留一条
2. ✅ **过滤空值**: 去除 keyword 或 interpretation 为空的记录
3. ✅ **长度限制**: keyword 最长 200 字符
4. ✅ **文本清理**: 去除多余空格、换行符
5. ✅ **SQL 转义**: 防止 SQL 注入，正确处理特殊字符

## 使用方法

### 1. 安装依赖（无需额外依赖）

脚本只使用 Node.js 内置模块，无需安装任何依赖。

### 2. 运行脚本

```bash
cd /Users/huayin/bazi-life-mvp
node scripts/import-dream-data.js
```

### 3. 输出文件

脚本会在 `data/` 目录下生成两个文件：

- `dreams_cleaned.json` - 清洗后的 JSON 数据（用于检查）
- `dreams_import.sql` - SQL 导入语句（用于导入数据库）

### 4. 导入数据库

有两种方式导入数据：

#### 方式 1: 命令行导入（推荐）

```bash
# 如果使用本地 MySQL
mysql -u root -p your_database < data/dreams_import.sql

# 如果使用云数据库
mysql -h your-host -u your-user -p your_database < data/dreams_import.sql
```

#### 方式 2: 使用数据库工具

1. 打开 Navicat / DBeaver / phpMyAdmin
2. 选择目标数据库
3. 执行 SQL 文件 `data/dreams_import.sql`

## 数据库表结构

```sql
CREATE TABLE dreams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  keyword VARCHAR(200) NOT NULL COMMENT '梦境关键词',
  interpretation TEXT NOT NULL COMMENT '解梦内容',
  view_count INT DEFAULT 0 COMMENT '查看次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_keyword (keyword),
  FULLTEXT INDEX idx_fulltext_keyword (keyword)
);
```

## 字段说明

| 字段 | 类型 | 说明 | 数据来源 |
|------|------|------|----------|
| `id` | INT | 自增主键 | 自动生成 |
| `keyword` | VARCHAR(200) | 梦境关键词（如"梦见蛇"） | 来自 JSON 的 `dream` 字段 |
| `interpretation` | TEXT | 解梦内容 | 来自 JSON 的 `decode` 字段 |
| `view_count` | INT | 查看次数（用于统计热门） | 默认 0 |
| `created_at` | TIMESTAMP | 创建时间 | 自动生成 |
| `updated_at` | TIMESTAMP | 更新时间 | 自动更新 |

## 性能优化

- ✅ **批量插入**: 每 500 条记录一个 INSERT 语句
- ✅ **索引优化**:
  - 普通索引 `idx_keyword` 用于精确查询
  - 全文索引 `idx_fulltext_keyword` 用于模糊搜索

## 注意事项

1. **首次导入**: 表会自动创建，无需手动建表
2. **重复导入**: 脚本中有 `TRUNCATE TABLE dreams` 语句（已注释），如需清空重导，取消注释即可
3. **字符集**: 使用 `utf8mb4_unicode_ci`，支持表情符号和所有中文字符
4. **存储引擎**: 使用 InnoDB，支持事务和外键

## 示例查询

导入完成后，可以使用以下 SQL 测试：

```sql
-- 查看总记录数
SELECT COUNT(*) FROM dreams;

-- 精确查询
SELECT * FROM dreams WHERE keyword = '梦见蛇';

-- 模糊查询（使用 LIKE）
SELECT * FROM dreams WHERE keyword LIKE '%蛇%' LIMIT 10;

-- 全文搜索（更快）
SELECT * FROM dreams
WHERE MATCH(keyword) AGAINST('蛇' IN NATURAL LANGUAGE MODE)
LIMIT 10;

-- 查看最热门的梦境
SELECT keyword, view_count
FROM dreams
ORDER BY view_count DESC
LIMIT 20;
```

## 故障排除

### 问题 1: 下载失败

**原因**: 网络连接问题或 GitHub 限流

**解决方案**:
1. 检查网络连接
2. 重新运行脚本
3. 或手动下载 JSON 文件后修改脚本读取本地文件

### 问题 2: SQL 导入失败

**原因**: 数据库用户权限不足

**解决方案**:
```sql
GRANT ALL PRIVILEGES ON your_database.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### 问题 3: 全文索引不工作

**原因**: MySQL 默认最小搜索长度为 4

**解决方案**:
```sql
-- 查看当前设置
SHOW VARIABLES LIKE 'ft_min_word_len';

-- 修改配置（需重启 MySQL）
-- 在 my.cnf 中添加:
[mysqld]
ft_min_word_len = 2

-- 重建索引
ALTER TABLE dreams DROP INDEX idx_fulltext_keyword;
ALTER TABLE dreams ADD FULLTEXT INDEX idx_fulltext_keyword (keyword);
```

## 下一步

数据导入完成后，你可以：

1. 在小程序中添加周公解梦页面
2. 实现搜索功能（支持模糊搜索和全文搜索）
3. 添加热门梦境推荐（基于 `view_count`）
4. 添加分类功能（可以后续扩展 `category` 字段）
