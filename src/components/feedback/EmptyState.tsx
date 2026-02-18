'use client';

import Link from 'next/link';
import { Lightbulb, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateAction {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  iconVariant?: 'info' | 'warning';
  title: string;
  description: string;
  tips?: string[];
  primaryAction: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

const STAGGER_MS = 80;

function ActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction;
  variant: 'default' | 'outline';
}) {
  const ActionIcon = action.icon;
  const content = (
    <>
      {ActionIcon && <ActionIcon size={16} aria-hidden="true" />}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Button variant={variant} size="default" asChild>
        <Link href={action.href}>{content}</Link>
      </Button>
    );
  }
  return (
    <Button variant={variant} size="default" onClick={action.onClick}>
      {content}
    </Button>
  );
}

export function EmptyState({
  icon: Icon,
  iconVariant = 'info',
  title,
  description,
  tips,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const isWarning = iconVariant === 'warning';

  const ringColor = isWarning
    ? 'rgba(217,119,6,0.06)'
    : 'rgba(8,145,178,0.06)';
  const ringColorOuter = isWarning
    ? 'rgba(217,119,6,0.03)'
    : 'rgba(8,145,178,0.03)';

  return (
    <div
      role="status"
      className={cn(
        'flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-[var(--space-4)]',
        className,
      )}
    >
      {/* Icon with concentric rings */}
      <div
        className="relative flex items-center justify-center"
        style={{ animation: `fadeSlideUp 400ms var(--ease-out-expo) both` }}
      >
        {/* Outer ring */}
        <div
          className="absolute size-[140px] rounded-full"
          style={{ background: ringColorOuter }}
        />
        {/* Middle ring */}
        <div
          className="absolute size-[104px] rounded-full"
          style={{ background: ringColor }}
        />
        {/* Icon circle */}
        <div
          className={cn(
            'relative z-[1] flex size-[72px] items-center justify-center rounded-full',
            isWarning
              ? 'bg-amber-50 text-[var(--color-warning)]'
              : 'bg-[var(--color-brand-50)] text-[var(--color-brand-500)]',
          )}
        >
          <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
        </div>

        {/* Decorative dots */}
        <span
          className={cn(
            'absolute size-[6px] rounded-full',
            isWarning ? 'bg-amber-200' : 'bg-[var(--color-brand-200)]',
          )}
          style={{ top: '8px', right: '16px' }}
          aria-hidden="true"
        />
        <span
          className={cn(
            'absolute size-[4px] rounded-full',
            isWarning ? 'bg-amber-100' : 'bg-[var(--color-brand-100)]',
          )}
          style={{ bottom: '12px', left: '10px' }}
          aria-hidden="true"
        />
        <span
          className={cn(
            'absolute size-[5px] rounded-full',
            isWarning ? 'bg-amber-200/60' : 'bg-[var(--color-brand-200)]/60',
          )}
          style={{ top: '24px', left: '6px' }}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h2
        className="mt-[var(--space-6)] text-center text-[length:var(--text-title)] font-bold text-[var(--color-on-surface)]"
        style={{
          animation: `fadeSlideUp 400ms var(--ease-out-expo) ${STAGGER_MS}ms both`,
        }}
      >
        {title}
      </h2>

      {/* Description */}
      <p
        className="mt-[var(--space-2)] max-w-xs text-center text-[length:var(--text-body-sm)] leading-relaxed text-[var(--color-on-surface-muted)]"
        style={{
          animation: `fadeSlideUp 400ms var(--ease-out-expo) ${STAGGER_MS * 2}ms both`,
        }}
      >
        {description}
      </p>

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div
          className="mt-[var(--space-6)] w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-sunken)]"
          style={{
            animation: `fadeSlideUp 400ms var(--ease-out-expo) ${STAGGER_MS * 3}ms both`,
          }}
        >
          <div className="flex items-center gap-[var(--space-2)] border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)]">
            <div className="flex size-6 items-center justify-center rounded-full bg-[var(--color-brand-50)]">
              <Lightbulb
                size={14}
                className="text-[var(--color-brand-400)]"
                aria-hidden="true"
              />
            </div>
            <span className="text-[length:var(--text-caption)] font-semibold text-[var(--color-on-surface)]">
              도움이 될 만한 팁
            </span>
          </div>
          <ul className="space-y-[var(--space-2)] px-[var(--space-4)] py-[var(--space-3)]">
            {tips.slice(0, 2).map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-[var(--space-2)] text-[length:var(--text-caption)] leading-[var(--text-caption-lh)] text-[var(--color-on-surface-muted)]"
              >
                <span className="mt-[1px] inline-block size-[5px] shrink-0 rounded-full bg-[var(--color-brand-300)]" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Primary CTA */}
      <div
        className="mt-[var(--space-8)]"
        style={{
          animation: `fadeSlideUp 400ms var(--ease-out-expo) ${STAGGER_MS * (tips ? 4 : 3)}ms both`,
        }}
      >
        <ActionButton action={primaryAction} variant="default" />
      </div>

      {/* Secondary action */}
      {secondaryAction && (
        <div
          className="mt-[var(--space-3)]"
          style={{
            animation: `fadeSlideUp 400ms var(--ease-out-expo) ${STAGGER_MS * (tips ? 5 : 4)}ms both`,
          }}
        >
          <ActionButton action={secondaryAction} variant="outline" />
        </div>
      )}
    </div>
  );
}
