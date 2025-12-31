# 老黄历功能快速上手指南

## 🎯 立即开始使用

### 第一步：创建 TabBar 图标（5分钟）

#### 方法 1：使用在线工具（推荐）

访问 **iconfont.cn**（阿里巴巴矢量图标库）:

1. 搜索关键词：
   - "日历" 或 "calendar" → 用于黄历 Tab
   - "星星" 或 "fortune" → 用于运势 Tab
   - "用户" 或 "user" → 用于我的 Tab

2. 下载图标并编辑：
   - 尺寸：81x81px
   - 格式：PNG
   - 颜色：灰色 (#999999) 和紫色 (#667eea)

3. 保存到项目：
   ```
   /Users/huayin/miniprogram-1/images/
   ```

#### 方法 2：使用 Figma（专业）

1. 新建 81x81 画布
2. 绘制简单图标（圆形、方形、icon字体等）
3. 导出为 PNG
4. 灰色版本 + 紫色版本各一套

#### 方法 3：复制现有图标（临时方案）

如果暂时没有设计资源，可以先用同一个图标：

```bash
cd /Users/huayin/miniprogram-1/images
# 复制 qrcode.jpg 作为临时占位（仅用于测试）
cp qrcode.jpg tab-calendar.png
cp qrcode.jpg tab-calendar-active.png
cp qrcode.jpg tab-fortune.png
cp qrcode.jpg tab-fortune-active.png
cp qrcode.jpg tab-my.png
cp qrcode.jpg tab-my-active.png
```

**注意**：这只是临时方案，实际发布前需要替换成专业图标。

---

### 第二步：更新 app.json 添加图标路径（1分钟）

打开 `/Users/huayin/miniprogram-1/app.json`，在 `tabBar.list` 中添加图标路径：

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#667eea",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/calendar/calendar",
        "text": "黄历",
        "iconPath": "images/tab-calendar.png",
        "selectedIconPath": "images/tab-calendar-active.png"
      },
      {
        "pagePath": "pages/index/index",
        "text": "运势",
        "iconPath": "images/tab-fortune.png",
        "selectedIconPath": "images/tab-fortune-active.png"
      },
      {
        "pagePath": "pages/my/my",
        "text": "我的",
        "iconPath": "images/tab-my.png",
        "selectedIconPath": "images/tab-my-active.png"
      }
    ]
  }
}
```

---

### 第三步：构建小程序 npm（1分钟）

在微信开发者工具中：

1. 打开项目：`/Users/huayin/miniprogram-1`
2. 点击菜单：**工具 → 构建 npm**
3. 等待构建完成（显示"构建完成"）
4. 检查是否生成了 `miniprogram_npm/lunar-javascript/` 目录

---

### 第四步：启动后端服务器（1分钟）

打开终端：

```bash
cd /Users/huayin/bazi-life-mvp
npm run dev
```

等待服务器启动（通常是 `http://localhost:3000`）

---

### 第五步：配置小程序开发环境（1分钟）

编辑 `/Users/huayin/miniprogram-1/config.js`：

```javascript
// 将环境设置为开发模式
const ENV = 'development';  // 修改这一行

module.exports.current = module.exports[ENV];
```

---

### 第六步：在微信开发者工具中测试（2分钟）

1. 打开微信开发者工具
2. 导入项目：`/Users/huayin/miniprogram-1`
3. 点击"编译"
4. 测试功能：
   - [ ] 查看黄历页面是否正常显示
   - [ ] 左滑切换到下一天
   - [ ] 右滑切换到上一天
   - [ ] 点击"运势" Tab，查看原首页是否正常
   - [ ] 点击"我的" Tab，查看占位页面

---

## ✅ 验证清单

