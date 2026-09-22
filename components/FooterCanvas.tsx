'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function FooterCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 240;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particle plane/grid
    const countX = 80;
    const countY = 25;
    const numParticles = countX * countY;
    const positions = new Float32Array(numParticles * 3);
    const originalPositions = new Float32Array(numParticles * 3);

    let i = 0;
    for (let ix = 0; ix < countX; ix++) {
      for (let iy = 0; iy < countY; iy++) {
        const u = (ix / (countX - 1) - 0.5) * 70;
        const v = (iy / (countY - 1) - 0.5) * 22;
        positions[i] = u;
        positions[i + 1] = v;
        positions[i + 2] = 0;

        originalPositions[i] = u;
        originalPositions[i + 1] = v;
        originalPositions[i + 2] = 0;
        i += 3;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xdedcd6,
      size: 1.2,
      transparent: true,
      opacity: 0.85
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Interaction
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, isDown: false };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = x * 35;
      mouse.targetY = y * 11;
    };

    const onPointerDown = () => {
      mouse.isDown = true;
    };

    const onPointerUp = () => {
      mouse.isDown = false;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight || 240;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      const pos = geometry.attributes.position.array as Float32Array;
      const disruptionForce = mouse.isDown ? 3.5 : 1.2;

      for (let j = 0; j < numParticles; j++) {
        const px = originalPositions[j * 3];
        const py = originalPositions[j * 3 + 1];

        // Wave motion
        const wave = Math.sin(px * 0.2 + elapsedTime * 1.5) * Math.cos(py * 0.2 + elapsedTime * 1.5) * 1.5;

        // Mouse distance disruption
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 12;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * disruptionForce;
          pos[j * 3 + 2] = wave + Math.sin(dist * 2.0 - elapsedTime * 5.0) * force * 4.0;
        } else {
          pos[j * 3 + 2] = wave;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-cursor-text="Hold to disrupt"
      data-cursor-hover=""
      style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        overflow: 'hidden',
        cursor: 'grab'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}
