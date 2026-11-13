import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PrevisPlan } from '@core/previsPlanCore.ts';
import { samplePrevisCamera, samplePrevisCharacter } from '@core/previsPlanCore.ts';
import { generatePrevisWorld } from '@core/previsWorldGen.ts';
import type { PrevisWorldRef } from '@core/previsWorldGen.ts';

const COLORS: Record<string, number> = {
  blue: 0x3b82f6,
  red: 0xef4444,
  yellow: 0xeab308,
};

export function PrevisCanvas({
  plan,
  worldRef,
  playing,
  timeSec,
  onTimeSecChange,
}: {
  plan: PrevisPlan;
  worldRef: PrevisWorldRef;
  playing: boolean;
  timeSec: number;
  onTimeSecChange?: (t: number) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(playing);
  const timeRef = useRef(timeSec);
  playingRef.current = playing;
  timeRef.current = timeSec;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.setClearColor(0x1a1a1e);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 400);
    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x888899, 0.45));

    const world = generatePrevisWorld(worldRef);
    for (const b of world.buildings) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(b.w, b.h, b.d),
        new THREE.MeshStandardMaterial({ color: 0x6b7280 }),
      );
      mesh.position.set(b.x, b.h / 2, -b.y);
      scene.add(mesh);
    }

    const capsules: THREE.Mesh[] = [];
    for (const ch of plan.characters) {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.25, 1.4, 4, 12),
        new THREE.MeshStandardMaterial({ color: COLORS[ch.color] ?? 0xaaaaaa }),
      );
      scene.add(mesh);
      capsules.push(mesh);
    }

    let raf = 0;
    let t = timeRef.current;
    const clock = new THREE.Clock();
    let lastReport = -1;

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (playingRef.current) {
        t += clock.getDelta();
        if (t >= plan.durationSec) {
          t = plan.durationSec;
          if (onTimeSecChange) onTimeSecChange(t);
        }
        if (onTimeSecChange && Math.abs(t - lastReport) > 0.05) {
          lastReport = t;
          onTimeSecChange(t);
        }
      } else {
        clock.getDelta();
        t = timeRef.current;
      }

      const cam = samplePrevisCamera(plan, t);
      camera.position.set(cam.position.x, cam.position.h, -cam.position.y);
      camera.lookAt(cam.target.x, cam.target.h, -cam.target.y);

      plan.characters.forEach((ch, i) => {
        const p = samplePrevisCharacter(ch, t);
        const mesh = capsules[i];
        if (mesh) mesh.position.set(p.x, 0.9, -p.y);
      });

      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [plan, worldRef, onTimeSecChange]);

  return (
    <div
      ref={hostRef}
      data-testid="previs-canvas-host"
      style={{ width: '100%', height: '100%', minHeight: 360 }}
    />
  );
}
