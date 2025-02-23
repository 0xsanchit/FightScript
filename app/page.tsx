import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import { CTA } from "@/components/cta"
import Footer from "@/components/footer"
import { Suspense } from "react"
import { LoadingState } from "@/components/ui/loading-state"
import { ClientDashboard } from "@/components/client-dashboard"

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <section className="py-20 bg-background/60 backdrop-blur-sm">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Active Competitions</h2>
              <div className="max-w-6xl mx-auto">
                <Suspense fallback={<LoadingState />}>
                  <ClientDashboard />
                </Suspense>
              </div>
            </div>
          </section>
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}

