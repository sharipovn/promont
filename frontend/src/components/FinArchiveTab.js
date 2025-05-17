import React from 'react';
import { Card } from 'react-bootstrap';

export default function FinArchiveTab() {
  return (
    <Card className="p-4 shadow-sm">
      <h5 className="mb-3 text-primary">Archived Projects</h5>
      <p className="text-muted">This tab can show all projects that were already confirmed or archived.</p>
      {/* Archived project list here */}
    </Card>
  );
}
