# 老黄历功能速查表

## 🚀 快速启动（3步）

```bash
# 1. 在微信开发者工具中：工具 → 构建 npm

# 2. 启动后端服务器
cd /Users/huayin/bazi-life-mvp
npm run dev

# 3. 在微信开发者工具中点击"编译"
```

---

## 📁 重要文件路径

### 后端文件
```
/Users/huayin/bazi-life-mvp/app/api/calendar/route.ts    # 黄历 API
/Users/huayin/bazi-life-mvp/lib/calendar-utils.ts        # 黄历工具函数
```

### 小程序文件
```
/Users/huayin/miniprogram-1/pages/calendar/              # 黄历页面
/Users/huayin/miniprogram-1/pages/my/                    # 我的页面
/Users/huayin/miniprogram-1/utils/api.js                 # API 封装
/Users/huayin/miniprogram-1/app.json                     # TabBar 配置
/Users/huayin/miniprogram-1/config.js                    # 环境配置
```

---

## 🔧 常用命令

### 后端开发
```bash
# 启动开发服务器
cd /Users/huayin/bazi-life-mvp
npm run dev

# 测试黄历 API
curl "http://localhost:3000/api/calendar"
curl "http://localhost:3000/api/calendar?date=2025-12-27"
```

### 小程序开发
```bash
# 安装依赖（如果还没安装）
cd /Users/huayin/miniprogram-1
npm install

# 运行验证脚本
node test-lunar.js

# 创建临时图标（如果还没创建）
./create-temp-icons.sh
```

---

## 🎯 API 接口

### 获取黄历数据
```
GET /api/calendar
GET /api/calendar?date=YYYY-MM-DD
```

**返回数据结构**:
```json
{
  "success": true,
  "data": {
    "solar": { ... },           // 公历信息
    "lunar": { ... },           // 农历信息
    "ganZhi": { ... },          // 干支
    "wuxing": { ... },          // 五行
    "jieQi": { ... },           // 节气
    "jieQiTag": { ... },        // 节令标签
    "festival": { ... },        // 节日
    "yiJi": { ... },            // 宜忌
    "chongSha": { ... },        // 冲煞
    "zhiRiXingShen": { ... },   // 值日星神
    "jiShenFangWei": { ... },   // 吉神方位
    "shiChen": [ ... ]          // 时辰吉凶
  }
}
```

---

## ⚙️ 环境切换

### 开发环境
编辑 `/Users/huayin/miniprogram-1/config.js`:
```javascript
const ENV = 'development';
```

### 生产环境
编辑 `/Users/huayin/miniprogram-1/config.js`:
```javascript
const ENV = 'production';
```

---

## 🧪 测试检查清单

### 基础功能
- [ ] 黄历页面加载成功
- [ ] 左右滑动切换日期
- [ ] 当前时辰高亮
- [ ] 下拉刷新
- [ ] TabBar 切换

### 数据验证
- [ ] 农历日期正确
- [ ] 干支正确
- [ ] 宜忌完整
- [ ] 节气时间精确

### 对比网站
- https://www.bmcx.com/
- 中华万年历 App
- 日历通 App

---

## 🎨 TabBar 图标

### 当前状态
✅ 已创建临时图标（用于测试）
⚠️ 发布前需替换专业图标

### 图标列表
```
/Users/huayin/miniprogram-1/images/
├── tab-calendar.png           # 黄历（未选中）
├── tab-calendar-active.png    # 黄历（选中）
├── tab-fortune.png            # 运势（未选中）
├── tab-fortune-active.png     # 运势（选中）
├── tab-my.png                 # 我的（未选中）
└── tab-my-active.png          # 我的（选中）
```

### 替换方法
1. 设计或下载 81x81px 的 PNG 图标
2. 覆盖上述 6 个文件
3. 重新编译小程序

---

## 🐛 常见问题

### 问题：找不到 lunar-javascript
**解决**: 在微信开发者工具中"工具 → 构建 npm"

### 问题：网络请求失败
**解决**:
1. 确认后端服务器已启动
2. 检查 config.js 中的 ENV 设置

### 问题：时辰高亮不对
**解决**: 等待1分钟自动更新，或下拉刷新

### 问题：TabBar 图标显示异常
**解决**: 确认 6 个图标文件都存在于 images/ 目录

---

## 📚 参考文档

| 文档 | 路径 | 用途 |
|------|------|------|
| 完成报告 | IMPLEMENTATION_COMPLETE.md | 查看完成情况 |
| 快速上手 | QUICK_START_GUIDE.md | 快速开始使用 |
| 实施状态 | CALENDAR_IMPLEMENTATION_STATUS.md | 详细状态 |
| 实施计划 | ~/.claude/plans/warm-discovering-patterson.md | 详细计划 |
| lunar-javascript | https://6tail.cn/calendar/api.html | 算法库文档 |

---

## 🔑 关键代码片段

### 调用黄历 API（小程序）
```javascript
const api = require('../../utils/api');

// 获取今天的黄历
const result = await api.getCalendarData();

// 获取指定日期的黄历
const result = await api.getCalendarData('2025-12-27');
```

### 格式化日期
```javascript
formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### 获取当前时辰
```javascript
const hour = new Date().getHours();
const shiChenMap = {
  23: '子时', 0: '子时',
  1: '丑时', 2: '丑时',
  // ... 其他时辰
};
const currentShiChen = shiChenMap[hour];
```

---

## 📊 项目统计

- **新建文件**: 23 个
- **修改文件**: 3 个
- **代码行数**: 约 2,000 行
- **开发时间**: 约 6 小时
- **完成度**: 95%

---

## ✅ 发布前检查

- [ ] 替换专业 TabBar 图标
- [ ] 切换到生产环境（config.js）
- [ ] 验证所有功能正常
- [ ] 测试真机运行
- [ ] 检查数据准确性
- [ ] 添加免责声明（如需要）

---

保存此文档以便快速查阅！
