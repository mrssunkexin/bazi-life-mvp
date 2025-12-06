'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ReportPreviewProps {
  content: string;
  title?: string;
}

export default function ReportPreview({ content, title }: ReportPreviewProps) {
  const [mode, setMode] = useState<'web' | 'mobile'>('web');

  return (
    <div className="sticky top-4 h-[calc(100vh-2rem)] flex flex-col">
      {/* 切换按钮 */}
      <div className="mb-4 flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
        <button
          onClick={() => setMode('web')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
            mode === 'web'
              ? 'bg-blue-600 text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          💻 Web 预览
        </button>
        <button
          onClick={() => setMode('mobile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
            mode === 'mobile'
              ? 'bg-blue-600 text-white'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          📱 移动端预览
        </button>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 overflow-auto bg-gray-100 rounded-lg p-4">
        <div
          className={`mx-auto transition-all duration-300 ${
            mode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
          }`}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* 报告头部 */}
            {title && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <h1 className="text-2xl font-semibold">{title}</h1>
              </div>
            )}

            {/* 报告内容 */}
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, children, ...props }) => (
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg p-6 mb-6 mt-8 first:mt-0" {...props}>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                          <span className="text-3xl">📘</span>
                          {children}
                        </h1>
                      </div>
                    ),
                    h2: ({ node, children, ...props }) => (
                      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-2xl shadow-md border-2 border-gray-100 p-8 mb-4 mt-6" {...props}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-1.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                          <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
                        </div>
                      </div>
                    ),
                    h3: ({ node, children, ...props }) => (
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-4 flex items-center gap-3" {...props}>
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {children}
                      </h3>
                    ),
                    h4: ({ node, children, ...props }) => (
                      <h4 className="text-lg font-semibold text-gray-800 mt-5 mb-3 flex items-center gap-2" {...props}>
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        {children}
                      </h4>
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-gray-700 leading-7 mb-4 text-justify" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="mb-4 text-gray-700 space-y-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="mb-4 text-gray-700 space-y-2 list-decimal list-inside" {...props} />
                    ),
                    li: ({ node, children, ...props }) => (
                      <li className="flex items-start gap-2 ml-2" {...props}>
                        <span className="text-blue-500 mt-1.5 flex-shrink-0">▸</span>
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    strong: ({ node, children, ...props }) => (
                      <strong className="font-bold text-gray-900 bg-yellow-50 px-1 rounded" {...props}>
                        {children}
                      </strong>
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-blue-600 font-medium" {...props} />
                    ),
                    blockquote: ({ node, children, ...props }) => (
                      <blockquote className="border-l-4 border-blue-400 bg-blue-50 pl-6 py-4 my-6 rounded-r-lg" {...props}>
                        <div className="text-gray-700 italic">{children}</div>
                      </blockquote>
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-red-600" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <div className="flex items-center justify-center my-8" {...props}>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <span className="px-4 text-gray-400">✦</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      </div>
                    ),
                  }}
                >
                  {content || '*预览内容为空*'}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 模式说明 */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {mode === 'mobile' ? '宽度: 375px (移动端)' : '宽度: 100% (Web端)'}
      </div>
    </div>
  );
}
