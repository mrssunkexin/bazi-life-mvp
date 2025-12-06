# 后续开发指南

## 🎯 当前进度

✅ **已完成：**
1. 完整的八字算法系统（十神、藏干、神煞、格局、大运）
2. Claude AI 集成
3. 前端异步生成（用户无需等待）
4. 管理后台基础功能

---

## 📋 待实现功能

### 1. 后台：报告内容分模块展示

**目标**：在管理后台编辑页面，每个章节独立显示，方便编辑。

**实现步骤**：

1. **修改报告数据结构**（可选）
   - 在数据库增加字段存储各章节（或解析 Markdown）
   - 或直接解析 `fullContent` 按 `##` 分割

2. **创建模块化编辑器**
   ```typescript
   // app/admin/reports/[id]/page.tsx

   // 解析报告为章节
   const sections = fullContent.split(/(?=^## )/gm).filter(Boolean);

   // 显示
   {sections.map((section, index) => (
     <div key={index} className="mb-6 p-4 border rounded">
       <h3>章节 {index + 1}</h3>
       <textarea
         value={section}
         onChange={(e) => updateSection(index, e.target.value)}
         rows={10}
         className="w-full"
       />
     </div>
   ))}
   ```

---

### 2. 后台：预览功能（Web + 移动端双屏）

**目标**：编辑时右侧显示预览，支持 Web 和移动端切换。

**实现步骤**：

1. **安装 React Markdown**（已安装）
   ```bash
   npm install react-markdown
   ```

2. **创建预览组件**
   ```typescript
   // components/ReportPreview.tsx
   'use client';

   import ReactMarkdown from 'react-markdown';
   import { useState } from 'react';

   export default function ReportPreview({ content }: { content: string }) {
     const [mode, setMode] = useState<'web' | 'mobile'>('web');

     return (
       <div className="sticky top-4">
         {/* 切换按钮 */}
         <div className="mb-4 flex gap-2">
           <button
             onClick={() => setMode('web')}
             className={mode === 'web' ? 'active' : ''}
           >
             💻 Web 预览
           </button>
           <button
             onClick={() => setMode('mobile')}
             className={mode === 'mobile' ? 'active' : ''}
           >
             📱 移动端预览
           </button>
         </div>

         {/* 预览区域 */}
         <div className={mode === 'mobile' ? 'w-[375px] mx-auto' : 'w-full'}>
           <div className="bg-white border rounded-lg p-6 shadow-sm">
             <ReactMarkdown className="prose max-w-none">
               {content}
             </ReactMarkdown>
           </div>
         </div>
       </div>
     );
   }
   ```

3. **集成到编辑页面**
   ```typescript
   // app/admin/reports/[id]/page.tsx

   <div className="grid grid-cols-2 gap-6">
     {/* 左侧：编辑器 */}
     <div>
       <textarea value={content} onChange={...} />
     </div>

     {/* 右侧：预览 */}
     <ReportPreview content={content} />
   </div>
   ```

---

### 3. 前端：五行雷达图

**目标**：用雷达图展示五行比例。

**实现步骤**：

1. **安装图表库**
   ```bash
   npm install recharts
   ```

2. **创建五行雷达图组件**
   ```typescript
   // components/WuxingRadar.tsx
   'use client';

   import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

   export default function WuxingRadar({ wuxing }: { wuxing: any }) {
     const data = [
       { subject: '木', value: wuxing.wood },
       { subject: '火', value: wuxing.fire },
       { subject: '土', value: wuxing.earth },
       { subject: '金', value: wuxing.metal },
       { subject: '水', value: wuxing.water },
     ];

     return (
       <ResponsiveContainer width="100%" height={300}>
         <RadarChart data={data}>
           <PolarGrid />
           <PolarAngleAxis dataKey="subject" />
           <PolarRadiusAxis angle={90} domain={[0, 100]} />
           <Radar
             name="五行"
             dataKey="value"
             stroke="#8884d8"
             fill="#8884d8"
             fillOpacity={0.6}
           />
         </RadarChart>
       </ResponsiveContainer>
     );
   }
   ```

3. **集成到报告页面**
   ```typescript
   // app/reports/[id]/page.tsx

   import WuxingRadar from '@/components/WuxingRadar';

   <div className="mb-8">
     <h2>五行分析</h2>
     <WuxingRadar wuxing={JSON.parse(report.wuxing)} />
   </div>
   ```

