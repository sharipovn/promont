import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useI18n } from '../context/I18nProvider';
import { FaComments } from 'react-icons/fa';

export default function ChatMessaging({ show, onHide, item }) {
  const { returnTitle } = useI18n();

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaComments className="me-2" />
          {returnTitle('app.messages')} — {returnTitle(`obj.${item?.path_type?.toLowerCase() || ''}`)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {item ? (
          <div className="small">
            <div><b>{returnTitle('tree.full_id')}:</b> {item.full_id}</div>
            <div><b>{returnTitle('tree.message_count')}:</b> {item.message_count}</div>
            <hr />
            <div className="text-muted">
              {/* Placeholder: Replace with actual messages fetched from API */}
              📨 No messages loaded yet. Integrate your messaging API here.
            </div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </Modal.Body>
    </Modal>
  );
}
