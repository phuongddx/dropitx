import { Clock } from "lucide-react";

interface ExpiryBadgeProps {
  expiresAt: string | null;
  isExpired: boolean;
  formatExpiresIn: (expiresAt: string) => string;
}

export function ExpiryBadge({ expiresAt, isExpired, formatExpiresIn }: ExpiryBadgeProps) {
  if (!expiresAt) return null;

  if (isExpired) {
    return (
      <span className="flex items-center gap-1 text-destructive">
        <Clock className="size-3" />
        Expired
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Clock className="size-3" />
      Expires in {formatExpiresIn(expiresAt)}
    </span>
  );
}
