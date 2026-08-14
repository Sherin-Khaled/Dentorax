import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  account?: boolean;
  /** Wider shell for content-dense pages (e.g. the products catalogue) that
   * benefit from more usable width than standard text/content pages. Reuses
   * the same wide-shell sizing already established by `account`. */
  wide?: boolean;
}

export function Container({ children, className, account = false, wide = false }: ContainerProps) {
  return (
    <div
      className={cn(
        "box-border mx-auto w-full px-5 sm:px-8 lg:px-12",
        account || wide
          ? "max-w-[1680px] lg:px-[clamp(1.5rem,2.5vw,3rem)]"
          : "max-w-[1344px]",
        className
      )}
    >
      {children}
    </div>
  );
}