---

### 4. 前端：大运时间轴图表

**目标**：横向时间轴展示大运。

**实现步骤**：

1. **使用 Recharts 创建时间轴**
   ```typescript
   // components/DayunTimeline.tsx
   'use client';

   import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

   export default function DayunTimeline({ dayunList }: { dayunList: any[] }) {
     const data = dayunList.map(d => ({
       name: d.ganzhi,
       range: [d.startAge, d.endAge],
       quality: d.quality,
     }));

     const colorMap = {
       '大吉': '#10b981',
       '吉': '#84cc16',
       '平': '#gray-400',
       '凶': '#f59e0b',
       '大凶': '#ef4444',
     };

     return (
       <div className="w-full overflow-x-auto">
         <div className="min-w-[800px]">
           <ResponsiveContainer width="100%" height={200}>
             <BarChart data={data} layout="vertical">
               <CartesianGrid strokeDasharray="3 3" />
               <XAxis type="number" domain={[0, 100]} label={{ value: '年龄', position: 'bottom' }} />
               <YAxis type="category" dataKey="name" />
               <Tooltip />
               <Bar dataKey="range">
                 {data.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={colorMap[entry.quality]} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>

         {/* 图例 */}
         <div className="flex gap-4 mt-4 justify-center text-sm">
           <span>🟢 大吉</span>
           <span>🟡 吉</span>
           <span>⚪ 平</span>
           <span>🟠 凶</span>
           <span>🔴 大凶</span>
         </div>
       </div>
     );
   }
   ```

---

## 🚀 快速实现建议

### 最小可行方案（1-2小时）

1. **只做预览功能**
   - 在管理后台右侧添加预览
   - 使用 `react-markdown` 渲染
   - 简单的 Web/移动端切换

2. **只做五行雷达图**
   - 安装 `recharts`
   - 在报告页面顶部添加雷达图
   - 美化一下样式

### 完整方案（1天）

按照上面的详细步骤，逐个实现所有功能。

---

## 📦 需要安装的包

```bash
# 图表库
npm install recharts

# 已安装
npm install react-markdown  # ✅ 已安装
npm install @anthropic-ai/sdk  # ✅ 已安装
```

---

## 🎨 参考设计

### 管理后台布局
```
┌─────────────────────────────────────┐
│  编辑报告              [保存] [预览] │
├──────────────┬──────────────────────┤
│              │                      │
│  模块1       │   💻 Web  📱 Mobile  │
│  [编辑区]    │                      │
│              │   ┌────────────┐    │
│  模块2       │   │  预览内容  │    │
│  [编辑区]    │   │            │    │
│              │   │  [Markdown]│    │
│  模块3       │   │            │    │
│  [编辑区]    │   └────────────┘    │
│              │                      │
└──────────────┴──────────────────────┘
```

### 报告页面（用户端）
```
┌─────────────────────┐
│  张三的八字报告      │
├─────────────────────┤
│  📊 五行雷达图       │
│  [交互式图表]        │
├─────────────────────┤
│  📅 大运时间轴       │
│  [横向条形图]        │
├─────────────────────┤
│  详细分析...         │
└─────────────────────┘
```

---

## ⚠️ 注意事项

1. **藏干的60% 30% 10%是正确的**
   - 这是传统命理标准
   - 已改为显示"本气、中气、余气"

2. **十神统计已修复**
   - 不再出现0.5
   - 全部为整数

3. **异步生成已完成**
   - 用户立即看到报告
   - AI 后台生成

---

## 💡 下一步建议

**优先级排序：**

1. 🔥 **高优先级**：预览功能（提升编辑体验）
2. 🔥 **高优先级**：五行雷达图（用户最直观）
3. ⭐ **中优先级**：大运时间轴（增强视觉效果）
4. ⭐ **中优先级**：模块化编辑（管理员效率）

**建议顺序：**
1. 先做预览（最快见效）
2. 再做五行图（用户喜欢）
3. 最后优化编辑体验

---

## 🎉 当前系统已具备

- ✅ 完整的算法引擎
- ✅ AI 深度分析
- ✅ 异步生成
- ✅ 管理后台
- ✅ 用户端展示
- ✅ 响应式设计

**可以直接上线运营！**

剩余功能都是"锦上添花"，不影响核心使用。

---

需要我帮你实现其中某一个功能吗？我建议先做**预览功能**，这个最快最实用！
