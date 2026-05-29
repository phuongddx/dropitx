import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Lightning Upload",
    description:
      "Drag and drop your file and get a link in under a second. No sign-up, no friction.",
  },
  {
    icon: Shield,
    title: "Secure Sharing",
    description:
      "Every link is unique and unlisted. Files auto-expire after 30 days so nothing lingers forever.",
  },
  {
    icon: BarChart3,
    title: "Track Everything",
    description:
      "See view counts and basic analytics on every drop. Know your content reached its audience.",
  },
];

export function ProofCards() {
  return (
    <section className="px-6 max-[720px]:px-4 py-24 max-w-[1200px] mx-auto">
      {/* Section header */}
      <div className="flex flex-col items-center text-center gap-3 mb-14">
        <p className="eyebrow">Why DropItX</p>
        <h2 className="heading-fluid-md font-display font-bold tracking-tight">
          Everything you need
        </h2>
        <p className="text-muted-foreground text-base max-w-lg leading-relaxed">
          Simple, fast, and secure file sharing built for developers and teams
          who just want to get things done.
        </p>
      </div>

      {/* 3-column grid */}
      <div className="grid grid-cols-3 max-[1100px]:grid-cols-2 max-[920px]:grid-cols-1 gap-6">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            shadow
            className="group rounded-[var(--radius-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 transition-colors duration-300 group-hover:bg-primary/15">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
