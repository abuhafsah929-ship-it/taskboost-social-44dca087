import { Facebook, Instagram, Music2, Twitter, Youtube } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Platform = Database["public"]["Enums"]["task_platform"];

export const platformMeta: Record<Platform, { icon: typeof Facebook; label: string; color: string; bg: string }> = {
  facebook: { icon: Facebook, label: "Facebook", color: "#1877F2", bg: "bg-[#1877F2]/10" },
  instagram: { icon: Instagram, label: "Instagram", color: "#E1306C", bg: "bg-[#E1306C]/10" },
  tiktok: { icon: Music2, label: "TikTok", color: "#111827", bg: "bg-slate-200" },
  youtube: { icon: Youtube, label: "YouTube", color: "#FF0000", bg: "bg-[#FF0000]/10" },
  x: { icon: Twitter, label: "X", color: "#111827", bg: "bg-slate-200" },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const meta = platformMeta[platform];
  const Icon = meta.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg}`} style={{ color: meta.color }}>
      <Icon className="h-3.5 w-3.5" /> {meta.label}
    </div>
  );
}