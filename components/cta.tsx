import { Button } from "@/components/ui/button"
import { Wallet, Code } from "lucide-react"

export default function CTA() {
  return (
    <section className="border-t bg-gradient-to-b from-background to-background/80">
      <div className="container flex flex-col items-center gap-4 py-24 text-center md:py-32">
        <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Ready to join the AI revolution?</h2>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Connect your wallet, upload your AI agents, and start competing in the decentralized arena of Co3pe.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button size="lg" className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </Button>
          <Button size="lg" variant="outline" className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Submit AI Agent
          </Button>
        </div>
      </div>
    </section>
  )
}

