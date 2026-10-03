# At the Threshold — experience content specification

This is authored content for the experience described in [the architecture](experience-architecture.md). It contains no essay assignment, grading rubric, Canvas submission requirements, or required word counts. [The coding-agent handoff](coding-agent-handoff.md) explains how to use both documents.

The wording below is implementation-ready draft copy. Correct obvious copy issues while preserving the distinctions between observed image details, historical testimony, and fictional situations. A specialist/instructor's content review is still needed before treating this as a validated classroom resource.

## 1. Global copy and interaction rules

**Title:** At the Threshold: Belonging in an Early Christian Gathering

**Central question:** What did belonging to this gathering require, and who carried its costs?

**Setting label:** A fictional household gathering in Rome, around AD 160.

**Opening copy:**

> A visitor arrives. Food is shared. A text is read. People have different needs and different influence. Explore six encounters and consider how a gathering becomes a community.
>
> These are modern reconstructed images, not photographs or excavated scenes. The people, dialogue, and situations are fictional. Historical sources will help you test what the reconstruction suggests; they do not document this particular household.
>
> You are an investigator, not a character required to act or believe in a particular way. You can explore in any order, leave notes blank, and revisit a judgment. Allow about 40 minutes, at your own pace.

**Opening optional field:** “What might make a gathering a community?”

**Buttons:** “Begin at the threshold”; “Resume” when previous notes exist; “Descriptions only”; “Open offline experience.” Provide a contents link immediately.

**Persistent labels:** “Modern reconstruction” for images; “Fictional situation” for invented events; “Fictional dialogue” where speech is invented; “Historical source” for source cards; “Interpretation” for an explanatory inference. Use visible words, not color alone. Avoid the old label “Evidence collected.”

**Source introduction:** “These texts come from different times and places. Read each card's setting and limit before applying it to this imagined gathering.”

**Progress wording:** “Encounters visited” and “Notes recorded.” Neither is a score. **Save wording:** “Saved on this browser” only after confirmed local saving; otherwise the architecture's pending/failure language.

Religious commitments remain part of the subject: reading, prayer, worship, and participation are meaningful to the people being studied. The activity neither asks the learner to perform those practices nor reduces every practice to a modern social service. Do not add a narrator who announces what all early Christians believed or how every community met.

## 2. Stable manifest

All image paths below are relative to `public/` in the existing repository. The build generates display derivatives without modifying these originals. Preserve the current machine IDs to simplify the transition; use the new order explicitly instead of relying on object insertion order.

| Order | Encounter ID | Kind | Original asset | Source IDs | Recall |
|---|---|---|---|---|---|
| E1 | `letter` | `deep` | `images/evidence/traveling-letter.png` | S3, S4 | None |
| E2 | `meal` | `deep` | `images/evidence/shared-meal.png` | S2, S1 | None |
| E3 | `reading` | `brief` | `images/evidence/scripture-reading.png` | S1, S2 | None |
| E4 | `diversity` | `brief` | `images/evidence/social-diversity.png` | S2, S3 | `meal` |
| E5 | `care` | `deep` | `images/evidence/care-for-others.png` | S1 | `letter` |
| E6 | `pressure` | `brief` | `images/evidence/roman-pressure.png` | S5 | None |

Every listed choice needs the stated feedback and follow-up question in data. Each encounter also has neutral feedback for learners who reveal without choosing. All source summaries remain reachable regardless of selection. Branches change the perspective presented first; they do not invent what actually happened in antiquity.

## 3. E1 — A traveler at the threshold

**ID/kind:** `letter` / `deep`.

**Alt:** A traveler hands a sealed roll to a woman in a doorway.

**Long description:** Two adults face each other at an entrance. The person on the left wears a worn-looking cloak and carries a bag. Both hold a rolled document tied with a red cord and seal. A lamp, jug, and interior courtyard are visible. The image does not reveal the document's contents or either person's identity.

**Situation:** A newcomer brings a message recommending someone who needs accommodation. The household knows neither the messenger nor the person recommended. You are asked what kind of welcome to offer while the message is considered.

**Observation prompt:** “What do the hands, doorway, and sealed roll suggest? Separate what you see from what you assume.”

