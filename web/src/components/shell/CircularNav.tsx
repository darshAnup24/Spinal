import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, LayoutList, MessageSquareText, Cpu, RotateCcw } from 'lucide-react';
import { CircularNavigation } from '@/components/ui/circular-navigation';
import { useDemo } from '@/state/demo';

export function CircularNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { reset, actions } = useDemo();

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const hasOpenActions = actions.length > 0;

  const navItems = [
    { name: 'TRIAGE', icon: LayoutList, to: '/app' },
    { name: 'ASSISTANT', icon: MessageSquareText, to: '/app/chat' },
    { name: 'SYSTEM', icon: Cpu, to: '/app/system' },
  ].map((item) => {
    const isActive =
      item.to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(item.to);
    const showPulse = item.to === '/app' && hasOpenActions;
    return {
      name: item.name,
      icon: item.icon,
      onClick: () => navigate(item.to),
      badge: showPulse || isActive ? (
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-text)] opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--color-text)]" />
        </span>
      ) : undefined,
    };
  });

  navItems.push({
    name: 'RESTART',
    icon: RotateCcw,
    onClick: () => {
      reset();
      navigate('/');
    },
    badge: undefined,
  });

  return (
    <>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8, ease: [0.32, 0.72, 0, 1] }}
        onClick={toggleMenu}
        className="group fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-3 py-2.5 transition-all duration-300 hover:scale-105 sm:gap-3 sm:px-4 md:px-6"
        style={{
          background: 'rgba(17, 20, 28, 0.85)',
          borderColor: 'rgba(220, 224, 230, 0.12)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        aria-label="Open navigation menu"
      >
        <Menu
          className="h-4 w-4 transition-colors duration-300 sm:h-5 sm:w-5"
          style={{ color: 'rgba(228, 230, 235, 0.6)' }}
          strokeWidth={1.5}
        />
        <span
          className="hidden font-pixel uppercase tracking-[0.25em] transition-colors duration-300 sm:inline"
          style={{ fontSize: '11px', color: 'rgba(228, 230, 235, 0.6)' }}
        >
          NAV
        </span>
        {hasOpenActions && (
          <span className="relative ml-1 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--color-text)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--color-text)]" />
          </span>
        )}
      </motion.button>

      <CircularNavigation navItems={navItems} isOpen={isOpen} toggleMenu={toggleMenu} />
    </>
  );
}
