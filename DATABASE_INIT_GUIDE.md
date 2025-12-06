# MySQL 数据库初始化指南

本指南说明如何在第三方MySQL数据库（阿里云、腾讯云等）初始化八字命理分析系统的数据库。

## 📁 文件说明

- **init-mysql.sql**: MySQL数据库初始化脚本（3.5KB）

## 🗂 数据库结构

系统包含 3 张表：

### 1. User（用户表）
- `id`: 用户唯一ID
- `phone`: 手机号（唯一）
- `password`: 加密密码
- `createdAt`, `updatedAt`: 时间戳

### 2. Voucher（券码表）
- `id`: 券码ID
- `code`: 30位随机券码（唯一）
- `isUsed`: 是否已使用
- `reportId`: 关联的报告ID

### 3. Report（报告表）
- 基本信息：姓名、性别、出生日期时间、地点
- 八字信息：年月日时柱、真太阳时
- 五行与大运：JSON格式存储
- 报告内容：标题、摘要、完整内容（最长64MB）

## 🚀 使用方法

### 方法 1：在阿里云/腾讯云控制台执行

1. **登录数据库管理控制台**
   - 阿里云：RDS 控制台 → SQL窗口
   - 腾讯云：云数据库TencentDB → SQL操作

2. **创建数据库**（如果还没创建）
   ```sql
   CREATE DATABASE bazi_life CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE bazi_life;
   ```

3. **执行初始化脚本**
   - 复制 `init-mysql.sql` 文件的全部内容
   - 粘贴到SQL窗口
   - 点击"执行"

4. **验证结果**
   ```sql
   SHOW TABLES;
   ```
   应该看到 3 张表：User, Voucher, Report

### 方法 2：使用 MySQL 命令行

```bash
# 连接到数据库
mysql -h 数据库地址 -u 用户名 -p

# 选择数据库
USE bazi_life;

# 执行初始化脚本
source /path/to/init-mysql.sql;

# 或者直接导入
mysql -h 数据库地址 -u 用户名 -p bazi_life < init-mysql.sql
```

### 方法 3：使用图形化工具

**支持的工具**：
- Navicat
- MySQL Workbench
- DBeaver
- DataGrip

**步骤**：
1. 连接到数据库
2. 打开 `init-mysql.sql` 文件
3. 执行脚本

## 📊 字段类型说明

| 类型 | 说明 | 用途 |
|------|------|------|
| VARCHAR(191) | 短文本 | ID、姓名、干支等 |
| TEXT | 中等文本（64KB） | JSON数据、摘要 |
| LONGTEXT | 长文本（4GB） | 完整报告内容 |
| DATETIME(3) | 毫秒级时间戳 | 创建/更新时间 |
| DOUBLE | 浮点数 | 经纬度 |
| BOOLEAN | 布尔值 | 是否使用 |

## 🔗 获取数据库连接字符串

初始化完成后，您需要获取连接字符串用于部署：

### 格式
```
mysql://用户名:密码@主机地址:端口/数据库名
```

### 示例
```env
# 阿里云 RDS
DATABASE_URL=mysql://root:MyPass123@rm-xxxxxx.mysql.rds.aliyuncs.com:3306/bazi_life

# 腾讯云 TencentDB
DATABASE_URL=mysql://root:MyPass123@cdb-xxxxxx.tencentcdb.com:3306/bazi_life

# 本地测试
DATABASE_URL=mysql://root:123456@localhost:3306/bazi_life
```

## ⚠️ 注意事项

1. **字符编码**
   - 必须使用 `utf8mb4` 编码
   - 支持中文和 emoji

2. **索引优化**
   - `User.phone`: 唯一索引（快速查找用户）
   - `Report.userId`, `Report.createdAt`: 普通索引（提升查询性能）
   - `Voucher.reportId`: 索引（关联查询）

3. **存储空间**
   - 每份报告约 50-100KB
   - 建议数据库至少 1GB 空间
   - 1000 份报告 ≈ 100MB

4. **安全建议**
   - 使用强密码
   - 限制远程访问IP
   - 定期备份数据

## 🧪 验证安装

执行以下SQL验证表结构：

```sql
-- 查看所有表
SHOW TABLES;

-- 查看 User 表结构
DESCRIBE `User`;

-- 查看 Report 表结构
DESCRIBE `Report`;

-- 查看字符编码
SHOW VARIABLES LIKE 'character_set%';

-- 查看排序规则
SHOW VARIABLES LIKE 'collation%';
```

## 🆘 常见问题

### Q1: 提示字符集错误
**A**: 确保数据库使用 utf8mb4 编码：
```sql
ALTER DATABASE bazi_life CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
```

### Q2: 表已存在
**A**: 脚本使用 `IF NOT EXISTS`，重复执行安全。如需重建：
```sql
DROP TABLE IF EXISTS `Report`;
DROP TABLE IF EXISTS `Voucher`;
DROP TABLE IF EXISTS `User`;
```

### Q3: DATETIME(3) 不支持
**A**: MySQL 5.6.4+ 才支持毫秒。如果版本过低，改为：
```sql
`createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
```

## 📱 下一步

1. ✅ 数据库初始化完成
2. 📝 记录数据库连接字符串
3. 🚀 在部署平台配置环境变量
4. 🌐 部署应用

连接字符串示例：
```env
DATABASE_URL=mysql://用户名:密码@主机:端口/bazi_life
```

## 📞 技术支持

如有问题，请查看：
- [部署文档](./DEPLOYMENT.md)
- [Prisma文档](https://www.prisma.io/docs)