**Decision prompt:** “What would you recommend, and what grounds for trust would you rely on?”

| Choice ID | Label | Feedback | Follow-up question |
|---|---|---|---|
| `welcome` | Offer hospitality immediately. | This meets a need without delay, while asking the household to act on a claim it has not checked. | What would make that responsibility reasonable? |
| `temporary` | Offer a temporary welcome while seeking information. | This combines welcome with inquiry, but someone must provide the time, space, and work that arrangement needs. | Whose work does your compromise require? |
| `verify-first` | Ask the traveler to wait while the message is checked. | This protects the household from an unverified claim, but delay itself can exclude someone who needs help. | How would the person waiting experience your decision? |
| `another` | Propose another approach or request information. | You can question the available options. Your alternative still needs to explain who acts and who waits. | What information would change your recommendation? |

**Neutral feedback:** “Welcoming and checking a claim can each impose costs. Before deciding, consider the needs of the visitor and the responsibilities of the host.”

**Source reveal:** S3 and S4. Frame them as examples for comparison, not proof that the pictured letter is a Pauline letter or that this Roman household followed the *Didache*.

**Reconsideration prompt:** “I first relied on ___. After considering the sources and another perspective, I would ___. I still need to know ___.”

**Image limitation:** “The messenger, seal, clothing, and contents of the roll are reconstructed. No depicted person is an identified historical figure.”

## 4. E2 — A shared table, an uneven welcome

**ID/kind:** `meal` / `deep`. Build this complete encounter first.

**Alt:** Three adults share bread around a low table with food and lamps.

**Long description:** A woman on the left extends bread toward a bearded man at the center. An older woman sits on the right holding bread. A low round table holds more bread, bowls of food, a jug, and lamps. All three appear engaged with one another. No people outside this group are visible, and the image does not explain who prepared or supplied the food.

**Situation — fictional dialogue:**

> A person preparing the table says: “Some who usually join us have not arrived. One of those here needs to leave soon. Shall we begin?”
>
> You have been asked for advice, not given authority over the gathering. Consider whose circumstances your recommendation includes.

**Observation fields:** “I can see…” and “I am assuming…”.

**Decision prompt:** “What would you recommend?”

| Choice ID | Label | Feedback — fictional dialogue | Follow-up question |
|---|---|---|---|
| `reserve` | Begin and reserve food for those absent. | “There will be food for them. Will they still share what happens around the table?” | Does receiving a portion equal participating? |
| `wait` | Wait for those who have not arrived. | “Then the person who must leave may miss the meal.” | Who carries the burden of waiting? |
| `separate` | Serve food now; postpone the shared observance. | “Would separating them change what we think we are doing?” | What have you assumed about meal and worship? |
| `another` | Propose another approach or request information. | “What would you need to know before deciding?” | What happens while you seek that information? |

**Neutral feedback:** “A full table can suggest welcome while leaving absent people outside the frame. Consider what each arrangement makes possible and what it cannot provide.”

**Source reveal:** S2, then S1. Add: “Neither source describes this household, these people, or this exact decision.” Use the bundled summaries and offer full-passage links; do not make external navigation mandatory.

**Reconsideration prompt:** “Keep your recommendation, change it, or remain unsure. Explain how a source or another perspective affects your reasons. What cost remains?”

**Transition:** “As you continue, notice who can influence how the gathering understands its shared practices.”

**Image limitation:** “The scene does not establish an exact Eucharistic ritual, seating arrangement, or relationship between a household meal and worship.”

**Record behavior:** capture the first observation/assumption, choice, and reason when perspectives are first revealed. Keep that snapshot visible beside current thinking. Retaining the same recommendation is allowed. No branch wins.

## 5. E3 — Hearing together, interpreting differently

**ID/kind:** `reading` / `brief`.

**Alt:** One adult holds a large scroll while two others listen.

**Long description:** A bearded adult at the center holds an open roll with marks resembling writing. A woman on the left and a man on the right face the reader. Food, a jug, and lamps sit nearby. The marks do not identify a readable historical passage; the picture does not establish anyone's office or literacy.

**Situation:** After a reading, listeners disagree about what an obligation requires. One hears a command; another thinks the community must interpret what it means in practice. What would help them examine the disagreement?

