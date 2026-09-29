import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NODE_SPACING = 140;
const LINK_DISTANCE = 170;
const MOUSE_RADIUS = 180;

/**
 * Ambient network-node background. Canvas-based (cheaper than DOM nodes at
 * this density), pauses when off-screen or tab is hidden, and renders a
 * static grid with no animation loop at all under prefers-reduced-motion.
 */
export function AnimatedBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rafId = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      width = canvasEl.clientWidth;
      height = canvasEl.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((width * height) / (NODE_SPACING * NODE_SPACING)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
      }));
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function draw() {
      if (!running) return;
      ctx!.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.6;
          node.x += (dx / (dist || 1)) * force;
          node.y += (dy / (dist || 1)) * force;
        }
      }

      ctx!.strokeStyle = 'rgba(69, 240, 192, 0.08)';
      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DISTANCE) {
            const opacity = 1 - dist / LINK_DISTANCE;
            ctx!.strokeStyle = `rgba(69, 240, 192, ${opacity * 0.15})`;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      ctx!.fillStyle = 'rgba(69, 240, 192, 0.5)';
      for (const node of nodes) {
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();

    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(draw);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseleave', onMouseLeave);
    } else {
      // Static single paint — connects the dots once, no loop.
      draw();
      running = false;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    function onVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!prefersReducedMotion) {
        running = true;
        rafId = requestAnimationFrame(draw);
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      role="presentation"
    />
  );
}
