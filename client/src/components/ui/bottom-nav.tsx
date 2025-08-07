"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconButtonProps } from "@/data/type";
import { useHydration } from "@/hooks/useHydration";

interface BottomNavProps {
  items: IconButtonProps[];
}

export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();
  const mounted = useHydration();

  if (!mounted) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--secondary)] py-2 px-4 rounded-t-3xl">
      <div className="flex justify-around items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--secondary)]"
                  : "text-[var(--primary)]"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
