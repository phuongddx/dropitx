import { Card, CardContent, CardHeader } from "@/components/ui/card";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, var(--muted) 25%, var(--muted-foreground)/10 50%, var(--muted) 75%)",
  backgroundSize: "200% 100%",
};

export default function ShareLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 max-w-5xl mx-auto w-full">
      <Card className="animate-fade-in">
        <CardHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div className="size-5 rounded-md animate-shimmer" style={shimmerStyle} />
            <div className="h-5 w-1/2 rounded-md animate-shimmer" style={shimmerStyle} />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-28 rounded-md animate-shimmer" style={shimmerStyle} />
            <div className="h-3 w-16 rounded-md animate-shimmer" style={shimmerStyle} />
            <div className="h-3 w-24 rounded-md animate-shimmer" style={shimmerStyle} />
          </div>
        </CardHeader>
      </Card>

      <Card className="animate-fade-in">
        <CardContent className="p-2">
          <div
            className="h-[60vh] rounded-lg animate-shimmer"
            style={shimmerStyle}
          />
        </CardContent>
      </Card>
    </div>
  );
}
