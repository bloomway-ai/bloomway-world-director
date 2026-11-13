/** OSS composer shell (product layout, no Sparks / canvas / speech). */
import React, { useRef, useState } from 'react';
import { DS3D_GLASS, DS3D_PRESSABLE, Ds3dIcon } from './ds3dChrome';

const MAX_LINES_PX = 148;

export type OssDs3dComposerProps = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy?: boolean;
  scopeLabel: string;
  placeholder: string;
  reply?: string | null;
};

export function OssDs3dComposer(p: OssDs3dComposerProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [h, setH] = useState(78);
  const canSend = !p.busy && p.value.trim().length >= 2;

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0';
    setH(Math.min(MAX_LINES_PX, Math.max(56, el.scrollHeight)));
  };

  return (
    <div
      className={`pointer-events-auto w-[min(720px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/10 bg-[#161b22]/95 shadow-[0_18px_50px_-14px_rgba(0,0,0,0.85)] ${DS3D_GLASS}`}
      data-testid="ds3d-v2-composer"
    >
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2 text-[11px] text-zinc-400">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 font-semibold text-zinc-200">
          <Ds3dIcon name="public" className="text-[14px] text-primary" />
          {p.scopeLabel}
        </span>
        <span className="text-zinc-500">Local rules · not Bloomway AI</span>
      </div>
      {p.reply ? (
        <p className="border-b border-white/[0.06] px-4 py-2 text-xs leading-relaxed text-zinc-300" data-testid="ds3d-v2-reply">
          {p.reply}
        </p>
      ) : null}
      <textarea
        ref={ref}
        value={p.value}
        rows={1}
        style={{ height: h }}
        onChange={(e) => {
          p.onChange(e.target.value);
          resize();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (canSend) p.onSend();
          }
        }}
        placeholder={p.placeholder}
        data-testid="ds3d-v2-text"
        className="block w-full resize-none bg-transparent px-4 pb-2 pt-2.5 text-[13.5px] leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500"
      />
      <div className="flex items-center gap-2 border-t border-white/[0.07] px-2.5 py-2">
        <span className="text-[11px] text-zinc-500">Shift+Enter for newline</span>
        <button
          type="button"
          onClick={p.onSend}
          disabled={!canSend}
          aria-label="Send"
          data-testid="ds3d-v2-generate"
          className={`${DS3D_PRESSABLE} ml-auto grid h-10 w-10 place-items-center rounded-full ${
            canSend
              ? 'bg-primary text-black shadow-[0_8px_20px_-6px_rgba(163,230,53,0.45)] hover:brightness-110'
              : 'cursor-not-allowed bg-zinc-700 text-zinc-500 opacity-60'
          }`}
        >
          <Ds3dIcon name={p.busy ? 'progress_activity' : 'arrow_upward'} className={`text-[22px] ${p.busy ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
