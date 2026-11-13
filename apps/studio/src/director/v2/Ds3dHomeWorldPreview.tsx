/** Large hero preview for the empty home state (shown above the preset strip). */
import React, { useEffect, useState } from 'react';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';
import { requestWorld3dThumb } from './world3dThumbs';

export function Ds3dHomeWorldPreview({ thumbKey, worldRef }: { thumbKey: string; worldRef: PrevisWorldRef }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => requestWorld3dThumb(thumbKey, worldRef, setUrl, 'hero'), [thumbKey, worldRef]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-[7.25rem] bottom-[min(46vh,400px)] z-[1] grid place-items-center px-4 pb-2"
      data-testid="ds3d-v2-home-hero-preview"
      aria-hidden
    >
      {url ? (
        <img
          src={url}
          alt=""
          draggable={false}
          className="max-h-full max-w-[min(720px,94vw)] select-none rounded-2xl object-contain opacity-80"
        />
      ) : (
        <span className="h-[min(38vh,280px)] w-[min(72vw,480px)] animate-pulse rounded-2xl bg-zinc-300/35 motion-reduce:animate-none" />
      )}
    </div>
  );
}
