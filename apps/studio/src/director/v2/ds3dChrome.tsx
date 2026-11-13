/**
 * Shared floating chrome of the 3D Director workspace: one bar height (44px), one icon-button size (36px), one glass
 * surface, and hover / focus tooltips (first one waits, the next ones show immediately while moving along a bar).
 */
import React, { useEffect, useRef, useState } from 'react';

export const DS3D_GLASS =
  'border border-white/10 bg-[#0e0f13]/[0.86] shadow-[0_18px_50px_-14px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-[1.2]';
export const DS3D_PRESSABLE = 'transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] motion-reduce:transform-none';

export function Ds3dIcon({ name, className = '', fill }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span
      aria-hidden
      className={`material-symbols-outlined leading-none ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

export function Ds3dBar({ className = '', children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex h-11 items-center gap-0.5 rounded-[14px] p-[3px] ${DS3D_GLASS} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Ds3dBarSeparator() {
  return <span aria-hidden className="mx-1.5 h-[22px] w-px bg-white/10" />;
}

let lastTipHiddenAt = 0;

export type Ds3dIconButtonProps = {
  icon: string;
  label: string;
  shortcut?: string;
  active?: boolean;
  tone?: 'default' | 'record' | 'stop';
  disabled?: boolean;
  onClick?: () => void;
  testId?: string;
  /** Tooltip below (top bars) or above (bottom bars). */
  tipSide?: 'bottom' | 'top';
  fill?: boolean;
};

export function Ds3dIconButton({ icon, label, shortcut, active, tone = 'default', disabled, onClick, testId, tipSide = 'bottom', fill }: Ds3dIconButtonProps) {
  const [tip, setTip] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);
  const show = () => {
    if (timer.current) window.clearTimeout(timer.current);
    const warm = performance.now() - lastTipHiddenAt < 500;
    timer.current = window.setTimeout(() => setTip(true), warm ? 0 : 400);
  };
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setTip((was) => {
      if (was) lastTipHiddenAt = performance.now();
      return false;
    });
  };
  const toneCls =
    tone === 'stop'
      ? 'bg-red-500 text-white shadow-[0_6px_16px_-6px_rgba(239,68,68,0.7)] hover:bg-red-400'
      : active
        ? tone === 'record'
          ? 'bg-red-400/15 text-red-400'
          : 'bg-primary/15 text-primary'
        : tone === 'record'
          ? 'text-red-400 hover:bg-white/[0.08]'
          : 'text-zinc-300 hover:bg-white/[0.08] hover:text-zinc-50';
  return (
    <span className="relative inline-flex" onPointerEnter={show} onPointerLeave={hide}>
      <button
        type="button"
        onClick={() => {
          hide();
          onClick?.();
        }}
        disabled={disabled}
        aria-label={label}
        aria-pressed={active}
        data-testid={testId}
        onFocus={show}
        onBlur={hide}
        className={`${DS3D_PRESSABLE} grid h-9 w-9 place-items-center rounded-[10px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent ${toneCls}`}
      >
        {tone === 'stop' ? <span aria-hidden className="h-3 w-3 rounded-[3px] bg-white" /> : <Ds3dIcon name={icon} fill={fill} className="text-[20px]" />}
      </button>
      {tip ? (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-20 flex h-7 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0a0a0c]/95 pl-2.5 pr-1.5 text-xs font-semibold text-zinc-50 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)] ${
            tipSide === 'bottom' ? 'top-[calc(100%+8px)]' : 'bottom-[calc(100%+8px)]'
          }`}
        >
          {label}
          {shortcut ? <kbd className="rounded-[5px] bg-white/[0.08] px-1.5 py-0.5 font-sans text-[10.5px] font-semibold text-zinc-400">{shortcut}</kbd> : <span className="w-1" />}
        </span>
      ) : null}
    </span>
  );
}

export function Ds3dSegmented<T extends string | number>({
  value,
  options,
  onChange,
  testId,
}: {
  value: T;
  options: Array<{ value: T; label: React.ReactNode }>;
  onChange: (v: T) => void;
  testId?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1" role="radiogroup" data-testid={testId}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`${DS3D_PRESSABLE} inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold ${
              on ? 'bg-primary/15 text-primary' : 'bg-white/[0.05] text-zinc-300 hover:bg-white/[0.09]'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
