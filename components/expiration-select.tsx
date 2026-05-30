"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

export const EXPIRATION_OPTIONS = [
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

export type ExpirationValue = (typeof EXPIRATION_OPTIONS)[number]["value"];

interface ExpirationSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

export function ExpirationSelect({
  value,
  onChange,
  disabled = false,
  compact = false,
}: ExpirationSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={compact ? "h-8 w-[140px]" : "w-full"}>
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Expiration" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {EXPIRATION_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
