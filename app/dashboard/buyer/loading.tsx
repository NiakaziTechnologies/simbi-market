export default function BuyerDashboardLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-20 w-64 bg-white/5 rounded mb-8" />
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card rounded-lg p-6 h-32" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
