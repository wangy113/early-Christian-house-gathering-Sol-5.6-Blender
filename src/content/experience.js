// Authored copy from docs/experience-content-spec.md, sections 1 and 9.
// Plain data only: imported by the React app and by Node build scripts.

export const experience = {
  id: 'at-the-threshold',
  contentVersion: 'threshold-1',
  title: 'At the Threshold: Belonging in an Early Christian Gathering',
  shortTitle: 'At the Threshold',
  centralQuestion: 'What did belonging to this gathering require, and who carried its costs?',
  setting: 'A fictional household gathering in Rome, around AD 160.',
  opening: [
    'A visitor arrives. Food is shared. A text is read. People have different needs and different influence. Explore six encounters and consider how a gathering becomes a community.',
    'These are modern reconstructed images, not photographs or excavated scenes. The people, dialogue, and situations are fictional. Historical sources will help you test what the reconstruction suggests; they do not document this particular household.',
    'You are an investigator, not a character required to act or believe in a particular way. You can explore in any order, leave notes blank, and revisit a judgment. Allow about 40 minutes, at your own pace.',
  ],
  openingPrompt: 'What might make a gathering a community?',
  sourceIntroduction:
    "These texts come from different times and places. Read each card's setting and limit before applying it to this imagined gathering.",
  closing: {
    heading: 'Look back at the gathering',
    paragraphs: [
      'You have considered who is welcomed, who is heard, and who carries the costs of shared life. The images supplied a setting; sources and other perspectives tested what that setting suggested.',
      'Look back at one of your earlier thoughts. What would you now keep, qualify, or reconsider? What remains uncertain?',
    ],
    prompt: 'One thought I would now keep, qualify, or reconsider…',
    ending: 'You can revisit these encounters or take your notes with you.',
  },
  notebook: {
    heading: 'My observations and thinking',
    explanation:
      'These are your notes from the experience. They are saved only in this browser when saving is available. Copy or download them if you want to keep them elsewhere.',
    empty: 'No note recorded.',
  },
  labels: {
    reconstruction: 'Modern reconstruction',
    fictionalSituation: 'Fictional situation',
    fictionalDialogue: 'Fictional dialogue',
    source: 'Historical source',
    interpretation: 'Interpretation',
  },
  order: ['letter', 'meal', 'reading', 'diversity', 'care', 'pressure'],
}
