'use client';

import ReactMarkdown from 'react-markdown';

interface ReportPreviewProps {
  content: string;
  title?: string;
}

export default function ReportPreview({ content, title }: ReportPreviewProps) {
  // 检测是否是错误内容
  const isError = content?.includes('报告生成失败') || content?.includes('错误类型') || content?.includes('错误信息');
  const isWaitingActivation = content === '待激活';
  const isGenerating = content === '报告生成中...';

  return (
    <div className="flex flex-col h-full">
      {/* 移除切换按钮，只显示小程序样式预览 */}

      {/* 预览区域 - 移除 sticky，允许随内容滚动 */}
      <div className="flex-1 overflow-auto bg-[#f5f5f5] rounded-lg p-4">
        {/* 固定宽度为375px，模拟小程序 */}
        <div className="mx-auto max-w-[375px]">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 报告内容 - 使用小程序样式 */}
            <div className="p-4">
              {/* 错误状态显示 */}
              {isError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl flex-shrink-0">⚠️</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-700 mb-3">报告生成失败</h3>
                      <div className="bg-white rounded-lg p-4 border border-red-100">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                          {content}
                        </pre>
                      </div>
                      <p className="text-sm text-red-600 mt-4">
                        💡 建议：检查服务器日志以获取更多信息，或尝试重新生成报告
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 待激活状态 */}
              {isWaitingActivation && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                  <span className="text-4xl">🔒</span>
                  <h3 className="text-lg font-bold text-yellow-700 mt-3 mb-2">报告待激活</h3>
                  <p className="text-sm text-yellow-600">请输入兑换码激活完整报告</p>
                </div>
              )}

              {/* 生成中状态 */}
              {isGenerating && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                  <span className="text-4xl animate-pulse">⏳</span>
                  <h3 className="text-lg font-bold text-blue-700 mt-3 mb-2">报告生成中...</h3>
                  <p className="text-sm text-blue-600">AI 正在分析您的八字，请稍候</p>
                </div>
              )}

              {/* 正常内容显示 - 小程序样式 */}
              {!isError && !isWaitingActivation && !isGenerating && (
                <div className="text-sm">
                  <ReactMarkdown
                    components={{
                    h1: ({ node, children, ...props }) => (
                      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-lg shadow-md p-4 mb-4 mt-6 first:mt-0" {...props}>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                          <span className="text-xl">📘</span>
                          {children}
                        </h1>
                      </div>
                    ),
                    h2: ({ node, children, ...props }) => (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-4 mt-5" {...props}>
                        <div className="flex items-center gap-2 mb-0">
                          <div className="w-1 h-6 bg-[#667eea] rounded-full"></div>
                          <h2 className="text-base font-bold text-gray-900">{children}</h2>
                        </div>
                      </div>
                    ),
                    h3: ({ node, children, ...props }) => (
                      <h3 className="text-sm font-bold text-gray-900 mt-4 mb-3 flex items-center gap-2" {...props}>
                        <span className="w-1.5 h-1.5 bg-[#667eea] rounded-full"></span>
                        {children}
                      </h3>
                    ),
                    h4: ({ node, children, ...props }) => (
                      <h4 className="text-sm font-semibold text-gray-800 mt-3 mb-2" {...props}>
                        {children}
                      </h4>
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="mb-3 text-gray-700 space-y-1.5" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="mb-3 text-gray-700 space-y-1.5 list-decimal list-inside" {...props} />
                    ),
                    li: ({ node, children, ...props }) => (
                      <li className="flex items-start gap-1.5 text-sm" {...props}>
                        <span className="text-[#667eea] mt-1 flex-shrink-0 text-xs">▸</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    strong: ({ node, children, ...props }) => (
                      <strong className="font-bold text-gray-900" {...props}>
                        {children}
                      </strong>
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-[#667eea]" {...props} />
                    ),
                    blockquote: ({ node, children, ...props }) => (
                      <blockquote className="border-l-2 border-[#667eea] bg-blue-50 pl-4 py-2 my-4 rounded-r-lg text-sm" {...props}>
                        <div className="text-gray-700 italic">{children}</div>
                      </blockquote>
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-red-600" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <div className="flex items-center justify-center my-6" {...props}>
                        <div className="flex-1 h-px bg-gray-200"></div>
                      </div>
                    ),
                    }}
                  >
                    {content || '*预览内容为空*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
