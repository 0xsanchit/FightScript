import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Cover } from "@/app/components/ui/cover"


interface CompetitionCardProps {
  title: string
  description: string
  emoji: string
  href: string
}

export function CompetitionCard({ title, description, emoji, href }: CompetitionCardProps) {
  return (
    <div className="relative group">
      {/* Glow effect container */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-0 group-hover:opacity-75 transition duration-500"></div>
      
      {/* Main card */}
      <Card className="relative bg-background/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 border border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{emoji}</span>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="text-gray-400">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Link href={href} className="block">
            <Cover className="w-full">
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300"
              >
                Let the AI Battle Begin
              </Button>
            </Cover>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
} 