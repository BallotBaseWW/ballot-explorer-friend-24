
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface NavItemProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function NavItem({ to, icon, children, className, active }: NavItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
        className
      )}
    >
      {icon && <div className="w-4 h-4">{icon}</div>}
      <span>{children}</span>
    </Link>
  );
}
