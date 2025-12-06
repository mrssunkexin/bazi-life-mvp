import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <main className="text-center max-w-2xl">
        <h1 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
          八字命理分析
        </h1>
        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          通过传统命理学，探索您的人生轨迹与命运密码
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/calc"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm hover:shadow-md"
          >
            开始测算
          </Link>
          <Link
            href="/dev"
            className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition shadow-sm hover:shadow-md"
          >
            🛠️ 开发预览
          </Link>
        </div>

        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-4">核心功能</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-medium text-gray-900 mb-1">生辰分析</h3>
              <p className="text-sm text-gray-600">
                输入您的出生信息，获得专属命理解读
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-medium text-gray-900 mb-1">五行解读</h3>
              <p className="text-sm text-gray-600">
                了解您的五行强弱与命格特征
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900 mb-1">人生指引</h3>
              <p className="text-sm text-gray-600">
                获取个人发展方向与趋势建议
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
