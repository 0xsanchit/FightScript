import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
          Challenge AI, Master Games
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Compete against advanced AI in chess and other strategic games. Test your skills, improve your gameplay, and climb the global leaderboards.
        </p>
      </div>
    </section>
  )
}

