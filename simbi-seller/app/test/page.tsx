// @ts-nocheck
export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, the server is working!</p>
        <div className="mt-4 text-sm text-gray-500">
          Time: {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}