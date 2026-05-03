import {
  Shirt,
  SprayCan,
  Smartphone,
  FileText,
  Glasses,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { PackingCategory } from "@/lib/schemas";

const MAP: Record<PackingCategory["name"], LucideIcon> = {
  Clothing: Shirt,
  Toiletries: SprayCan,
  Electronics: Smartphone,
  Documents: FileText,
  Accessories: Glasses,
  "Special Items": Sparkles,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: PackingCategory["name"];
  className?: string;
}) {
  const Icon = MAP[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
