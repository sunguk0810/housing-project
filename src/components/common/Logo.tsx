import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
type Variant = "full" | "symbol" | "wordmark";

interface LogoProps {
  size?: Size;
  variant?: Variant;
  className?: string;
}

interface SizeConfig {
  symbolHeight: number;
  symbolWidth: number;
  fontSize: string;
  strokeWidth: number;
  gap: number;
}

const SIZE_MAP: Record<Size, SizeConfig> = {
  sm: { symbolHeight: 8, symbolWidth: 11.2, fontSize: "13px", strokeWidth: 2.0, gap: 6 },
  md: { symbolHeight: 10, symbolWidth: 14, fontSize: "15px", strokeWidth: 2.4, gap: 9 },
  lg: { symbolHeight: 20, symbolWidth: 28, fontSize: "28px", strokeWidth: 3.2, gap: 12 },
};

function Symbol({ size }: { size: Size }) {
  const { symbolWidth, symbolHeight, strokeWidth } = SIZE_MAP[size];
  return (
    <svg
      width={symbolWidth}
      height={symbolHeight}
      viewBox="0 0 14 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 10L7 0L14 10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Wordmark({ size }: { size: Size }) {
  const { fontSize } = SIZE_MAP[size];
  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 800,
        fontSize,
        letterSpacing: "-0.05em",
        lineHeight: 1,
      }}
    >
      집콕신혼
    </span>
  );
}

export function Logo({ size = "md", variant = "full", className }: LogoProps) {
  const { gap } = SIZE_MAP[size];

  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={{ color: "var(--ci-mark)", gap: variant === "full" ? gap : undefined }}
    >
      {(variant === "full" || variant === "symbol") && <Symbol size={size} />}
      {(variant === "full" || variant === "wordmark") && <Wordmark size={size} />}
    </span>
  );
}