**Comparison text:** Display this attributed paraphrase separately: “Paul urges the recipients to wait for one another when gathering to eat (1 Corinthians 11:33).” Label it **earlier comparison, not the text identified on this scroll**. [S2][S2]

| Choice ID | Label | Feedback | Follow-up question |
|---|---|---|---|
| `repeat` | Ask for the passage to be repeated. | Hearing the words again can correct a misunderstanding, but repetition may leave the disagreement about meaning intact. | What question should follow the repeated reading? |
| `presider` | Ask the presiding person to explain. | An explanation can guide the group; authority alone does not show why an interpretation fits the text. | What reasons would you ask the speaker to provide? |
| `listeners` | Ask the listeners to explain what they heard. | Different accounts can expose assumptions, although agreement among speakers would not by itself settle the meaning. | How would you compare their interpretations with the text? |

**Neutral feedback:** “A text, its reader, and its interpretation are related but distinct. Think about what kind of explanation would help you judge the meaning.”

**Sources:** S1 and S2, retaining their separate settings.

**Optional note:** “I would ask ___. The answer could help me distinguish ___ from ___.”

**Image limitation:** “The roll's script and contents are not identified. Do not infer a universal literacy rate, gender rule, or scroll-versus-book practice from this scene.”

## 6. E4 — Who can speak in this circle?

**ID/kind:** `diversity` / `brief`.

**Alt:** Four adults in different clothing sit in conversation around a low table.

**Long description:** Two women sit on the left and two men to the right. One woman wears a richly colored garment and jewelry; another person wears an apron-like garment. They appear to take part in one conversation. Clothing differences are visible, but the image cannot establish legal status, occupation, wealth, or influence.

**Situation:** In this fictional scenario, a person who provides the meeting space speaks at length. Another participant hesitates to disagree. These relationships are supplied by the scenario, not established by the costumes.

| Choice ID | Label | Feedback | Follow-up question |
|---|---|---|---|
| `clarify` | Ask the provider of the space to clarify. | This may make the position easier to examine while leaving the conversation centered on the same speaker. | How would you make room for another account? |
| `public` | Invite the hesitant participant to speak. | A public invitation can open the conversation, but it may also expose someone who does not feel free to disagree. | What makes an invitation safe or unsafe in this situation? |
| `private` | Offer a private way to contribute. | A private conversation may reduce exposure without changing what the wider group hears. | How could the concern be considered without taking control of its speaker? |
| `question-premise` | Question what the scenario assumes. | Hesitation can have different explanations. It need not mean agreement, fear, or lack of knowledge. | What would you need to know before describing the relationship? |

**Neutral feedback:** “Sitting together does not reveal how freely each person can speak. Ask what the image shows and what the scenario asks you to imagine.”

**Perspective card — fictional dialogue:** “You have invited me to speak. I also depend on the person whose proposal you want me to question.” This illustrates one possible tension; it does not reveal a secret factual identity in the picture.

**Sources:** S2 and S3 as comparisons.

**Optional note:** “I inferred ___ from appearance or position. What I actually observed was ___.”

**Recall:** if the meal has a nonempty first reason or current thinking, show that exact text under “Earlier, at the table…” and ask “Does this conversation complicate your earlier view of participation?” If absent, show a link to revisit the meal without inventing a previous view.

**Image limitation:** “These are fictional people. Do not label any figure as enslaved, freed, a worker, or a host solely from appearance.”

## 7. E5 — Care when needs do not match resources

**ID/kind:** `care` / `deep`.

**Alt:** Food, coins, and a folded textile lie between two adults.

**Long description:** An adult on the left holds bread over a basket containing food. A folded textile is held between that person and an older adult on the right. Coins are visible in a dish below. The still image does not establish ownership of the goods, the direction of every transfer, or the wishes of a recipient.

**Situation:** A traveler needs help to continue a journey. A local household needs ongoing support. In this fictional situation, the available help cannot fully meet both requests today. Before recommending an arrangement, consider whose needs you understand and whose voice you have not heard.

**Observation prompt:** “What resources are visible? What information about the people and their needs is missing?”

