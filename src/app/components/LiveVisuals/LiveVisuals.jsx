"use client";

import { useEffect, useRef } from "react";

export default function LiveVisuals() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let dpr = 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const pointer = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.35,
      tx: window.innerWidth * 0.5,
      ty: window.innerHeight * 0.35,
    };

    const points = [];
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setupCanvas = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const setVars = () => {
      root.style.setProperty("--cursor-x", `${pointer.x}px`);
      root.style.setProperty("--cursor-y", `${pointer.y}px`);
    };

    const drawTrail = (now) => {
      ctx.clearRect(0, 0, width, height);

      while (points.length > 0 && now - points[0].t > 320) {
        points.shift();
      }

      if (points.length < 2) return;

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const progress = index / points.length;
        const ageRatio = 1 - (now - current.t) / 320;
        const alpha = Math.max(0, ageRatio) * progress * 0.75;
        const lineWidth = 0.8 + progress * 3.2;

        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }

      const latest = points[points.length - 1];
      const glowRadius = 8;
      const gradient = ctx.createRadialGradient(
        latest.x,
        latest.y,
        0,
        latest.x,
        latest.y,
        glowRadius,
      );

      gradient.addColorStop(0, "rgba(129, 140, 248, 0.7)");
      gradient.addColorStop(1, "rgba(129, 140, 248, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(latest.x, latest.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (timestamp) => {
      pointer.x += (pointer.tx - pointer.x) * 0.32;
      pointer.y += (pointer.ty - pointer.y) * 0.32;

      points.push({ x: pointer.x, y: pointer.y, t: timestamp });
      if (points.length > 24) {
        points.shift();
      }

      setVars();
      drawTrail(timestamp);
      rafId = window.requestAnimationFrame(animate);
    };

    const setPointerTarget = (clientX, clientY) => {
      if (typeof clientX !== "number" || typeof clientY !== "number") return;
      pointer.tx = clientX;
      pointer.ty = clientY;
    };

    const handlePointerMove = (event) =>
      setPointerTarget(event.clientX, event.clientY);
    const handleMouseMove = (event) =>
      setPointerTarget(event.clientX, event.clientY);
    const handleTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (!touch) return;
      setPointerTarget(touch.clientX, touch.clientY);
    };

    const handleResize = () => {
      pointer.tx = window.innerWidth * 0.5;
      pointer.ty = window.innerHeight * 0.35;
      setupCanvas();
    };

    setupCanvas();
    setVars();
    rafId = window.requestAnimationFrame(animate);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      ctx.clearRect(0, 0, width, height);
    };
  }, []);

  return (
    <>
      <div aria-hidden="true" className="live-visuals">
        <canvas ref={canvasRef} className="cursor-trail-canvas" />
        <span className="live-orb live-orb-1" />
        <span className="live-orb live-orb-2" />
        <span className="live-orb live-orb-3" />
        <span className="live-grid" />
      </div>
      <div aria-hidden="true" className="cursor-overlay">
        <span className="cursor-spotlight" />
        <span className="cursor-ring" />
        <span className="cursor-dot" />
      </div>
    </>
  );
}
