// Experience-level copy. Plain data only: imported by the React app and by
// Node build scripts. Students type nothing; reflection happens through
// exploring, deciding, ruling and sorting.

export const experience = {
  id: 'at-the-threshold',
  contentVersion: 'threshold-2',
  title: 'At the Threshold: Belonging in an Early Christian Gathering',
  shortTitle: 'At the Threshold',
  centralQuestion: 'What did belonging to this gathering require, and who carried its costs?',
  setting: 'A fictional household gathering in Rome, around AD 160.',
  opening: [
    'A visitor arrives. Food is shared. A text is read. People have different needs and different influence. Six pictures let you rebuild what a gathering like this might have been, and test that picture against what ancient sources say.',
    'These are modern reconstructed images, not photographs or excavated scenes. The people, dialogue, and situations are fictional. The sources come from other times and places; they do not describe this household.',
    'You are an investigator. You do not have to act or believe in any particular way. Explore in any order and change your mind whenever you like. Allow about 40 minutes.',
  ],
  howTo: [
    { title: 'Look closely', text: 'Open the numbered details on each picture. Switch the lens to hear invented voices from different positions in the house.' },
    { title: 'Look outside the frame', text: 'Ask who and what the picture leaves out.' },
    { title: 'Decide and rule', text: 'Give your advice in a situation, then rule on the picture’s case question.' },
    { title: 'Sort what you learned', text: 'Separate what the picture shows, what a source supports, and what is not established.' },
  ],
  sourceIntroduction:
    "These texts come from different times and places. Read each card's setting and limit before applying it to this imagined gathering.",
  lenses: {
    picture: { label: 'Picture notes', note: 'Picture notes show what is visible, what a source says, and what the picture cannot tell us.' },
    host: { label: 'The host', note: 'An invented voice: the person whose house this is. It helps you imagine a position. It is not historical testimony.' },
    worker: { label: 'A household worker', note: 'An invented voice: someone who works in the household. It helps you imagine a position. It is not historical testimony.' },
    traveler: { label: 'A traveler', note: 'An invented voice: a newcomer from another city. It helps you imagine a position. It is not historical testimony.' },
    neighbor: { label: 'A neighbor', note: 'An invented voice: someone next door who is not part of the group. It helps you imagine a position. It is not historical testimony.' },
  },
  lensOrder: ['picture', 'host', 'worker', 'traveler', 'neighbor'],
  closing: {
    heading: 'Your reconstruction of the gathering',
    intro:
      'Here is the gathering as you rebuilt it. The statements you sorted are grouped by where they come from. Your rulings and decisions follow.',
    questions: [
      'Which detail changed what you first assumed about this gathering?',
      'Whose view did the pictures leave out, and how did you notice?',
      'What would you now keep, qualify, or reconsider about belonging in this gathering? What remains uncertain?',
    ],
    questionsNote: 'Carry these questions into class discussion or your instructor’s assignment.',
    ending: 'You can revisit any picture or take a copy of your reconstruction with you.',
  },
  notebook: {
    heading: 'My reconstruction',
    explanation:
      'This page shows what you explored, decided, and sorted. It is saved only in this browser when saving is available. Copy or download it if you want to keep it elsewhere.',
    empty: 'Not yet explored.',
  },
  labels: {
    reconstruction: 'Modern reconstruction',
    fictionalSituation: 'Fictional situation',
    fictionalDialogue: 'Fictional dialogue',
    fictionalPerspective: 'Fictional perspective',
    source: 'Historical source',
    interpretation: 'Interpretation',
    unknown: 'Not recorded',
  },
  order: ['letter', 'meal', 'reading', 'diversity', 'care', 'pressure'],
}