### 功能验证
- [ ] 黄历页面加载成功，显示今天的日期
- [ ] 农历日期显示正确
- [ ] 宜忌内容完整展示（不省略）
- [ ] 左右滑动可以切换日期
- [ ] 当前时辰高亮（如现在是下午3点，"申时"应该高亮）
- [ ] TabBar 三个 Tab 都可以正常切换
- [ ] 运势 Tab 进入后是原来的首页表单
- [ ] 下拉刷新功能正常

### 数据验证
打开黄历页面，对比在线黄历（https://www.bmcx.com/）：

- [ ] 农历日期一致
- [ ] 干支信息一致
- [ ] 宜忌内容大部分一致（可能有小差异，属正常）
- [ ] 冲煞信息一致
- [ ] 节气时间接近（误差在1分钟内）

---

## 🐛 常见问题

### 问题 1：小程序编译报错 "找不到 lunar-javascript"

**解决方案**：
1. 确认已在项目中运行 `npm install lunar-javascript`
2. 在微信开发者工具中点击"工具 → 构建 npm"
3. 检查是否生成了 `miniprogram_npm` 目录

### 问题 2：黄历页面加载失败，提示"网络请求失败"

**解决方案**：
1. 确认后端服务器已启动（`npm run dev`）
2. 检查 `config.js` 中的 `ENV` 是否设置为 `'development'`
3. 检查后端 API 地址是否正确（默认 `http://localhost:3000`）

### 问题 3：TabBar 显示异常或报错

**解决方案**：
1. 确认 6 个图标文件都已创建并放置在 `images/` 目录
2. 确认 `app.json` 中的图标路径正确
3. 确认图标尺寸为 81x81px
4. 确认图标格式为 PNG

### 问题 4：切换日期后数据不更新

**解决方案**：
1. 检查浏览器控制台是否有 API 错误
2. 在后端检查 `/api/calendar?date=YYYY-MM-DD` 是否正常返回数据
3. 清除小程序缓存后重试

### 问题 5：时辰高亮不准确

**解决方案**：
- 检查小程序和电脑的时间是否一致
- 每分钟会自动更新，等待片刻看是否自动更正

---

## 📱 真机测试步骤

在微信开发者工具中：

1. 点击"预览"
2. 用微信扫描二维码
3. 在手机上测试：
   - 滑动切换日期是否流畅
   - 时辰高亮是否准确
   - Tab 切换是否正常
   - 下拉刷新是否正常

---

## 🚀 发布前检查

准备发布到生产环境前，确保：

### 1. 切换到生产环境
编辑 `/Users/huayin/miniprogram-1/config.js`：
```javascript
const ENV = 'production';  // 修改为 production
```

### 2. 替换为专业图标
- 不再使用临时占位图标
- 使用专业设计的 TabBar 图标

### 3. 数据准确性验证
- 至少验证 5 个不同日期的数据
- 包括普通日期、节气日、节日等

### 4. 性能测试
- 首屏加载时间 < 2 秒
- 切换日期响应时间 < 500ms

### 5. 兼容性测试
- 在不同机型测试（iOS/Android）
- 在不同微信版本测试

---

## 📊 快速验证数据准确性

运行验证脚本：

```bash
cd /Users/huayin/miniprogram-1
node test-lunar.js
```

输出结果对比在线黄历，确保准确性 > 95%。

---

## 💡 优化建议

### 立即可做的优化
1. 添加黄历数据缓存（5分钟有效期）
2. 预加载前后各1天的数据
3. 添加 loading 骨架屏

### 后续可以考虑的功能
1. 日历选择器（点击日历图标跳转到任意日期）
2. 收藏功能（收藏重要日期）
3. 分享功能（分享黄历卡片）
4. 通知提醒（重要节气提醒）

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 `CALENDAR_IMPLEMENTATION_STATUS.md` 了解完整实施状态
2. 查看 `/Users/huayin/.claude/plans/warm-discovering-patterson.md` 了解详细计划
3. 参考 lunar-javascript 官方文档：https://6tail.cn/calendar/api.html

---

祝你顺利完成老黄历功能！🎉