| Choice ID | Label | Feedback | Follow-up question |
|---|---|---|---|
| `immediate` | Address the most immediate need first. | Urgency gives a reason to act now, but the recurring need remains and may grow harder to meet. | How did you decide which need was most urgent? |
| `divide` | Divide the help between both requests. | Sharing can acknowledge both requests while leaving each insufficiently met. | What would each person say your share makes possible? |
| `seek-help` | Seek another contributor before deciding. | More help may improve the options, but asking takes time and could attach further expectations to the support. | Who bears the cost of delay or a new obligation? |
| `another` | Ask another question or propose an alternative. | An alternative should explain the information it needs and how people seeking help participate in the decision. | Whose account would you hear next? |

**Neutral feedback:** “Visible generosity does not tell you how a decision was made. Consider needs, available help, and the participation of those affected.”

**Perspective card — fictional dialogue:** “Before deciding for me, ask what would help me most.”

**Source:** S1. Do not turn its description into a claim that aid alone explains conversion, numerical growth, or moral superiority.

**Reconsideration prompt:** “My proposal benefits ___. It leaves ___ unresolved. After hearing another perspective, I would ___.”

**Recall:** if the arrival encounter contains a saved rationale, quote it under “Earlier, at the threshold…” and ask whether the standard for welcome affects this recommendation. Otherwise offer a link; never block the encounter.

**Image limitation:** “The picture illustrates material support, but does not establish who gives, who decides, or how the exchange is experienced.”

## 8. E6 — Looking back from the threshold

**ID/kind:** `pressure` / `brief`.

**Alt:** A household shrine with a statue and smoking vessel stands in the foreground; people sit farther back.

**Long description:** An architectural niche contains a small standing statue. Lamps and vessels surround it, including a vessel emitting smoke. Beyond a column, several people sit together in a room. No one is shown performing a rite at the shrine or making an accusation. Their relationship to the shrine is not established.

**Situation:** You are choosing a caption for this reconstruction. Which statement is best supported by what is actually depicted? Then compare the image with a historical account from a different setting.

| Choice ID | Label | Feedback | Support |
|---|---|---|---|
| `raid` | This proves a raid is imminent. | No raid, accusation, or official appears in this image. Fear of an imminent raid is not established by its contents. | `unsupported` |
| `context` | It depicts religious surroundings, but cannot establish the group's actions. | This distinguishes the shrine that is depicted from claims about the people behind it. Their relationship requires further evidence. | `supported` |
| `shared-rites` | This proves everyone shown participated in the same rites. | Sharing a frame does not prove shared practice. The smoking vessel also does not establish which person, if any, used it. | `unsupported` |

For all three choices, the follow-up question is: “What further evidence would let you make a claim about these people's actions?”

**Neutral feedback:** “Describe the depicted shrine and gathering separately before inferring how they relate. A dramatic atmosphere does not supply missing evidence.”

**Source:** S5. Add: “This administrative exchange comes from an earlier time and a different province. It is not a report about the pictured gathering.”

**Optional note:** “I can describe ___. I cannot conclude ___. Evidence I would need is ___.”

**Image limitation:** “The image does not prove an active shrine in a Christian-owned household, a group's refusal of a rite, or a constant threat of persecution.”

The supported caption receives an explanation, not points or a reward. Selecting an unsupported caption should be treated as a revisable interpretation. Do not animate danger, play a police sound, or invent an arrest as branch feedback.

## 9. Closing and notebook copy

**Closing heading:** Look back at the gathering

**Copy:**

> You have considered who is welcomed, who is heard, and who carries the costs of shared life. The images supplied a setting; sources and other perspectives tested what that setting suggested.
>
> Look back at one of your earlier thoughts. What would you now keep, qualify, or reconsider? What remains uncertain?

Show the opening thought if present and a learner-selected saved encounter entry. Do not select a “best answer” or compose a conclusion for the learner.

**One optional field:** “One thought I would now keep, qualify, or reconsider…”

**Actions:** “Revisit an encounter”; “Review my notes”; “Copy notes”; “Download notes.” Secondary “Download backup” and “Restore backup” belong in notebook controls.

