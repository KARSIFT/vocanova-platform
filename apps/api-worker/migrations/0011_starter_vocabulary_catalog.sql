PRAGMA foreign_keys = ON;
PRAGMA defer_foreign_keys = ON;

-- Original VocaNova editorial starter catalog. Plain INSERT statements make a
-- stable-ID or English natural-key collision fail atomically, without changing
-- existing canonical or learner content.

INSERT INTO journey_situations
  (id, slug, title, short_description, level_band, category, status, display_order, created_at, updated_at)
VALUES
  ('a1000000-0000-4000-8000-000000000001', 'travel-airport', 'At the airport', 'Check in, find your gate, and ask for help before a flight.', 'a2_b1', 'travel', 'active', 10, '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a1000000-0000-4000-8000-000000000002', 'daily-life-shopping', 'Shopping for everyday things', 'Find what you need, ask about prices, and pay at a shop.', 'a2_b1', 'daily_life', 'active', 20, '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a1000000-0000-4000-8000-000000000003', 'work-meetings', 'In a work meeting', 'Share updates, understand tasks, and make clear arrangements.', 'a2_b1', 'work', 'active', 30, '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a1000000-0000-4000-8000-000000000004', 'study-classroom', 'In the classroom', 'Talk about lessons, assignments, and studying with classmates.', 'a2_b1', 'study', 'active', 40, '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z');

