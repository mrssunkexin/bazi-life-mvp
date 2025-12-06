-- =====================================================
-- 八字命理分析系统 - MySQL 数据库初始化脚本
-- =====================================================
-- 使用方法：
-- 1. 在MySQL客户端或第三方平台（阿里云/腾讯云）执行此脚本
-- 2. 或者使用命令: mysql -u用户名 -p数据库名 < init-mysql.sql
-- =====================================================

-- 设置字符编码
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =====================================================
-- 1. 用户表 (User)
-- =====================================================
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `User_phone_key` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. 券码表 (Voucher)
-- =====================================================
CREATE TABLE IF NOT EXISTS `Voucher` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `usedAt` DATETIME(3) NULL,
    `reportId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `Voucher_code_key` (`code`),
    UNIQUE INDEX `Voucher_reportId_key` (`reportId`),
    INDEX `Voucher_reportId_idx` (`reportId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. 报告表 (Report)
-- =====================================================
CREATE TABLE IF NOT EXISTS `Report` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',

    -- 用户关联（可选）
    `userId` VARCHAR(191) NULL,

    -- 基本信息
    `name` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `birthDate` VARCHAR(191) NOT NULL,
    `birthTime` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT '中国',
    `city` VARCHAR(191) NOT NULL DEFAULT '',
    `longitude` DOUBLE NULL,
    `latitude` DOUBLE NULL,

    -- 八字信息
    `baziYear` VARCHAR(191) NOT NULL DEFAULT '',
    `baziMonth` VARCHAR(191) NOT NULL DEFAULT '',
    `baziDay` VARCHAR(191) NOT NULL DEFAULT '',
    `baziHour` VARCHAR(191) NOT NULL DEFAULT '',
    `trueSolarTime` VARCHAR(191) NOT NULL DEFAULT '',
    `wuxing` TEXT NOT NULL,
    `dayun` TEXT NOT NULL,

    -- 报告内容
    `title` VARCHAR(191) NOT NULL,
    `basicSummary` TEXT NOT NULL,
    `fullContent` LONGTEXT NOT NULL,
    `publishAt` DATETIME(3) NULL,

    -- 原始表单数据
    `formJson` TEXT NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `Report_userId_idx` (`userId`),
    INDEX `Report_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 验证表结构
-- =====================================================
-- 显示所有表
SHOW TABLES;

-- 显示 User 表结构
DESCRIBE `User`;

-- 显示 Voucher 表结构
DESCRIBE `Voucher`;

-- 显示 Report 表结构
DESCRIBE `Report`;

-- =====================================================
-- 完成提示
-- =====================================================
SELECT '✅ 数据库初始化完成！' as message;
