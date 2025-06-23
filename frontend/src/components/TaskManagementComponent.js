import React, { useState, useRef } from 'react';
import TaskSidebar from './TaskSidebar';
import ChatPanel from './ChatPanel';
import CreateTaskModal from './CreateTaskModal';
import TaskListComponent from './TaskListComponent';

export default function TaskManagementComponent() {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // ✅ for chat
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 🔁 Shared refresh trigger
  const taskListRef = useRef();

  const handleSelectStaff = (staff) => {
    if (staff === 'create-task') {
      setShowCreateModal(true);
    } else {
      setSelectedStaff(staff);
    }
  };

  const handleTaskCreated = () => {
    console.log('✅ handleTaskCreated called');
    setShowCreateModal(false);
    if (taskListRef.current) {
      console.log('🔁 Refetching tasks via ref');
      taskListRef.current(); // should trigger fetchTasks
    } else {
      console.warn('⚠️ No refetch function found');
    }
  };

  const handleTaskSelect = (task) => {
    setSelectedTask(task); // ✅ update selected task
  };

  return (
    <div style={{ display: 'flex', height: '93vh', borderRadius: '8px' }}>
      <TaskSidebar onSelectStaff={handleSelectStaff} selectedStaff={selectedStaff} />
       <TaskListComponent
        setRefetchFn={(fn) => (taskListRef.current = fn)}
        onTaskSelect={handleTaskSelect} // ✅ pass handler
      />
       <ChatPanel selectedStaff={selectedStaff} selectedTask={selectedTask} /> {/* ✅ pass task */}

      {selectedStaff && (
        <CreateTaskModal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          selectedStaff={selectedStaff}
          onCreated={handleTaskCreated} // 🔁 pass callback
        />
      )}
    </div>
  );
}
