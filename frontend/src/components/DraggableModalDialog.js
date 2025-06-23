// components/DraggableModalDialog.js
import React, { useRef } from 'react';
import { Modal } from 'react-bootstrap';

export default function DraggableModalDialog(props) {
  const dialogRef = useRef(null);
  const pos = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  const onMouseDown = (e) => {
    const dialog = dialogRef.current;
    pos.current.offsetX = e.clientX - dialog.getBoundingClientRect().left;
    pos.current.offsetY = e.clientY - dialog.getBoundingClientRect().top;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    const dialog = dialogRef.current;
    if (dialog) {
      pos.current.x = e.clientX - pos.current.offsetX;
      pos.current.y = e.clientY - pos.current.offsetY;
      dialog.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
    }
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <Modal.Dialog ref={dialogRef} {...props}>
      <div onMouseDown={onMouseDown} style={{ cursor: 'move' }}>
        {props.children}
      </div>
    </Modal.Dialog>
  );
}
