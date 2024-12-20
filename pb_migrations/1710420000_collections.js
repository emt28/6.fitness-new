migrate((db) => {
  // Athletes Collection
  const athletes = new Collection({
    name: 'athletes',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'dateOfBirth', type: 'date', required: true },
      { name: 'dominantHand', type: 'select', options: { values: ['left', 'right', 'ambidextrous'] }, required: true },
      { name: 'wtn', type: 'number', required: true },
      { name: 'isActive', type: 'bool', required: true, default: true },
      { name: 'createdBy', type: 'relation', options: { collection: 'users' } },
    ],
    indexes: [
      { field: 'name', type: 'index' },
      { field: 'createdBy', type: 'index' },
    ],
  });

  // Protocols Collection
  const protocols = new Collection({
    name: 'protocols',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'unit', type: 'text', required: true },
      { name: 'criteria', type: 'select', options: { values: ['lower', 'higher'] }, required: true },
      { name: 'categories', type: 'select', options: { values: ['physical', 'tactical', 'speed', 'strength', 'coordination', 'tennis-specific', 'match-development', 'other'] }, required: true, multiple: true },
      { name: 'normativeData', type: 'json', required: true },
      { name: 'createdBy', type: 'relation', options: { collection: 'users' } },
    ],
  });

  // Assessments Collection
  const assessments = new Collection({
    name: 'assessments',
    type: 'base',
    schema: [
      { name: 'athleteId', type: 'relation', options: { collection: 'athletes' }, required: true },
      { name: 'protocolId', type: 'relation', options: { collection: 'protocols' }, required: true },
      { name: 'value', type: 'number', required: true },
      { name: 'performanceLevel', type: 'select', options: { values: ['needs_improvement', 'median', 'excellent'] }, required: true },
      { name: 'notes', type: 'text' },
      { name: 'assessedBy', type: 'relation', options: { collection: 'users' }, required: true },
      { name: 'assessedAt', type: 'date', required: true },
    ],
    indexes: [
      { field: 'athleteId', type: 'index' },
      { field: 'protocolId', type: 'index' },
      { field: 'assessedAt', type: 'index' },
    ],
  });

  // Development Goals Collection
  const goals = new Collection({
    name: 'goals',
    type: 'base',
    schema: [
      { name: 'athleteId', type: 'relation', options: { collection: 'athletes' }, required: true },
      { name: 'title', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'category', type: 'select', options: { values: ['physical', 'tactical', 'technical', 'mental', 'other'] }, required: true },
      { name: 'targetValue', type: 'number' },
      { name: 'unit', type: 'text' },
      { name: 'deadline', type: 'date', required: true },
      { name: 'progress', type: 'number', required: true, default: 0 },
      { name: 'status', type: 'select', options: { values: ['onTrack', 'atRisk', 'offTrack', 'completed'] }, required: true, default: 'onTrack' },
      { name: 'protocolId', type: 'relation', options: { collection: 'protocols' } },
      { name: 'assignedTo', type: 'relation', options: { collection: 'users' } },
    ],
  });

  // Goal Notes Collection
  const goalNotes = new Collection({
    name: 'goal_notes',
    type: 'base',
    schema: [
      { name: 'goalId', type: 'relation', options: { collection: 'goals' }, required: true },
      { name: 'text', type: 'text', required: true },
      { name: 'createdBy', type: 'relation', options: { collection: 'users' }, required: true },
    ],
  });

  // Coach Notes Collection
  const coachNotes = new Collection({
    name: 'coach_notes',
    type: 'base',
    schema: [
      { name: 'athleteId', type: 'relation', options: { collection: 'athletes' }, required: true },
      { name: 'content', type: 'text', required: true },
      { name: 'type', type: 'select', options: { values: ['general', 'technical', 'tactical', 'physical', 'mental'] }, required: true },
      { name: 'visibility', type: 'select', options: { values: ['coaches', 'all'] }, required: true },
      { name: 'createdBy', type: 'relation', options: { collection: 'users' }, required: true },
    ],
  });

  // Audit Logs Collection
  const auditLogs = new Collection({
    name: 'audit_logs',
    type: 'base',
    schema: [
      { name: 'action', type: 'text', required: true },
      { name: 'userId', type: 'relation', options: { collection: 'users' }, required: true },
      { name: 'details', type: 'text', required: true },
      { name: 'timestamp', type: 'date', required: true },
    ],
  });

  return [athletes, protocols, assessments, goals, goalNotes, coachNotes, auditLogs];
}, (db) => {
  // Revert collections
  db.collection('athletes').delete();
  db.collection('protocols').delete();
  db.collection('assessments').delete();
  db.collection('goals').delete();
  db.collection('goal_notes').delete();
  db.collection('coach_notes').delete();
  db.collection('audit_logs').delete();
});