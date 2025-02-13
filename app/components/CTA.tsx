import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Begin?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Start your journey in competitive AI gaming today. Connect your wallet and enter the arena.
        </p>
        <Link href="/games/chess">
          <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Start Playing Now
          </Button>
        </Link>
      </div>
    </section>
  )
}

