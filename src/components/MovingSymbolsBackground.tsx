import { useEffect, useRef } from 'react';

const SYMBOLS = [
  '{ }', '[ ]', '( )', '</>', '01', '10', '+', '-', '*', '=', '→', '∞',
  '○', '□', '△', '✓', '&', '|', '^', '%', '#', '?', '~', '≈', '≤', '≥',
  '∑', '∏', '∫', '√', 'λ', 'α', 'β', 'π', 'θ', 'Ω', '∆', '∇',
  '0', '1', 'a', 'b', 'x', 'y', 'n', 'i', 'j', 'k'
];

interface FloatingSymbol {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  fontWeight: string;
}

export function MovingSymbolsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const symbolsRef = useRef<FloatingSymbol[]>([]);
  const animationRef = useRef<number>(0);
  const isDarkRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize symbols
    const symbolCount = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 15000));
    symbolsRef.current = Array.from({ length: symbolCount }, (_, i) => ({
      id: i,
      text: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 20 + 18,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.15 + 0.05,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.005,
      fontWeight: Math.random() > 0.5 ? '400' : '600',
    }));

    const updateTheme = () => {
      isDarkRef.current = document.documentElement.classList.contains('dark');
    };
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = isDarkRef.current;
      const color = isDark ? '148, 163, 184' : '100, 116, 139';

      symbolsRef.current.forEach((sym) => {
        sym.x += sym.speedX;
        sym.y += sym.speedY;
        sym.rotation += sym.rotationSpeed;

        // Wrap around edges
        if (sym.x < -50) sym.x = canvas.width + 50;
        if (sym.x > canvas.width + 50) sym.x = -50;
        if (sym.y < -50) sym.y = canvas.height + 50;
        if (sym.y > canvas.height + 50) sym.y = -50;

        // Gentle opacity pulse
        const pulse = Math.sin(frame * 0.01 + sym.id) * 0.03;
        const currentOpacity = Math.max(0.02, Math.min(0.2, sym.opacity + pulse));

        ctx.save();
        ctx.translate(sym.x, sym.y);
        ctx.rotate(sym.rotation);
        ctx.font = `${sym.fontWeight} ${sym.size}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(${color}, ${currentOpacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sym.text, 0, 0);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
