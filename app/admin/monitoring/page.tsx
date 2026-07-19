'use client';

import { useState } from 'react';
import { StudentProgressTable } from '@/components/admin/StudentProgressTable';
import StudentDetailView from '@/components/admin/StudentDetailView';

export default function MonitoringPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-2xl font-semibold text-foreground">
        Pemantauan Progres Siswa
      </h1>

      {selectedUserId ? (
        <StudentDetailView
          userId={selectedUserId}
          onBack={() => setSelectedUserId(null)}
        />
      ) : (
        <StudentProgressTable
          onStudentClick={(userId) => setSelectedUserId(userId)}
        />
      )}
    </div>
  );
}