**Ending text:** “You can revisit these encounters or take your notes with you.” This is the end of the experience. No essay prompt, next assignment, submission confirmation, or Canvas link follows.

**Notebook heading:** My observations and thinking

**Notebook explanation:** “These are your notes from the experience. They are saved only in this browser when saving is available. Copy or download them if you want to keep them elsewhere.”

Blank sections say “No note recorded.” They do not say “Incomplete assignment.” Source links are available even when no notes exist. Export only the learner's actual words plus clearly labeled context and source references; do not generate filler responses.

## 10. Source records to implement

These summaries and limits should be bundled locally, not scraped on page load. Show the exact passage and setting beside each summary. They are attributed paraphrases, not direct quotations. The full texts are optional reading links. Keep dates approximate and the *Didache*'s uncertainty explicit.

### S1 — Justin, First Apology 65–67

- **Setting:** mid-second century; an apologetic account associated with Rome.
- **Genre/purpose:** a defense and explanation of Christian practices addressed to outsiders.
- **Summary:** Justin describes communal reading, instruction, prayer, Eucharistic participation, and organized assistance. His account includes boundaries around participation. [Text][S1]
- **Limit:** this is a selective presentation, not a transcript of this fictional household, a floor plan, or a description of every Christian gathering.
- **Reading aid:** consider the Jewish scriptural tradition behind the reference to prophets; the image does not show an identified book or a complete modern Bible.

### S2 — 1 Corinthians 11:17–34

- **Setting:** a first-century letter addressing a community in Corinth; earlier than the scenario.
- **Genre/purpose:** corrective instruction concerning the recipients' gathering.
- **Summary:** Paul criticizes division and unequal eating, including hunger and humiliation, and calls for changed conduct. [Text][S2]
- **Limit:** the criticism complicates a harmonious picture; it does not establish behavior in Rome around AD 160 or prove that the recipients followed the instruction.

### S3 — Romans 16:1–5

- **Setting:** first-century commendation and greetings, earlier than the scenario.
- **Genre/purpose:** a letter's naming of relationships and requests for welcome.
- **Summary:** The passage commends Phoebe and names Prisca, Aquila, and an assembly in their house. It supports considering networks and women's activity. [Text][S3]
- **Limit:** it does not identify the pictured people or establish a universal arrangement of household leadership.

### S4 — Didache 11–12

- **Setting:** an early Christian church-order text whose dating and provenance are debated; do not label it “Rome AD 160.”
- **Genre/purpose:** instructions concerning conduct and the reception of travelers and teachers.
- **Summary:** The text combines receiving newcomers with ways of evaluating their conduct and requests. [Text][S4]
- **Limit:** a prescribed rule is not proof of practice, and this household is not known to have followed these instructions.

### S5 — Pliny and Trajan, Letters 10.96–97

- **Setting:** Bithynia-Pontus, approximately AD 112; a different region and earlier period.
- **Genre/purpose:** an administrative inquiry and an imperial reply.
- **Summary:** The exchange describes accusations and ritual tests and gives direction about dealing with Christians, including limits on seeking them out. [Text][S5]
- **Limit:** this does not establish an imminent raid in the scenario or a single constant policy implemented identically throughout the empire.

## 11. Content checks before handoff

Verify that all six images retain neutral descriptions; all six scenarios have neutral no-choice feedback; every choice has feedback and a follow-up; source IDs resolve; no branch blocks later sources; linked earlier thoughts display only text the learner actually entered; and no assignment or grading copy is inherited from the earlier plan.

Review the meal/Eucharist distinction, the fictional status relationships, and the shrine's uncertain use explicitly with the instructor. The prose is a foundation for that review, not evidence that specialist review has occurred. Record image provenance and reuse information without inventing a generation tool or historical authenticity certification.

[S1]: https://www.newadvent.org/fathers/0126.htm
[S2]: https://www.biblegateway.com/passage/?search=1+Corinthians+11%3A17-34&version=NRSVUE
[S3]: https://www.biblegateway.com/passage/?interface=amp&search=Romans+16&version=NRSVUE
[S4]: https://www.newadvent.org/fathers/0714.htm
[S5]: https://www.earlychristianwritings.com/text/pliny.html
