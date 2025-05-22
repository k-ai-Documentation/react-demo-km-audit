'use client';
import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import expend from 'kai-asset/expend_more.svg';

interface CollapseProps {
  children: ReactNode;
  title: ReactNode;
  defaultOpen?: boolean;
  onToggle?: () => void;
}

export default function Collapse({ children, title, defaultOpen = false, onToggle }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen !== undefined) {
      setIsOpen(defaultOpen);
    }
  }, [defaultOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle?.();
  };

  return (
    <div className="collapse">
      <div className="collapse-header" onClick={handleToggle}>
        <Image src={expend} alt="Expand more icon" width={24} height={24} className={`collapse-icon ${isOpen ? 'open' : ''}`}></Image>
        <div className="collapse-title">{title}</div>
      </div>
      {isOpen && <div className="collapse-content">{children}</div>}

      <style jsx>{`
        .collapse {
        //   border: 1px solid var(--color-border);
        //   border-radius: 4px;
        //   background-color: var(--color-background-soft);
        //   overflow: hidden;
            width: 100%;
        }

        .collapse-header {
          display: flex;
          align-items: center;
          cursor: pointer;
          img {
            filter: var(--svg-filter-white-color);
            transition: all 0.3s;
            }
          img.open {
            transform: rotate(180deg);
          }
        }

        .collapse-title {
          flex: 1;
        }

        .collapse-content {
          padding: 16px;
        }
      `}</style>
    </div>
  );
}