"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PyeongOption } from "@/lib/price-utils";
import {cn} from "@/lib/utils";

interface AreaSelectProps {
  options: ReadonlyArray<PyeongOption>;
  selected: number | null;
  onSelect: (pyeong: number | null) => void;
  className?: string;
}

export function AreaSelect({
  options,
  selected,
  onSelect,
  className,
}: AreaSelectProps) {
  if (options.length <= 1) return null;

  return (
    <Select
      value={selected === null ? "all" : String(selected)}
      onValueChange={(val) => onSelect(val === "all" ? null : Number(val))}
    >
      <SelectTrigger size="sm" className={cn("w-[100px]", className)} aria-label="평수 선택">
        <SelectValue placeholder="전체" />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4} align="end">
        <SelectGroup>
          <SelectLabel>평수</SelectLabel>
          {options.map((opt) => (
            <SelectItem
              key={opt.value === null ? "all" : opt.value}
              value={opt.value === null ? "all" : String(opt.value)}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
