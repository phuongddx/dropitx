import { Card, CardContent } from "@/components/ui/card";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, var(--muted) 25%, var(--muted-foreground)/10 50%, var(--muted) 75%)",
  backgroundSize: "200% 100%",
};

export default function SearchLoading() {
  return (
    <div className="flex flex-1 flex-col items-center bg-background">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-4 py-12 animate-fade-in">
        <div className="h-7 w-24 rounded-md animate-shimmer" style={shimmerStyle} />

        <div className="h-9 w-full rounded-lg animate-shimmer" style={shimmerStyle} />

        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col gap-2.5 py-4">
              <div className="h-4 w-1/2 rounded-md animate-shimmer" style={shimmerStyle} />
              <div className="h-3 w-full rounded-md animate-shimmer" style={shimmerStyle} />
              <div className="h-3 w-1/3 rounded-md animate-shimmer" style={shimmerStyle} />
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
