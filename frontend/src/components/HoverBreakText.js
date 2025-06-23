import React, { useState, useRef } from 'react';

export default function HoverBreakText({ children, maxWidth = '200px', className = '', style = {} }) {
  const [hover, setHover] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const content = Array.isArray(children) ? children.join('') : children;

  const handleMouseEnter = () => {
    const rect = ref.current?.getBoundingClientRect();
    setTooltipPos({
      x: rect?.left + rect?.width / 2,
      y: rect?.top - 10,
    });
    setHover(true);
  };

  const handleMouseLeave = () => setHover(false);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={{
          position: 'relative',
          display: 'inline-block',
          whiteSpace: 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          verticalAlign: 'middle',
          fontSize: 'clamp(0.75rem, 1vw, 0.95rem)',
          maxWidth,
          wordBreak: 'break-word',
          color: 'inherit',
          ...style,
        }}
      >
        {content}
      </span>

      {hover && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPos.y,
            left: tooltipPos.x,
            transform: 'translate(-50%, -100%)',
            background: '#1e293b',
            color: '#fff',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontFamily: 'Exo2Variable',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