INSERT INTO canonical_words
  (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
VALUES
  ('a2000000-0000-4000-8000-000000000001', 'boarding pass', 'boarding pass', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000002', 'check in', 'check in', 'phrasal_verb', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000003', 'departure gate', 'departure gate', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000004', 'carry-on bag', 'carry-on bag', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000005', 'delayed', 'delayed', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000006', 'aisle seat', 'aisle seat', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z');

INSERT INTO canonical_words
  (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
VALUES
  ('a2000000-0000-4000-8000-000000000007', 'grocery store', 'grocery store', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000008', 'receipt', 'receipt', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000009', 'on sale', 'on sale', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000010', 'fitting room', 'fitting room', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000011', 'pay by card', 'pay by card', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000012', 'out of stock', 'out of stock', 'phrase', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z');

INSERT INTO canonical_words
  (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
VALUES
  ('a2000000-0000-4000-8000-000000000013', 'agenda', 'agenda', 'word', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000014', 'deadline', 'deadline', 'word', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000015', 'take notes', 'take notes', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000016', 'follow up', 'follow up', 'phrasal_verb', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000017', 'available', 'available', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000018', 'Could you repeat that?', 'could you repeat that?', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z');

INSERT INTO canonical_words
  (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
VALUES
  ('a2000000-0000-4000-8000-000000000019', 'assignment', 'assignment', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000020', 'take an exam', 'take an exam', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000021', 'hand in', 'hand in', 'phrasal_verb', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000022', 'explain', 'explain', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000023', 'group project', 'group project', 'phrase', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000024', 'look up', 'look up', 'phrasal_verb', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z');

INSERT INTO canonical_words
  (id, text, normalized_text, word_type, language_code, status, difficulty_level, created_at, updated_at)
VALUES
  ('a2000000-0000-4000-8000-000000000025', 'security check', 'security check', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000026', 'I would like to', 'i would like to', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000027', 'change', 'change', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000028', 'cash register', 'cash register', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000029', 'point out', 'point out', 'phrasal_verb', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000030', 'set up', 'set up', 'phrasal_verb', 'en', 'active', 'b1', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000031', 'review', 'review', 'word', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'),
  ('a2000000-0000-4000-8000-000000000032', 'make a mistake', 'make a mistake', 'phrase', 'en', 'active', 'a2', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z');

WITH starter(ordinal, part_of_speech, short_definition, learner_definition, level) AS (
  VALUES
    (1, 'phrase', 'a document that lets you get on a plane', 'Your boarding pass shows your flight and seat.', 'a2'),
    (2, 'phrasal_verb', 'to tell an airline you have arrived for a flight', 'Check in before you go through security.', 'a2'),
    (3, 'phrase', 'the place where passengers leave to board a plane', 'Your flight leaves from this gate.', 'a2'),
    (4, 'phrase', 'a small bag you take onto a plane with you', 'Keep important items in this bag.', 'a2'),
    (5, 'adjective', 'late or happening later than planned', 'A delayed flight leaves later than planned.', 'a2'),
    (6, 'phrase', 'a seat beside the passage between rows', 'You can get up easily from this seat.', 'a2'),
    (7, 'phrase', 'a shop that sells food and household items', 'Buy everyday food at this kind of store.', 'a2'),
    (8, 'noun', 'a paper or message that shows what you paid for', 'Keep it if you may return an item.', 'a2'),
    (9, 'phrase', 'offered at a lower price than usual', 'Look for this phrase on price labels.', 'a2'),
    (10, 'phrase', 'a private room where you try on clothes', 'Ask to use one before buying clothes.', 'a2'),
    (11, 'phrase', 'to use a bank card to pay', 'Ask if cards are accepted before paying.', 'a2'),
    (12, 'phrase', 'not available because a shop has sold all of it', 'The store cannot sell an item that is out of stock.', 'b1'),
    (13, 'noun', 'a list of topics to discuss in a meeting', 'Read the agenda before the meeting begins.', 'b1'),
    (14, 'noun', 'the latest time when something must be finished', 'Plan your work before the deadline.', 'b1'),
    (15, 'phrase', 'to write down important information', 'Take notes so you remember the decision.', 'a2'),
    (16, 'phrasal_verb', 'to contact someone again about a previous topic', 'Follow up after the meeting with a short email.', 'b1')
)
INSERT INTO word_meanings
  (id, word_id, part_of_speech, short_definition, learner_definition, meaning_order, status, difficulty_level, created_at, updated_at)
SELECT
  printf('a3000000-0000-4000-8000-%012d', ordinal),
  printf('a2000000-0000-4000-8000-%012d', ordinal),
  part_of_speech, short_definition, learner_definition, 1, 'active', level,
  '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'
FROM starter;

WITH starter(ordinal, situation_id, display_order, relevance_score, is_core) AS (
  VALUES
    (1, 'a1000000-0000-4000-8000-000000000001', 1, 100, 1), (2, 'a1000000-0000-4000-8000-000000000001', 2, 100, 1),
    (3, 'a1000000-0000-4000-8000-000000000001', 3, 95, 1), (4, 'a1000000-0000-4000-8000-000000000001', 4, 90, 1),
    (5, 'a1000000-0000-4000-8000-000000000001', 5, 90, 1), (6, 'a1000000-0000-4000-8000-000000000001', 6, 85, 0),
    (25, 'a1000000-0000-4000-8000-000000000001', 7, 85, 0), (26, 'a1000000-0000-4000-8000-000000000001', 8, 80, 0),
    (7, 'a1000000-0000-4000-8000-000000000002', 1, 100, 1), (8, 'a1000000-0000-4000-8000-000000000002', 2, 95, 1),
    (9, 'a1000000-0000-4000-8000-000000000002', 3, 90, 1), (10, 'a1000000-0000-4000-8000-000000000002', 4, 90, 1),
    (11, 'a1000000-0000-4000-8000-000000000002', 5, 85, 0), (12, 'a1000000-0000-4000-8000-000000000002', 6, 85, 0),
    (27, 'a1000000-0000-4000-8000-000000000002', 7, 80, 0), (28, 'a1000000-0000-4000-8000-000000000002', 8, 80, 0),
    (13, 'a1000000-0000-4000-8000-000000000003', 1, 100, 1), (14, 'a1000000-0000-4000-8000-000000000003', 2, 100, 1),
    (15, 'a1000000-0000-4000-8000-000000000003', 3, 95, 1), (16, 'a1000000-0000-4000-8000-000000000003', 4, 90, 1),
    (17, 'a1000000-0000-4000-8000-000000000003', 5, 85, 0), (18, 'a1000000-0000-4000-8000-000000000003', 6, 85, 0),
    (29, 'a1000000-0000-4000-8000-000000000003', 7, 80, 0), (30, 'a1000000-0000-4000-8000-000000000003', 8, 80, 0),
    (19, 'a1000000-0000-4000-8000-000000000004', 1, 100, 1), (20, 'a1000000-0000-4000-8000-000000000004', 2, 100, 1),
    (21, 'a1000000-0000-4000-8000-000000000004', 3, 95, 1), (22, 'a1000000-0000-4000-8000-000000000004', 4, 90, 1),
    (23, 'a1000000-0000-4000-8000-000000000004', 5, 85, 0), (24, 'a1000000-0000-4000-8000-000000000004', 6, 85, 0),
    (31, 'a1000000-0000-4000-8000-000000000004', 7, 80, 0), (32, 'a1000000-0000-4000-8000-000000000004', 8, 80, 0)
)
INSERT INTO journey_words
  (id, journey_situation_id, meaning_id, relevance_score, display_order, is_core, created_at, updated_at)
SELECT printf('a6000000-0000-4000-8000-%012d', ordinal), situation_id,
  printf('a3000000-0000-4000-8000-%012d', ordinal), relevance_score, display_order, is_core,
  '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'
FROM starter;

WITH starter(ordinal, example_text, level, situation_label) AS (
  VALUES
    (1, 'Please show your boarding pass at the gate.', 'a2', 'At the airport'), (2, 'We need to check in two hours before departure.', 'a2', 'At the airport'),
    (3, 'The departure gate changed to gate 18.', 'a2', 'At the airport'), (4, 'My carry-on bag fits under the seat.', 'a2', 'At the airport'),
    (5, 'Our flight is delayed because of the weather.', 'a2', 'At the airport'), (6, 'Could I have an aisle seat, please?', 'a2', 'At the airport'),
    (7, 'The grocery store closes at nine.', 'a2', 'Shopping'), (8, 'Can I have the receipt, please?', 'a2', 'Shopping'),
    (9, 'These shoes are on sale today.', 'a2', 'Shopping'), (10, 'The fitting room is near the coats.', 'a2', 'Shopping'),
    (11, 'Can I pay by card?', 'a2', 'Shopping'), (12, 'Sorry, that size is out of stock.', 'b1', 'Shopping'),
    (13, 'The first item on the agenda is the budget.', 'b1', 'Work meeting'), (14, 'The deadline for the report is Thursday.', 'b1', 'Work meeting'),
    (15, 'Please take notes during the call.', 'a2', 'Work meeting'), (16, 'I will follow up with the client tomorrow.', 'b1', 'Work meeting'),
    (17, 'Are you available for a meeting at three?', 'a2', 'Work meeting'), (18, 'Could you repeat that more slowly?', 'a2', 'Work meeting'),
    (19, 'This assignment is due on Monday.', 'a2', 'Classroom'), (20, 'We take an exam at the end of term.', 'a2', 'Classroom'),
    (21, 'Hand in the assignment before noon.', 'a2', 'Classroom'), (22, 'The teacher explained the grammar rule.', 'a2', 'Classroom'),
    (23, 'Our group project needs three more pictures.', 'b1', 'Classroom'), (24, 'Look up the word in a dictionary.', 'a2', 'Classroom'),
    (25, 'The security check is straight ahead.', 'a2', 'At the airport'), (26, 'I would like to change my seat.', 'a2', 'At the airport'),
    (27, 'Here is your change and your receipt.', 'a2', 'Shopping'), (28, 'Please pay at the cash register.', 'a2', 'Shopping'),
    (29, 'Point out the main problem clearly.', 'b1', 'Work meeting'), (30, 'Let us set up a meeting for next week.', 'b1', 'Work meeting'),
    (31, 'Review these words before tomorrow.', 'a2', 'Classroom'), (32, 'Do not worry if you make a mistake.', 'a2', 'Classroom')
)
INSERT INTO word_examples
  (id, meaning_id, example_text, example_order, difficulty_level, situation_label, status, created_at, updated_at)
SELECT printf('a4000000-0000-4000-8000-%012d', ordinal), printf('a3000000-0000-4000-8000-%012d', ordinal), example_text, 1, level, situation_label, 'active', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'
FROM starter;

WITH starter(ordinal, note_type, note_text) AS (
  VALUES
    (1, 'other', 'Keep your boarding pass ready until you reach your seat.'), (2, 'collocation', 'Check in for a flight, not check in a flight.'),
    (3, 'collocation', 'Use departure gate for leaving flights and arrival gate for incoming flights.'), (4, 'other', 'Carry-on is often written with a hyphen.'),
    (5, 'grammar', 'Use be before delayed: The flight is delayed.'), (6, 'other', 'An aisle seat is next to the walkway, not the window.'),
    (7, 'other', 'In British English, grocery store is often called supermarket.'), (8, 'other', 'A receipt can be printed or sent by email.'),
    (9, 'collocation', 'Items are on sale; people do not usually say in sale.'), (10, 'other', 'Also called a changing room in British English.'),
    (11, 'collocation', 'Say pay by card in this expression.'), (12, 'grammar', 'Use out of stock after be: It is out of stock.'),
    (13, 'other', 'An agenda is usually shared before a formal meeting.'), (14, 'collocation', 'Meet a deadline means finish by the required time.'),
    (15, 'collocation', 'Take notes is common in American English.'), (16, 'grammar', 'Follow up can be followed by with and a person or topic.'),
    (17, 'collocation', 'Be available for a meeting or available at a time.'), (18, 'register', 'Could you is polite for requests at work and school.'),
    (19, 'collocation', 'Assignments are usually due on a particular day.'), (20, 'other', 'Some systems say sit an exam instead.'),
    (21, 'grammar', 'Hand in is separable: hand in your work or hand it in.'), (22, 'collocation', 'Explain something to someone, not explain someone.'),
    (23, 'other', 'A group project needs clear roles and communication.'), (24, 'grammar', 'Look up is separable: look up a word or look it up.'),
    (25, 'other', 'Airport signs may also say security screening.'), (26, 'register', 'Use I would like to in polite service situations.'),
    (27, 'common_mistake', 'Here, change means returned money, not making something different.'), (28, 'other', 'Cashier is the person who works at the cash register.'),
    (29, 'grammar', 'Point out is separable: point out the problem or point it out.'), (30, 'grammar', 'Set up is separable: set up a meeting or set it up.'),
    (31, 'collocation', 'Review notes, vocabulary, or a lesson before a test.'), (32, 'other', 'Make a mistake is a normal phrase for an error.')
)
INSERT INTO usage_notes
  (id, meaning_id, note_type, note_text, note_order, status, created_at, updated_at)
SELECT printf('a5000000-0000-4000-8000-%012d', ordinal), printf('a3000000-0000-4000-8000-%012d', ordinal), note_type, note_text, 1, 'active', '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'
FROM starter;

WITH starter(ordinal, part_of_speech, short_definition, learner_definition, level) AS (
  VALUES
    (17, 'adjective', 'free and ready to be used or chosen', 'Tell the team when you are available.', 'a2'),
    (18, 'phrase', 'a polite request to hear something again', 'Say this when you did not hear clearly.', 'a2'),
    (19, 'noun', 'a piece of work a teacher asks you to do', 'Start the assignment before the weekend.', 'a2'),
    (20, 'phrase', 'to do an official test at school or college', 'Students take an exam at the end of a course.', 'a2'),
    (21, 'phrasal_verb', 'to give work to a teacher or person in charge', 'Hand in your work before class ends.', 'a2'),
    (22, 'verb', 'to make an idea clear by giving details', 'Can you explain this word again?', 'a2'),
    (23, 'phrase', 'a task completed by several students together', 'Our group project is due on Friday.', 'b1'),
    (24, 'phrasal_verb', 'to search for information in a book or online', 'Look up a new word after class.', 'a2'),
    (25, 'phrase', 'a place where people and bags are checked for safety', 'Follow the airport signs to the security check.', 'a2'),
    (26, 'phrase', 'a polite way to say what you want', 'I would like to change my seat.', 'a2'),
    (27, 'noun', 'money returned after you pay too much', 'Check that your change is correct.', 'a2'),
    (28, 'phrase', 'the machine or place where a shop takes payment', 'Pay for your items at the cash register.', 'a2'),
    (29, 'phrasal_verb', 'to show someone something important', 'Mina pointed out a useful detail.', 'b1'),
    (30, 'phrasal_verb', 'to arrange or prepare something', 'Set up a short meeting for tomorrow.', 'b1'),
    (31, 'verb', 'to study something again to remember it', 'Review your notes before the test.', 'a2'),
    (32, 'phrase', 'to do something incorrectly', 'It is normal to make a mistake while learning.', 'a2')
)
INSERT INTO word_meanings
  (id, word_id, part_of_speech, short_definition, learner_definition, meaning_order, status, difficulty_level, created_at, updated_at)
SELECT
  printf('a3000000-0000-4000-8000-%012d', ordinal),
  printf('a2000000-0000-4000-8000-%012d', ordinal),
  part_of_speech, short_definition, learner_definition, 1, 'active', level,
  '2026-08-22T00:00:00.000Z', '2026-08-22T00:00:00.000Z'
FROM starter;
