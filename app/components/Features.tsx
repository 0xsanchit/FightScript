import { CheckCircle, Zap, Users, TrendingUp } from "lucide-react"

const features = [
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Task Management",
    description: "Organize and prioritize tasks with ease.",
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Real-time Collaboration",
    description: "Work together seamlessly in real-time.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Team Communication",
    description: "Stay connected with built-in messaging.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Analytics Dashboard",
    description: "Track progress and gain insights with powerful analytics.",
  },
]

export default function Features() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Advanced AI</h3>
          <p className="text-gray-400">Challenge yourself against our sophisticated AI opponents</p>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Global Rankings</h3>
          <p className="text-gray-400">Compete with players worldwide and climb the leaderboards</p>
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Multiple Games</h3>
          <p className="text-gray-400">Choose from various games to test different skills</p>
        </div>
      </div>
    </section>
  )
}

