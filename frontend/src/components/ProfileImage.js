import React, { useState } from 'react';
import { useI18n } from '../context/I18nProvider';




export default function ProfileImage({ src, size = 100 }) {
  const [hover, setHover] = useState(false);
  const { returnTitle } = useI18n();
  

  return (
    <div
      className="position-relative mx-auto"
      style={{ width: size, height: size }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Small image */}
      <div
        className="rounded overflow-hidden"
        style={{
          width: size,
          height: size,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <img
          src={src}
          alt={returnTitle('staff.staff_photo')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Hover preview */}
      {hover && (
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            left: '110%',
            width: 200,
            height: 200,
            zIndex: 10,
            border: '2px solid white',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            backgroundColor: '#fff',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <img
            src={src}
            alt="preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}
    </div>
  );
}
