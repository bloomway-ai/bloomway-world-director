/** Empty-state home: light gray canvas; horizontal logo (green mark + dark Bloomway AI type) below the top bars. */
import React from 'react';

export function Ds3dHomeBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 bg-zinc-100" aria-hidden data-testid="ds3d-v2-home-backdrop">
      <div className="absolute left-1/2 top-[4.5rem] z-[1] w-full -translate-x-1/2 px-4">
        <img
          src="/brand/bloomway-wordmark-dark.png"
          alt="Bloomway AI"
          draggable={false}
          className="mx-auto h-10 w-auto max-w-[min(92vw,520px)] select-none opacity-60"
          data-testid="ds3d-v2-home-wordmark"
        />
      </div>
    </div>
  );
}
