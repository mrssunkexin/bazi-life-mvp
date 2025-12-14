2025-12-13 18:35:25 CST

- 在 `app/api/fortune-2026/route.ts` 增加 `autoActivate`（默认开启），在创建 2026 报告且兑换码有效后自动调用 `/api/fortune-2026/{id}/activate` 完成核销与生成触发。
- 返回体新增 `activationTriggered` 与 `activationResult`，便于前端获知激活是否已触发及错误信息；激活失败时仍保留已创建的报告并记录日志。

2025-12-13 18:52:00 CST

- 管理后台报告列表切换为调用 `/api/reports/mixed`，支持同时展示基础报告与 2026 报告。
- 扩展管理页 `Report` 类型加入 `reportType` 和 `buttonText`，并新增“报告类型”列：基础报告显示“五行分析”（或 `buttonText` 回退），2026 报告显示“2026运势分析”。

2025-12-13 19:05:00 CST

- 新增 2026 运势报告后台详情页 `app/admin/fortune-2026/[id]/page.tsx`，使用 `/api/fortune-2026/{id}`、`/api/fortune-2026/{id}/generation-logs`，支持保存/发布/重新生成（调用新接口）。
- 新增 `POST /api/fortune-2026/{id}/regenerate`，复用 AI 生成流程以覆盖报告内容。
- 管理后台列表的“编辑/查看”按 `reportType` 跳转 2026 报告至新页面。***
