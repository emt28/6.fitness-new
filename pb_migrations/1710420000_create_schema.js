/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  // Create collections
  const collections = [
    {
      name: 'athletes',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'dateOfBirth', type: 'date', required: true },
        { name: 'dominantHand', type: 'select', options: { values: ['left', 'right', 'ambidextrous'] } },
        { name: 'wtn', type: 'number', required: true },
        { name: 'isActive', type: 'bool', default: true },
      ],
      indexes: ['name'],
    },
    {
      name: 'protocols',
      type: 'base', 
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'unit', type: 'text', required: true },
        { name: 'criteria', type: 'select', options: { values: ['lower', 'higher'] } },
        { name: 'categories', type: 'json' },
        { name: 'normativeData', type: 'json' },
      ],
    },
    {
      name: 'assessments',
      type: 'base',
      schema: [
        { name: 'athleteId', type: 'relation', options: { collection: 'athletes' } },
        { name: 'protocolId', type: 'relation', options: { collection: 'protocols' } },
        { name: 'value', type: 'number', required: true },
        { name: 'performanceLevel', type: 'select', options: { values: ['needs_improvement', 'median', 'excellent'] } },
        { name: 'notes', type: 'text' },
        { name: 'assessedAt', type: 'date', required: true },
      ],
      indexes: ['athleteId', 'protocolId', 'assessedAt'],
    },
    {
      name: 'goals',
      type: 'base',
      schema: [
        { name: 'athleteId', type: 'relation', options: { collection: 'athletes' } },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'select', options: { values: ['physical', 'tactical', 'technical', 'mental', 'other'] } },
        { name: 'targetValue', type: 'number' },
        { name: 'unit', type: 'text' },
        { name: 'deadline', type: 'date' },
        { name: 'progress', type: 'number', default: 0 },
        { name: 'status', type: 'select', options: { values: ['onTrack', 'atRisk', 'offTrack', 'completed'] } },
      ],
    },
    {
      name: 'notes',
      type: 'base',
      schema: [
        { name: 'goalId', type: 'relation', options: { collection: 'goals' } },
        { name: 'content', type: 'text', required: true },
        { name: 'type', type: 'select', options: { values: ['progress', 'general'] } },
      ],
    },
  ];

  collections.forEach(collection => {
    const col = new Collection(collection);
    db.collections.add(col);
  });

  return collections;
}, (db) => {
  // Revert
  const collections = ['athletes', 'protocols', 'assessments', 'goals', 'notes'];
  collections.forEach(name => {
    db.collections.findOne(name)?.delete();
  });
});