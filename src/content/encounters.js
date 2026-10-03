// Encounter records. The six images, IDs, situations, choices, feedback and
// sources follow docs/experience-content-spec.md; hotspots, lens voices,
// outside-the-frame questions, case questions and sorts follow the
// instructor-approved picture-led design (docs/experience-picture-led.md).
// Plain data only. Image paths are site-relative (no leading slash).
//
// Context kinds: 'source' (an S-id is required), 'interpretation', 'unknown'.
// Lens voices are invented and always labeled as fictional perspective.

const image = (name, height, alt, description) => ({
  originalPath: `images/evidence/${name}.png`,
  displayPath: `images/display/${name}-1280.jpg`,
  srcSet: [
    { path: `images/display/${name}-640.jpg`, width: 640 },
    { path: `images/display/${name}-1280.jpg`, width: 1280 },
  ],
  width: 1672,
  height,
  alt,
  description,
})

const verdicts = (supported, partly, unestablished) => [
  { id: 'supported', label: 'Supported', why: supported },
  { id: 'partly', label: 'Partly supported', why: partly },
  { id: 'unestablished', label: 'Not established', why: unestablished },
]

export const encounters = {
  letter: {
    id: 'letter',
    number: 'E1',
    title: 'A traveler at the threshold',
    kind: 'deep',
    image: image(
      'traveling-letter',
      941,
      'A traveler hands a sealed roll to a woman in a doorway.',
      "Two adults face each other at an entrance. The person on the left wears a worn-looking cloak and carries a bag. Both hold a rolled document tied with a red cord and seal. A lamp, jug, and interior courtyard are visible. The image does not reveal the document's contents or either person's identity.",
    ),
    caseQuestion: 'Did households welcome travelers just because they carried a letter?',
    hotspots: [
      {
        id: 'roll', x: 50, y: 59, label: 'The sealed roll',
        see: 'A rolled document tied with a red cord and sealed with wax passes from one pair of hands to another.',
        context: { kind: 'source', sourceId: 'S3', text: 'Paul commends Phoebe to the Christians in Rome and asks them to welcome her and help her (Romans 16:1–2). Letters like this introduced travelers to communities that did not know them.' },
        limit: 'We cannot read the roll. Its writer, contents, and authority are all unknown.',
        voices: {
          host: 'A letter from people I trust is the closest thing to a guarantee I will get.',
          worker: 'If this guest stays, I will be the one making up a bed and drawing extra water.',
          traveler: 'Everything depends on this roll. Without it, I am a stranger at a closed door.',
          neighbor: 'Strangers arrive at that house with letters. Who is writing to them, and about what?',
        },
      },
      {
        id: 'bag', x: 10, y: 82, label: 'The traveler’s cloak and bag',
        see: 'A worn cloak, a heavy shoulder bag, and dusty clothing suggest a long journey.',
        context: { kind: 'source', sourceId: 'S4', text: 'The Didache says to welcome those who come in the Lord’s name, but to test them. A traveler passing through should stay only two or three days; one who wants to settle should work for a living (Didache 12).' },
        limit: 'Clothing is a modern costume choice. It does not tell us the traveler’s status, wealth, or honesty.',
        voices: {
          host: 'Hospitality is expected of us. So is caution.',
          worker: 'Dusty feet mean washing, feeding, and a place to sleep. That work falls to someone.',
          traveler: 'I have walked for days. I need a roof before I need a conversation.',
          neighbor: 'Another dusty stranger. That house takes in all kinds.',
        },
      },
      {
        id: 'door', x: 44, y: 18, label: 'The doorway',
        see: 'The two people meet at a threshold. Behind the traveler is a sunlit courtyard; behind the woman, the inside of the house.',
        context: { kind: 'interpretation', text: 'Before the third century, most Christian groups seem to have met in private houses or rented rooms, not purpose-built churches. To join a gathering, someone had to let you in.' },
        limit: 'The house is a modern reconstruction, not an excavated building. Its layout is imagined.',
        voices: {
          host: 'This door is mine. Opening it is a decision, not a habit.',
          worker: 'I keep this door. I see who comes in and who is turned away.',
          traveler: 'One step separates me from the street and from the people inside.',
          neighbor: 'From my side of the street, the door is all I ever see.',
        },
      },
      {
        id: 'woman', x: 86, y: 72, label: 'The woman receiving the roll',
        see: 'A woman takes hold of the roll. She looks at the traveler with close attention.',
        context: { kind: 'source', sourceId: 'S3', text: 'Paul’s greetings name women active in the community, including Phoebe and Prisca, who with Aquila hosted a gathering in their house (Romans 16:1–5).' },
        limit: 'She is a fictional person. The picture does not tell us her role in the household or the community.',
        voices: {
          host: 'I decide who is welcomed here. That responsibility is mine.',
          worker: 'She will decide whether this guest stays. I will carry out the decision.',
          traveler: 'She is reading me as carefully as she will read the letter.',
          neighbor: 'It is the woman of the house who answers the door to these visitors.',
        },
      },
      {
        id: 'lamp', x: 73, y: 66, label: 'The lamp and jugs',
        see: 'An oil lamp burns on a table beside clay jugs, a bowl, and a basket.',
        context: { kind: 'interpretation', text: 'Lamps and water jars were ordinary household things. Hospitality usually began with water, food, and light.' },
        limit: 'These objects are set dressing. They do not tell us the time, the season, or how wealthy the household was.',
        voices: {
          host: 'Water and light first. Questions can wait a moment.',
          worker: 'I filled that jug this morning. Now there is one more to share it.',
          traveler: 'A burning lamp means someone is still awake to answer the door.',
          neighbor: 'Their lamp is still lit. The visitors keep coming.',
        },
      },
    ],
    outsideFrame: [
      { id: 'writer', position: 'top', question: 'Who wrote the letter?', kind: 'unknown', answer: 'We do not know. The picture shows a sealed roll, not a writer or a message.' },
      { id: 'route', position: 'left', question: 'Where did the traveler come from?', kind: 'source', sourceId: 'S3', answer: 'Paul’s letter to Rome was written elsewhere and carried to the city; Phoebe may have been its bearer (Romans 16:1–2). This traveler’s route is unknown.' },
      { id: 'inside', position: 'right', question: 'Who else is inside the house?', kind: 'unknown', answer: 'We cannot see. A household might include family, enslaved workers, lodgers, or members of the gathering.' },
      { id: 'doubt', position: 'bottom', question: 'What happens if the letter is doubted?', kind: 'source', sourceId: 'S4', answer: 'The Didache describes testing visitors by their conduct, not only by their claims (Didache 11–12). What this household would do is not recorded.' },
    ],
    situation: {
      label: 'Fictional situation',
      paragraphs: [
        'A newcomer brings a message recommending someone who needs accommodation. The household knows neither the messenger nor the person recommended. You are asked what kind of welcome to offer while the message is considered.',
      ],
    },
    decisionPrompt: 'What would you recommend?',
    feedbackLabel: 'Interpretation',
    choices: [
      { id: 'welcome', label: 'Offer hospitality immediately.', feedback: 'This meets a need without delay, while asking the household to act on a claim it has not checked.', followUp: 'What would make that responsibility reasonable?' },
      { id: 'temporary', label: 'Offer a temporary welcome while seeking information.', feedback: 'This combines welcome with inquiry, but someone must provide the time, space, and work that arrangement needs.', followUp: 'Whose work does your compromise require?' },
      { id: 'verify-first', label: 'Ask the traveler to wait while the message is checked.', feedback: 'This protects the household from an unverified claim, but delay itself can exclude someone who needs help.', followUp: 'How would the person waiting experience your decision?' },
      { id: 'another', label: 'Ask for more information first.', feedback: 'You can question the available options. Your alternative still needs to explain who acts and who waits.', followUp: 'What information would change your recommendation?' },
    ],
    neutralFeedback: 'Welcoming and checking a claim can each impose costs. Before deciding, consider the needs of the visitor and the responsibilities of the host.',
    verdicts: verdicts(
      'Paul asks the Christians in Rome to welcome Phoebe on the strength of his commendation (Romans 16:1–2). A letter could open a door.',
      'A letter helped, but the Didache also tells communities to test visitors by how they behave and how long they stay (Didache 11–12). Welcome and checking went together.',
      'The sources come from different places and say what should happen, not what this household did. The picture shows a handover, not a decision.',
    ),
    sort: [
      { id: 'handover', text: 'A traveler hands a sealed roll to a woman in a doorway.', answer: 'picture', why: 'You can see this directly in the picture.' },
      { id: 'phoebe', text: 'Paul asked a community to welcome Phoebe and help her.', answer: 'source', sourceId: 'S3', why: 'Romans 16:1–2 says this. The picture does not show Phoebe or any named person.' },
      { id: 'pauline', text: 'The roll is a letter from the apostle Paul.', answer: 'unestablished', why: 'Nothing in the picture or the sources identifies this roll. It is a modern prop.' },
      { id: 'bed', text: 'The traveler was welcomed and given a bed.', answer: 'unestablished', why: 'The picture stops at the doorway. What the household decided is not shown or recorded.' },
    ],
    sourceIds: ['S3', 'S4'],
    sourceNote: 'These are examples for comparison. They do not show that the pictured letter is a Pauline letter or that this Roman household followed the Didache.',
    imageLimitation: 'The messenger, seal, clothing, and contents of the roll are reconstructed. No depicted person is an identified historical figure.',
  },

  meal: {
    id: 'meal',
    number: 'E2',
    title: 'A shared table, an uneven welcome',
    kind: 'deep',
    image: image(
      'shared-meal',
      940,
      'Three adults share bread around a low table with food and lamps.',
      'A woman on the left extends bread toward a bearded man at the center. An older woman sits on the right holding bread. A low round table holds more bread, bowls of food, a jug, and lamps. All three appear engaged with one another. No people outside this group are visible, and the image does not explain who prepared or supplied the food.',
    ),
    caseQuestion: 'Was everyone at this table equally welcome?',
    hotspots: [
      {
        id: 'bread', x: 44, y: 43, label: 'Bread passed hand to hand',
        see: 'A woman holds out a piece of bread, and the man at the center reaches to take it. The gesture is warm and direct.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin describes bread, and wine mixed with water, shared after prayer. He says only those who had been baptized took part (First Apology 65–66).' },
        limit: 'The picture cannot tell us whether this is an ordinary meal, the Eucharist, or both.',
        voices: {
          host: 'I set out this bread. Offering it is how I show who belongs at my table.',
          worker: 'I baked this before dawn, before my own work began. I hand it out. Do I get to share it?',
          traveler: 'Someone offered me bread tonight. That means I have been accepted, at least for now.',
          neighbor: 'From the street I only hear that they eat together behind closed doors. Rumors grow from less.',
        },
      },
      {
        id: 'table', x: 53, y: 70, label: 'The full table',
        see: 'Loaves, bowls of olives and vegetables, a jug, and lamps. There is plenty for the three people shown.',
        context: { kind: 'source', sourceId: 'S2', text: 'Paul scolds the Corinthians because when they gather to eat, “one goes hungry and another becomes drunk” (1 Corinthians 11:21). A shared meal could expose inequality.' },
        limit: 'Plenty in the picture does not tell us who paid for the food, who cooked it, or whether everyone received the same.',
        voices: {
          host: 'I can afford to fill this table. Does that give me the right to decide how the meal goes?',
          worker: 'Every bowl here was carried, filled, and will be washed. None of that work is in the picture.',
          traveler: 'I have nothing to bring. I wonder whether anyone notices.',
          neighbor: 'That is a lot of food for a small group. Who pays for it, and why?',
        },
      },
      {
        id: 'lamps', x: 28, y: 66, label: 'Oil lamps',
        see: 'Small clay oil lamps burn on the table and in a niche on the wall. The room is lit as if for evening.',
        context: { kind: 'source', sourceId: 'S5', text: 'Pliny reports that Christians met before dawn on a fixed day and gathered again later to eat “ordinary and harmless food” (Letters 10.96).' },
        limit: 'A dim room needs lamps anyway. They do not establish the hour, the day, or how often the group met.',
        voices: {
          host: 'Lamp oil costs money. Keeping the room lit late is one of my gifts to the group.',
          worker: 'If they meet after dark, it is because people like me only finish work then.',
          traveler: 'In a strange city after dark, a lit doorway is somewhere to go.',
          neighbor: 'Lights burning late in that house again. What are they doing in there?',
        },
      },
      {
        id: 'elder', x: 88, y: 64, label: 'The older woman',
        see: 'An older woman holds a piece of bread and watches the others. She sits at the same table as the younger adults.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin says the community’s collection helped orphans, widows, the sick, prisoners, and strangers (First Apology 67).' },
        limit: 'We do not know who she is. Her age does not tell us whether she is a widow, the host, a relative, or someone receiving help.',
        voices: {
          host: 'She came here before I ever opened my house. Her place does not depend on me.',
          worker: 'She calls me by my name. Not everyone at this table does.',
          traveler: 'Someone here may remember this community long before I heard of it.',
          neighbor: 'She does not live in that house. Why does she go there every week?',
        },
      },
      {
        id: 'court', x: 5, y: 18, label: 'The courtyard edge',
        see: 'At the left edge, a sunlit courtyard and a column. The picture ends there.',
        context: { kind: 'source', sourceId: 'S2', text: 'Paul tells the Corinthians, “when you come together to eat, wait for one another” (1 Corinthians 11:33). Some people arrived after others had started.' },
        limit: 'We cannot see who is still on the way, or who was never invited.',
        voices: {
          host: 'Some who usually come have not arrived. Should we wait for them?',
          worker: 'The ones still out there may be people whose day is not their own.',
          traveler: 'I came in through that courtyard. Someone had to let me in.',
          neighbor: 'I can watch people come and go through that court, but not what happens inside.',
        },
      },
    ],
    outsideFrame: [
      { id: 'before', position: 'top', question: 'What happened before this moment?', kind: 'source', sourceId: 'S1', answer: 'Justin describes reading and prayer before the bread and wine are brought (First Apology 67). The order in this household is unknown.' },
      { id: 'late', position: 'left', question: 'Who is still on the way?', kind: 'source', sourceId: 'S2', answer: 'Paul’s instruction to “wait for one another” (1 Corinthians 11:33) suggests some people arrived late. Who they were in this house, we do not know.' },
      { id: 'cooked', position: 'right', question: 'Who cooked and served?', kind: 'interpretation', answer: 'We do not know. Many Roman households relied on enslaved or hired workers, and the picture shows none of them.' },
      { id: 'invited', position: 'bottom', question: 'Who was not invited?', kind: 'source', sourceId: 'S1', answer: 'Justin says only the baptized shared the Eucharist (First Apology 66). Who could sit at an ordinary meal in this house is not recorded.' },
    ],
    situation: {
      label: 'Fictional dialogue',
      paragraphs: [
        'A person preparing the table says: “Some who usually join us have not arrived. One of those here needs to leave soon. Shall we begin?”',
        'You have been asked for advice, not given authority over the gathering.',
      ],
    },
    decisionPrompt: 'What would you recommend?',
    feedbackLabel: 'Fictional dialogue',
    choices: [
      { id: 'reserve', label: 'Begin and reserve food for those absent.', feedback: '“There will be food for them. Will they still share what happens around the table?”', followUp: 'Does receiving a portion equal participating?' },
      { id: 'wait', label: 'Wait for those who have not arrived.', feedback: '“Then the person who must leave may miss the meal.”', followUp: 'Who carries the burden of waiting?' },
      { id: 'separate', label: 'Serve food now; postpone the shared observance.', feedback: '“Would separating them change what we think we are doing?”', followUp: 'What have you assumed about meal and worship?' },
      { id: 'another', label: 'Ask for more information first.', feedback: '“What would you need to know before deciding?”', followUp: 'What happens while you seek that information?' },
    ],
    neutralFeedback: 'A full table can suggest welcome while leaving absent people outside the frame. Consider what each arrangement makes possible and what it cannot provide.',
    verdicts: verdicts(
      'The picture shows warm, direct sharing among three people. But a picture of three people cannot show everyone, and the sources describe tension and limits that the picture leaves out.',
      'The picture supports warmth among those shown. Paul (1 Corinthians 11:21, 33) and Justin (First Apology 66) show that welcome at shared meals could be uneven or limited.',
      'The picture cannot show who is absent, who served, or who was excluded. The sources come from other places and times, and they suggest that equal welcome cannot be assumed.',
    ),
    sort: [
      { id: 'sharing', text: 'Three people are sharing bread at a low table.', answer: 'picture', why: 'You can see this directly in the picture.' },
      { id: 'hungry', text: 'At one community’s meals, some people went hungry while others had plenty.', answer: 'source', sourceId: 'S2', why: 'Paul says this about Corinth (1 Corinthians 11:21). The picture shows the opposite: plenty for everyone visible.' },
      { id: 'eucharist', text: 'This meal is the Eucharist.', answer: 'unestablished', why: 'Neither the picture nor the sources tell us what kind of meal this is. Justin describes the Eucharist, but not this table.' },
      { id: 'equal', text: 'Everyone at this gathering was treated as an equal.', answer: 'unestablished', why: 'The picture shows three friendly people, not the whole gathering. The sources suggest equal treatment could not be taken for granted.' },
    ],
    sourceIds: ['S2', 'S1'],
    sourceNote: 'Neither source describes this household, these people, or this exact decision.',
    imageLimitation: 'The scene does not establish an exact Eucharistic ritual, seating arrangement, or relationship between a household meal and worship.',
  },

  reading: {
    id: 'reading',
    number: 'E3',
    title: 'Hearing together, interpreting differently',
    kind: 'brief',
    image: image(
      'scripture-reading',
      941,
      'One adult holds a large scroll while two others listen.',
      "A bearded adult at the center holds an open roll with marks resembling writing. A woman on the left and a man on the right face the reader. Food, a jug, and lamps sit nearby. The marks do not identify a readable historical passage; the picture does not establish anyone's office or literacy.",
    ),
    caseQuestion: 'Did everyone here understand the reading the same way?',
    hotspots: [
      {
        id: 'scroll', x: 45, y: 52, label: 'The open roll',
        see: 'An open roll of papyrus with marks like writing, held between two wooden rollers.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin says that at the Sunday gathering “the memoirs of the apostles or the writings of the prophets are read, as long as time permits” (First Apology 67).' },
        limit: 'The writing is not a real, readable passage. We cannot tell which text this is, and the picture does not show whether communities used rolls or bound books.',
        voices: {
          host: 'Rolls like this are costly. Keeping them safe in my house is part of what I give.',
          worker: 'I cannot read the marks. I know these words only by hearing them.',
          traveler: 'The same words are read where I come from. That makes this room feel less strange.',
          neighbor: 'They read from a roll the way schoolmasters do. What is in it?',
        },
      },
      {
        id: 'reader', x: 68, y: 33, label: 'The reader',
        see: 'A bearded man reads aloud while the others watch him.',
        context: { kind: 'source', sourceId: 'S1', text: 'In Justin’s account, when the reader stops, the one presiding speaks and urges the listeners to imitate what they heard (First Apology 67).' },
        limit: 'We do not know whether this man presides, how he learned to read, or whether others here could read too.',
        voices: {
          host: 'He reads well. I asked him because the room listens to him.',
          worker: 'When he reads, I am allowed to stop and listen too.',
          traveler: 'I am used to a different voice reading. The words sound new in his mouth.',
          neighbor: 'One man talks, the others go quiet. Through the wall it sounds like a lecture.',
        },
      },
      {
        id: 'listener-left', x: 10, y: 62, label: 'The woman listening',
        see: 'A woman leans forward, chin on her hand, listening closely.',
        context: { kind: 'interpretation', text: 'Most people in the Roman world met texts by hearing them read aloud, not by reading alone. Listening together was the ordinary way to meet a text.' },
        limit: 'Her posture suggests attention. It does not tell us whether she could read, or what she thought of the reading.',
        voices: {
          host: 'She asks the hardest questions afterward. I am glad she does.',
          worker: 'She listens the way I do: everything has to be remembered.',
          traveler: 'She is listening for something. I wonder what she has heard before.',
          neighbor: 'She comes every week to hear them read. What does she get from it?',
        },
      },
      {
        id: 'listener-right', x: 92, y: 70, label: 'The man listening',
        see: 'A younger man listens with his face turned toward the reader.',
        context: { kind: 'interpretation', text: 'Hearing a text together means hearing the same words at the same time. Understanding them the same way is another matter.' },
        limit: 'We cannot hear what anyone says. The picture freezes one moment of listening.',
        voices: {
          host: 'He disagreed last week. We are still talking about it.',
          worker: 'He listens hard, as if he will be asked to repeat it.',
          traveler: 'He looks as unsure as I feel.',
          neighbor: 'Young men gathering to hear readings at night. People will talk.',
        },
      },
      {
        id: 'food', x: 40, y: 88, label: 'The lamp and food',
        see: 'A lamp, olives, and cups sit on the table in front of the group.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin’s gathering moves from reading and instruction to prayer, and then to sharing bread and wine (First Apology 67).' },
        limit: 'The food on the table does not tell us whether this reading happened before, during, or after a meal.',
        voices: {
          host: 'The food waits until the reading ends.',
          worker: 'I set the food out early. It will be cold before anyone eats.',
          traveler: 'Reading first, eating after. Is that how they do it here?',
          neighbor: 'Reading and then eating together. A strange sort of dinner party.',
        },
      },
    ],
    outsideFrame: [
      { id: 'text', position: 'top', question: 'What text is being read?', kind: 'unknown', answer: 'We do not know. The writing on the roll was invented for the picture.' },
      { id: 'absent', position: 'left', question: 'Who could not come to hear it?', kind: 'source', sourceId: 'S5', answer: 'Pliny says Christians met before daylight on a fixed day (Letters 10.96). People who did not control their own time may have found any meeting hard to reach.' },
      { id: 'chose', position: 'right', question: 'Who decided what was read?', kind: 'source', sourceId: 'S1', answer: 'Justin mentions a reader and a presider, but not who chose the texts (First Apology 67).' },
      { id: 'disagree', position: 'bottom', question: 'What happened when people disagreed?', kind: 'unknown', answer: 'We do not know for this household. The picture shows listening, not argument.' },
    ],
    situation: {
      label: 'Fictional situation',
      paragraphs: [
        'After a reading, listeners disagree about what an obligation requires. One hears a command; another thinks the community must work out what it means in practice. For comparison: Paul urges the recipients to wait for one another when gathering to eat (1 Corinthians 11:33). That is an earlier text, not the one on this roll.',
      ],
    },
    decisionPrompt: 'What would help them examine the disagreement?',
    feedbackLabel: 'Interpretation',
    choices: [
      { id: 'repeat', label: 'Ask for the passage to be repeated.', feedback: 'Hearing the words again can correct a misunderstanding, but repetition may leave the disagreement about meaning intact.', followUp: 'What question should follow the repeated reading?' },
      { id: 'presider', label: 'Ask the presiding person to explain.', feedback: 'An explanation can guide the group; authority alone does not show why an interpretation fits the text.', followUp: 'What reasons would you ask the speaker to provide?' },
      { id: 'listeners', label: 'Ask the listeners to explain what they heard.', feedback: 'Different accounts can expose assumptions, although agreement among speakers would not by itself settle the meaning.', followUp: 'How would you compare their interpretations with the text?' },
    ],
    neutralFeedback: 'A text, its reader, and its interpretation are related but distinct. Think about what kind of explanation would help you judge the meaning.',
    verdicts: verdicts(
      'They heard the same words at the same time, and Justin says the presider explained the reading (First Apology 67). That gives them common ground to begin from.',
      'A shared hearing and an explanation help, but Paul’s letters show communities arguing about what instructions meant (1 Corinthians 11). Agreement is not guaranteed.',
      'The picture shows attention, not understanding. No source tells us what these listeners thought.',
    ),
    sort: [
      { id: 'listening', text: 'One person holds an open roll while two others listen.', answer: 'picture', why: 'You can see this directly in the picture.' },
      { id: 'read-aloud', text: 'In Justin’s account, texts were read aloud at the gathering.', answer: 'source', sourceId: 'S1', why: 'Justin says this (First Apology 67). The picture is consistent with it but cannot prove it.' },
      { id: 'paul-roll', text: 'The roll contains a letter of Paul.', answer: 'unestablished', why: 'The marks on the roll are invented. No one can identify the text.' },
      { id: 'illiterate', text: 'The woman cannot read.', answer: 'unestablished', why: 'Listening does not mean someone cannot read. The picture tells us nothing about her literacy.' },
    ],
    sourceIds: ['S1', 'S2'],
    sourceNote: 'Each source keeps its own setting; neither identifies what this household read.',
    imageLimitation: "The roll's script and contents are not identified. Do not infer a universal literacy rate, gender rule, or scroll-versus-book practice from this scene.",
  },

  diversity: {
    id: 'diversity',
    number: 'E4',
    title: 'Who can speak in this circle?',
    kind: 'brief',
    image: image(
      'social-diversity',
      941,
      'Four adults in different clothing sit in conversation around a low table.',
      'Two women sit on the left and two men to the right. One woman wears a richly colored garment and jewelry; another person wears an apron-like garment. They appear to take part in one conversation. Clothing differences are visible, but the image cannot establish legal status, occupation, wealth, or influence.',
    ),
    caseQuestion: 'Did everyone in this circle have an equal voice?',
    hotspots: [
      {
        id: 'purple', x: 39, y: 58, label: 'The purple garment',
        see: 'A woman in a deep purple garment with jewelry gestures as she speaks.',
        context: { kind: 'source', sourceId: 'S3', text: 'Paul greets Prisca and Aquila “and the church in their house” (Romans 16:5). Some gatherings depended on members who had a house to offer.' },
        limit: 'Fine clothing in a modern picture does not prove wealth, and it does not prove she hosts the gathering.',
        voices: {
          host: 'This is my house. When I speak, people listen. I hope that is for good reasons.',
          worker: 'When she talks, I wait. It is not my place to interrupt.',
          traveler: 'She is clearly someone important here. I will follow her lead.',
          neighbor: 'That woman could entertain anyone. Why this crowd?',
        },
      },
      {
        id: 'apron', x: 67, y: 55, label: 'The work apron',
        see: 'A man wears a leather work apron and sits with his hands folded.',
        context: { kind: 'source', sourceId: 'S5', text: 'Pliny tells Trajan that many Christians were of “every age, every rank, and both sexes” (Letters 10.96).' },
        limit: 'An apron is a costume detail. It does not tell us his trade, his legal status, or how freely he can speak.',
        voices: {
          host: 'He mended my roof last spring. Here he sits as a brother.',
          worker: 'My hands are rough. In this circle no one remarks on it.',
          traveler: 'He looks as if he came straight from work, as I came straight from the road.',
          neighbor: 'The leatherworker goes there too. Odd company for a lady of that house.',
        },
      },
      {
        id: 'cloak', x: 88, y: 55, label: 'The rough cloak',
        see: 'An older man in a rough, patched cloak leans in to listen, a staff beside him.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin lists strangers and people in need among those the community supported (First Apology 67).' },
        limit: 'A worn cloak may suggest poverty or travel. The picture cannot tell us which, or whether either is true.',
        voices: {
          host: 'He has belonged to this community longer than any of us.',
          worker: 'He has nothing, and they still give him a seat.',
          traveler: 'Maybe he was a traveler once, like me.',
          neighbor: 'Beggars are welcome there, I hear. That brings trouble.',
        },
      },
      {
        id: 'quiet', x: 20, y: 45, label: 'The quiet listener',
        see: 'A young woman in plain clothing watches the speaker with her hands clasped.',
        context: { kind: 'interpretation', text: 'Sitting in the circle shows she is present. Whether she feels free to disagree is something the picture cannot show.' },
        limit: 'We know nothing about her: not her status, her family, or her role here.',
        voices: {
          host: 'She has not said a word tonight. I should ask her.',
          worker: 'I know why she is quiet. Disagreeing with the host has a price.',
          traveler: 'She watches more than she speaks. So do I.',
          neighbor: 'Who is she? Not family, I think.',
        },
      },
      {
        id: 'circle-table', x: 45, y: 76, label: 'The shared table',
        see: 'A small round table with bread, olives, and cups sits in the middle of the circle.',
        context: { kind: 'source', sourceId: 'S2', text: 'Paul writes that when the Corinthians come together, there are divisions among them (1 Corinthians 11:18).' },
        limit: 'Sitting at one table does not show that everyone had an equal voice.',
        voices: {
          host: 'I provide the bread. I try not to let that decide the conversation.',
          worker: 'The bread is shared. The talking is not, always.',
          traveler: 'Bread is passed to everyone. Words come more slowly to some.',
          neighbor: 'They sit together like a family, though they are not one.',
        },
      },
    ],
    outsideFrame: [
      { id: 'invited', position: 'top', question: 'Who invited each person?', kind: 'unknown', answer: 'We do not know. The picture shows who is present, not how they came to be there.' },
      { id: 'missing', position: 'left', question: 'Who is not in this circle?', kind: 'source', sourceId: 'S2', answer: 'Paul’s complaint about divisions (1 Corinthians 11:18) suggests some people gathered apart from others. Who is missing here is not shown.' },
      { id: 'owner', position: 'right', question: 'Who owns this house?', kind: 'source', sourceId: 'S3', answer: 'Romans 16:5 shows that some communities met in a member’s house. Which person here, if any, owns this house is part of the fiction.' },
      { id: 'after', position: 'bottom', question: 'What happens after someone disagrees?', kind: 'unknown', answer: 'We do not know. No source records this conversation.' },
    ],
    situation: {
      label: 'Fictional situation',
      paragraphs: [
        'In this fictional scenario, a person who provides the meeting space speaks at length. Another participant hesitates to disagree. These relationships are supplied by the scenario, not established by the costumes.',
      ],
    },
    decisionPrompt: 'What would you do first?',
    feedbackLabel: 'Interpretation',
    choices: [
      { id: 'clarify', label: 'Ask the provider of the space to clarify.', feedback: 'This may make the position easier to examine while leaving the conversation centered on the same speaker.', followUp: 'How would you make room for another account?' },
      { id: 'public', label: 'Invite the hesitant participant to speak.', feedback: 'A public invitation can open the conversation, but it may also expose someone who does not feel free to disagree.', followUp: 'What makes an invitation safe or unsafe in this situation?' },
      { id: 'private', label: 'Offer a private way to contribute.', feedback: 'A private conversation may reduce exposure without changing what the wider group hears.', followUp: 'How could the concern be considered without taking control of its speaker?' },
      { id: 'question-premise', label: 'Question what the scenario assumes.', feedback: 'Hesitation can have different explanations. It need not mean agreement, fear, or lack of knowledge.', followUp: 'What would you need to know before describing the relationship?' },
    ],
    neutralFeedback: 'Sitting together does not reveal how freely each person can speak. Ask what the image shows and what the scenario asks you to imagine.',
    recall: { encounterId: 'meal', heading: 'Earlier, at the table…', question: 'Does this conversation complicate your earlier view of who takes part?' },
    verdicts: verdicts(
      'They sit in one circle around one table, and several people appear engaged in the conversation.',
      'They share a space, but Paul’s letter shows divisions within a gathering (1 Corinthians 11:18), and households held real differences of power.',
      'A still picture cannot show who speaks freely. Costumes do not establish status, and no source describes this circle.',
    ),
    sort: [
      { id: 'four', text: 'Four adults in different clothing sit around a low table.', answer: 'picture', why: 'You can see this directly in the picture.' },
      { id: 'prisca', text: 'Paul greeted a community that met in Prisca and Aquila’s house.', answer: 'source', sourceId: 'S3', why: 'Romans 16:3–5 says this. It does not identify anyone in this picture.' },
      { id: 'ranks', text: 'Christians came from every rank of society.', answer: 'source', sourceId: 'S5', why: 'Pliny reports this for Bithynia (Letters 10.96). Costumes in a modern picture do not prove it.' },
      { id: 'host', text: 'The woman in purple is the host.', answer: 'unestablished', why: 'Clothing does not establish who owns the house. That relationship is part of the fiction.' },
      { id: 'free', text: 'Everyone in the circle felt free to disagree.', answer: 'unestablished', why: 'A still picture cannot show how free anyone felt to speak.' },
    ],
    sourceIds: ['S2', 'S3'],
    sourceNote: 'These are comparisons from earlier, different communities.',
    imageLimitation: 'These are fictional people. Do not label any figure as enslaved, freed, a worker, or a host solely from appearance.',
  },

  care: {
    id: 'care',
    number: 'E5',
    title: 'Care when needs do not match resources',
    kind: 'deep',
    image: image(
      'care-for-others',
      941,
      'Food, coins, and a folded textile lie between two adults.',
      'An adult on the left holds bread over a basket containing food. A folded textile is held between that person and an older adult on the right. Coins are visible in a dish below. The still image does not establish ownership of the goods, the direction of every transfer, or the wishes of a recipient.',
    ),
    caseQuestion: 'Did the person receiving help have a say in what they received?',
    hotspots: [
      {
        id: 'basket', x: 40, y: 60, label: 'The bread basket',
        see: 'A woman lifts a loaf from a basket of bread, figs, and other food.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin says those who are able give what they choose. The collection is left with the one presiding, who helps orphans, widows, the sick, prisoners, and strangers (First Apology 67).' },
        limit: 'We do not know whose food this is or who decided to give it.',
        voices: {
          host: 'I give from what I have. I hope it is received as care, not charity.',
          worker: 'I packed this basket. My own family’s bread is thinner tonight.',
          traveler: 'This food will carry me to the next city.',
          neighbor: 'They feed people who are not their own kin. Why?',
        },
      },
      {
        id: 'grain', x: 20, y: 62, label: 'The grain sack',
        see: 'A small cloth sack of grain sits in the basket.',
        context: { kind: 'interpretation', text: 'Grain was the most basic food. Support that came again and again could matter as much as a single gift.' },
        limit: 'The picture shows one moment, not whether help like this ever came again.',
        voices: {
          host: 'A gift today is easy. Bread every week is a promise.',
          worker: 'Grain must be ground and baked before anyone eats it.',
          traveler: 'Grain is heavy to carry. I need food I can eat on the road.',
          neighbor: 'They hand out grain while prices rise. People notice.',
        },
      },
      {
        id: 'cloak', x: 68, y: 50, label: 'The folded cloak',
        see: 'A heavy folded cloak is held between two pairs of hands.',
        context: { kind: 'interpretation', text: 'Clothing was costly and needed for travel and winter. A cloak could be worth as much as food.' },
        limit: 'We cannot tell whether the cloak is being given, returned, or shown.',
        voices: {
          host: 'This cloak kept my family warm. It should keep someone else warm now.',
          worker: 'I washed and mended it before it was given.',
          traveler: 'Nights on the road are cold. A cloak makes the difference.',
          neighbor: 'Even clothes are given away there.',
        },
      },
      {
        id: 'coins', x: 61, y: 88, label: 'The dish of coins',
        see: 'A shallow dish of coins sits on the mat.',
        context: { kind: 'source', sourceId: 'S1', text: 'Justin describes money and goods collected at the gathering and kept by the presider for those in need (First Apology 67).' },
        limit: 'The coins do not tell us who gave them, how much they were worth, or who will receive them.',
        voices: {
          host: 'Money is the hardest gift to give without strings.',
          worker: 'I have nothing to add to that dish.',
          traveler: 'Coins can pay for a passage by ship. Will these be enough?',
          neighbor: 'Where does all that money go?',
        },
      },
      {
        id: 'hands', x: 88, y: 62, label: 'The receiving hands',
        see: 'Older, weathered hands reach for the cloak. We see only part of this person.',
        context: { kind: 'interpretation', text: 'The person receiving help sits at the edge of the frame. Their wishes and their voice are not shown.' },
        limit: 'The picture cannot tell us what this person needs most, or what they think of the help.',
        voices: {
          host: 'I should ask what they need, not decide for them.',
          worker: 'I have been on that side of the basket.',
          traveler: 'Receiving is harder than giving.',
          neighbor: 'Accepting their help puts you in their debt.',
        },
      },
    ],
    outsideFrame: [
      { id: 'decided', position: 'top', question: 'Who decided who gets help?', kind: 'source', sourceId: 'S1', answer: 'Justin says the one presiding kept the collection and gave to those in need (First Apology 67). How this household decided is unknown.' },
      { id: 'others', position: 'left', question: 'Who else asked for help today?', kind: 'unknown', answer: 'We do not know. The situation imagines two requests; the picture shows only one exchange.' },
      { id: 'wants', position: 'right', question: 'What does the person receiving want?', kind: 'unknown', answer: 'The picture does not show their face or their words. Their wishes are not recorded.' },
      { id: 'from', position: 'bottom', question: 'Where did the gifts come from?', kind: 'source', sourceId: 'S1', answer: 'In Justin’s account, those who were prosperous and willing gave what they chose (First Apology 67). The source of these gifts is not shown.' },
    ],
    situation: {
      label: 'Fictional situation',
      paragraphs: [
        'A traveler needs help to continue a journey. A local household needs ongoing support. In this fictional situation, the available help cannot fully meet both requests today.',
      ],
    },
    decisionPrompt: 'What would you recommend?',
    feedbackLabel: 'Interpretation',
    choices: [
      { id: 'immediate', label: 'Address the most immediate need first.', feedback: 'Urgency gives a reason to act now, but the recurring need remains and may grow harder to meet.', followUp: 'How did you decide which need was most urgent?' },
      { id: 'divide', label: 'Divide the help between both requests.', feedback: 'Sharing can acknowledge both requests while leaving each insufficiently met.', followUp: 'What would each person say your share makes possible?' },
      { id: 'seek-help', label: 'Seek another contributor before deciding.', feedback: 'More help may improve the options, but asking takes time and could attach further expectations to the support.', followUp: 'Who bears the cost of delay or a new obligation?' },
      { id: 'another', label: 'Ask the people in need first.', feedback: 'An alternative should explain the information it needs and how people seeking help take part in the decision.', followUp: 'Whose account would you hear next?' },
    ],
    neutralFeedback: 'Visible generosity does not tell you how a decision was made. Consider needs, available help, and the participation of those affected.',
    perspective: { label: 'Fictional dialogue', text: '“Before deciding for me, ask what would help me most.”' },
    recall: { encounterId: 'letter', heading: 'Earlier, at the threshold…', question: 'Does your standard for welcome affect this recommendation?' },
    verdicts: verdicts(
      'Nothing in the picture shows the gift being forced on anyone; the hands meet in the middle.',
      'Justin describes organized help (First Apology 67), but the presider made the decisions. The person receiving may have been asked, or may not.',
      'We do not see the recipient’s face or hear their voice. No source tells us how this exchange was decided.',
    ),
    sort: [
      { id: 'goods', text: 'A basket of food, a folded cloak, and a dish of coins appear between two people.', answer: 'picture', why: 'You can see these things directly in the picture.' },
      { id: 'collection', text: 'Justin describes a collection kept for orphans, widows, the sick, and strangers.', answer: 'source', sourceId: 'S1', why: 'First Apology 67 says this. It describes Justin’s community, not this household.' },
      { id: 'growth', text: 'Helping others is why Christianity grew.', answer: 'unestablished', why: 'Neither the picture nor these sources show that care alone explains growth.' },
      { id: 'own-property', text: 'The woman is giving away her own property.', answer: 'unestablished', why: 'The picture does not show who owns the goods or where they came from.' },
    ],
    sourceIds: ['S1'],
    sourceNote: 'Justin describes organized assistance. His account does not show that aid alone explains conversion, numerical growth, or moral superiority.',
    imageLimitation: 'The picture illustrates material support, but does not establish who gives, who decides, or how the exchange is experienced.',
  },

  pressure: {
    id: 'pressure',
    number: 'E6',
    title: 'Looking back from the threshold',
    kind: 'brief',
    image: image(
      'roman-pressure',
      941,
      'A household shrine with a statue and smoking vessel stands in the foreground; people sit farther back.',
      'An architectural niche contains a small standing statue. Lamps and vessels surround it, including a vessel emitting smoke. Beyond a column, several people sit together in a room. No one is shown performing a rite at the shrine or making an accusation. Their relationship to the shrine is not established.',
    ),
    caseQuestion: 'Did everyone in this house share the same religious practices?',
    hotspots: [
      {
        id: 'statue', x: 77, y: 30, label: 'The shrine and statue',
        see: 'A small bronze statue stands in a painted niche framed by columns and a laurel wreath.',
        context: { kind: 'interpretation', text: 'Many Roman houses had a household shrine for the family’s protective gods.' },
        limit: 'We do not know whose shrine this is, which god is shown, or whether anyone in the gathering uses it.',
        voices: {
          host: 'My family’s shrine has stood here for generations. Not everyone under my roof honors it now.',
          worker: 'I clean the shrine each morning. Whose gods am I serving?',
          traveler: 'Every house I enter has a shrine like this. I keep my eyes down.',
          neighbor: 'A proper house honors its gods. Does theirs?',
        },
      },
      {
        id: 'smoke', x: 69, y: 64, label: 'The smoking bowl',
        see: 'Smoke rises from a bowl on the shrine’s ledge. Something is burning.',
        context: { kind: 'source', sourceId: 'S5', text: 'Pliny tested accused Christians by asking them to offer incense and wine to the emperor’s image and the gods, and to curse Christ (Letters 10.96).' },
        limit: 'No one is performing a rite in the picture. The smoke does not tell us who lit it or why.',
        voices: {
          host: 'Someone lit the incense today. I did not ask who.',
          worker: 'I was told to light it. I did as I was told.',
          traveler: 'I know what is expected when incense burns. I am not sure I can do it.',
          neighbor: 'Incense for the gods and the emperor. Anyone loyal would offer it.',
        },
      },
      {
        id: 'column', x: 52, y: 55, label: 'The dividing column',
        see: 'A dark column splits the picture: the shrine on the right, the gathering on the left.',
        context: { kind: 'interpretation', text: 'This split is the artist’s composition. It invites us to compare the two spaces, but it is a choice, not evidence.' },
        limit: 'The column does not show how far apart these spaces really were, or whether they belong to the same house.',
        voices: {
          host: 'I keep the two rooms apart. I am not sure that is enough.',
          worker: 'I walk between these rooms all day.',
          traveler: 'I am on one side of that column. Others are on the other.',
          neighbor: 'From outside, it is all one house.',
        },
      },
      {
        id: 'group', x: 28, y: 50, label: 'The group at the table',
        see: 'Several people sit around a table beyond the column, lit by lamps.',
        context: { kind: 'source', sourceId: 'S5', text: 'Pliny reports that Christians met on a fixed day before dawn, sang to Christ, and later shared ordinary food (Letters 10.96).' },
        limit: 'We cannot see what they are doing or how they relate to the shrine.',
        voices: {
          host: 'We gather here because it is quiet. I hope it stays that way.',
          worker: 'I serve at that table and at the shrine. Both expect something of me.',
          traveler: 'They sit close and speak low. I think I understand why.',
          neighbor: 'They meet behind closed doors. People talk about what goes on.',
        },
      },
      {
        id: 'hanging-lamp', x: 62, y: 22, label: 'The hanging lamp',
        see: 'A bronze lamp hangs on chains near the shrine.',
        context: { kind: 'interpretation', text: 'Lamps and offerings were common in household religion. Their presence shows a religious setting, not who took part.' },
        limit: 'A lamp is set dressing. It tells us nothing about the people in the next room.',
        voices: {
          host: 'The lamp honors the gods my parents honored.',
          worker: 'I trim that lamp every evening.',
          traveler: 'It is a beautiful house. I do not know yet whether it is safe.',
          neighbor: 'The shrine lamp is lit. At least someone in that house keeps the old ways.',
        },
      },
    ],
    outsideFrame: [
      { id: 'owner', position: 'top', question: 'Who owns this shrine?', kind: 'unknown', answer: 'We do not know. The picture does not show whose house this is.' },
      { id: 'watching', position: 'left', question: 'Is anyone outside watching?', kind: 'source', sourceId: 'S5', answer: 'Pliny received accusations, some anonymous (Letters 10.96). Trajan replied that Christians should not be hunted out and anonymous accusations should be ignored (Letters 10.97). Nothing here shows an accusation.' },
      { id: 'refuse', position: 'right', question: 'What happened to people who refused the rite?', kind: 'source', sourceId: 'S5', answer: 'In Bithynia, Pliny executed those who persisted after warnings and released those who offered and cursed Christ (Letters 10.96). That was a different province, about fifty years earlier.' },
      { id: 'pressure', position: 'bottom', question: 'Did these people ever face pressure?', kind: 'unknown', answer: 'Not recorded. The picture creates an atmosphere; it does not show a threat.' },
    ],
    situation: {
      label: 'Interpretive task',
      paragraphs: [
        'You are choosing a caption for this reconstruction. Which statement is best supported by what is actually depicted?',
      ],
    },
    decisionPrompt: 'Which caption is best supported by the image?',
    feedbackLabel: 'Interpretation',
    choices: [
      { id: 'raid', label: 'This proves a raid is imminent.', feedback: 'No raid, accusation, or official appears in this image. Fear of an imminent raid is not established by its contents.', followUp: "What further evidence would let you make a claim about these people's actions?", support: 'unsupported' },
      { id: 'context', label: "It depicts religious surroundings, but cannot establish the group's actions.", feedback: 'This distinguishes the shrine that is depicted from claims about the people behind it. Their relationship requires further evidence.', followUp: "What further evidence would let you make a claim about these people's actions?", support: 'supported' },
      { id: 'shared-rites', label: 'This proves everyone shown participated in the same rites.', feedback: 'Sharing a frame does not prove shared practice. The smoking vessel also does not establish which person, if any, used it.', followUp: "What further evidence would let you make a claim about these people's actions?", support: 'unsupported' },
    ],
    neutralFeedback: 'Describe the depicted shrine and gathering separately before inferring how they relate. A dramatic atmosphere does not supply missing evidence.',
    verdicts: verdicts(
      'The shrine and the gathering share one house, and Roman households were expected to honor their gods together.',
      'A household could hold people with different loyalties. Pliny’s test with incense and wine (Letters 10.96) shows that some refused rites others expected.',
      'No one is shown at the shrine, and no source describes this household. Who honored which gods is not shown.',
    ),
    sort: [
      { id: 'shrine', text: 'A household shrine with a statue and a smoking bowl stands near a group of seated people.', answer: 'picture', why: 'You can see this directly in the picture.' },
      { id: 'test', text: 'Pliny tested accused Christians by asking them to offer incense.', answer: 'source', sourceId: 'S5', why: 'Pliny says this (Letters 10.96). It happened in Bithynia, not in this house.' },
      { id: 'trajan', text: 'Trajan told Pliny that Christians should not be hunted out.', answer: 'source', sourceId: 'S5', why: 'Trajan’s reply says this (Letters 10.97).' },
      { id: 'refuse', text: 'The people at the table refuse to use the shrine.', answer: 'unestablished', why: 'No one is shown at the shrine. Their relationship to it is not established.' },
      { id: 'raid', text: 'A raid is about to happen.', answer: 'unestablished', why: 'No official, accuser, or threat appears. The mood comes from lighting and composition.' },
    ],
    sourceIds: ['S5'],
    sourceNote: 'This administrative exchange comes from an earlier time and a different province. It is not a report about the pictured gathering.',
    imageLimitation: 'The image does not prove an active shrine in a Christian-owned household, a group’s refusal of a rite, or a constant threat of persecution.',
  },
}

export const supportLabels = {
  supported: 'Supported by what is depicted',
  unsupported: 'Not supported by what is depicted. Treat it as a revisable interpretation.',
}

export const sortPlaces = {
  picture: 'In the picture',
  source: 'In a historical source',
  unestablished: 'Not established',
}

export const contextLabels = {
  source: 'Historical source',
  interpretation: 'Interpretation',
  unknown: 'Not recorded',
}

export const framePositions = ['top', 'left', 'right', 'bottom']
