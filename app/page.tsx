import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <main className="text-center max-w-2xl">
        <h1 className="text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
          BaZi Life Analysis
        </h1>
        <p className="text-xl text-gray-600 mb-12 leading-relaxed">
          Discover insights about your life path through traditional Chinese metaphysics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/calc"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm hover:shadow-md"
          >
            Get Started
          </Link>
        </div>

        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Features</h2>
          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl mb-2">📅</div>
              <h3 className="font-medium text-gray-900 mb-1">Birth Analysis</h3>
              <p className="text-sm text-gray-600">
                Enter your birth details for personalized insights
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-medium text-gray-900 mb-1">Element Reading</h3>
              <p className="text-sm text-gray-600">
                Understand your elemental strengths and weaknesses
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl border border-gray-100">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900 mb-1">Life Path</h3>
              <p className="text-sm text-gray-600">
                Receive guidance for your personal journey
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
