/* Static plan data: trackable items, schedule reference, categories. */

export const ITEMS = {
  office: [
    { id: 'o-strength', cat: 'TRAIN', days: [1], time: '6:00-6:45', ti: 'Home strength - 30 min', no: 'Cable station, upper body. Light - basketball tonight.', s: '06:00', e: '06:45' },
    { id: 'o-gym', cat: 'TRAIN', days: [3, 4], time: '6:30-7:30', ti: 'Gym - 1 hr strength', no: 'Wed: lower + core. Thu: upper push/pull.', s: '06:15', e: '07:30' },
    { id: 'o-audio', cat: 'LEARN', days: null, time: '8:00-9:00', ti: 'Commute Audio University', no: 'Business/investing/AI podcast or audiobook.', s: '08:00', e: '09:00' },
    { id: 'o-read', cat: 'READ', days: null, time: '12:40-1:00', ti: 'Reading - 20 min', no: 'Business/investing book rotation.', s: '12:40', e: '13:00' },
    { id: 'o-email', cat: 'WORK', days: null, time: 'ALL DAY', ti: 'Email in 2 batches only', no: '12:00 + 4:00 passes. Teams max 3 checks.', s: null, e: null },
    { id: 'o-chome', cat: 'FAMILY', days: null, time: '5:00-6:00', ti: 'Commute home = family / decompress', no: 'Call family or silence. Zero work.', s: '17:00', e: '18:00' },
    { id: 'o-dinner', cat: 'FAMILY', days: null, time: '6:00-7:30', ti: 'Family dinner - phone away', no: 'Vikranth window.', s: '18:00', e: '19:30' },
    { id: 'o-ball', cat: 'TRAIN', days: [1], time: '8:00-11:00', ti: 'Basketball night', no: 'VO2 max engine. Hydrate. No late snacks.', s: '20:00', e: '23:00' },
    { id: 'o-fin', cat: 'LEARN', days: [3], time: '7:30-8:15', ti: 'Finance - $5k deploy', no: 'Deploy tranche + research.', s: '19:30', e: '20:15' },
    { id: 'o-study', cat: 'LEARN', days: [3], time: '8:15-9:15', ti: 'Investing/business study hour', no: 'Earnings, valuation, deep-dive.', s: '20:15', e: '21:15' },
    { id: 'o-tm', cat: 'LEARN', days: [4], time: '7:30-8:15', ti: 'Toastmasters / Spoken Craft', no: 'Table Topics rep, story rep, log streak.', s: '19:30', e: '20:15' },
    { id: 'o-ai', cat: 'LEARN', days: [4], time: '8:15-9:15', ti: 'AI build hour', no: 'JARVIS / Second Brain. One named task.', s: '20:15', e: '21:15' },
    { id: 'o-sleep', cat: 'SLEEP', days: [3, 4], time: '9:45 PM', ti: 'Screens off 9:45 - sleep 10:00', no: 'Bank ~8 hrs on non-ball nights.', s: '21:45', e: '22:00' },
    { id: 'o-sleepball', cat: 'SLEEP', days: [1], time: '11:30 PM', ti: 'Straight to sleep after ball', no: 'Lights out 11:30. No scrolling.', s: '23:00', e: '23:30' }
  ],
  wfh: [
    { id: 'w-gym', cat: 'TRAIN', days: [2, 4], time: '6:30-7:30', ti: 'Gym - 1 hr strength', no: 'Tue: full body (check Whoop). Thu: upper.', s: '06:15', e: '07:30' },
    { id: 'w-mob', cat: 'TRAIN', days: [5], time: '6:30-7:00', ti: 'Mobility + core - 30 min', no: 'Game day. Save the legs.', s: '06:30', e: '07:00' },
    { id: 'w-deep', cat: 'LEARN', days: [5], time: '7:00-8:00', ti: 'Deep learning hour', no: 'AI / business / investing rotation.', s: '07:00', e: '08:00' },
    { id: 'w-read', cat: 'READ', days: null, time: '12:40-1:00', ti: 'Reading - 20 min', no: 'Business/investing book rotation.', s: '12:40', e: '13:00' },
    { id: 'w-laptop', cat: 'WORK', days: null, time: '5:00 PM', ti: 'Laptop closed at 5', no: 'No evening bleed.', s: '16:50', e: '17:10' },
    { id: 'w-walk', cat: 'TRAIN', days: null, time: '5:00-5:30', ti: 'Steps walk - 30 min', no: 'Stroller + Vikranth. 7,000+ steps.', s: '17:00', e: '17:30' },
    { id: 'w-dinner', cat: 'FAMILY', days: null, time: '5:30-7:30', ti: 'Family dinner', no: 'Longest family window of the week.', s: '17:30', e: '19:30' },
    { id: 'w-craft', cat: 'LEARN', days: [2], time: '7:30-8:15', ti: 'Spoken Craft drills', no: 'Table Topics (PREP), story rep.', s: '19:30', e: '20:15' },
    { id: 'w-tm', cat: 'LEARN', days: [4], time: '7:30-8:15', ti: 'Toastmasters prep', no: 'Speech work, evaluations, timing.', s: '19:30', e: '20:15' },
    { id: 'w-ai', cat: 'LEARN', days: [2, 4], time: '8:15-9:15', ti: 'AI build hour', no: 'JARVIS / Second Brain. One named task.', s: '20:15', e: '21:15' },
    { id: 'w-ball', cat: 'TRAIN', days: [5], time: '8:00-11:00', ti: 'Basketball night', no: 'Saturday sleeps in for you.', s: '20:00', e: '23:00' },
    { id: 'w-sleep', cat: 'SLEEP', days: [2, 4], time: '9:45 PM', ti: 'Screens off 9:45 - sleep 10:00', no: 'Tomorrow depends on tonight.', s: '21:45', e: '22:00' },
    { id: 'w-sleepball', cat: 'SLEEP', days: [5], time: '11:30 PM', ti: 'Straight to sleep after ball', no: 'Lights out 11:30.', s: '23:00', e: '23:30' }
  ],
  off: [
    { id: 'f-box', cat: 'TRAIN', days: [6], time: '9:00-10:00', ti: 'Boxing + cable circuit', no: 'Heavy bag + cable. Strength touch #5.', s: '09:00', e: '10:00' },
    { id: 'f-recov', cat: 'TRAIN', days: [0], time: '9:00-10:00', ti: 'Mobility + long family walk', no: 'Stretch, foam roll, stroller walk.', s: '09:00', e: '10:00' },
    { id: 'f-ai', cat: 'LEARN', days: [6], time: '10:30-12:30', ti: 'Protected AI build - 2 hrs', no: 'JARVIS milestone. Uninterrupted.', s: '10:30', e: '12:30' },
    { id: 'f-invest', cat: 'LEARN', days: [6], time: '1:00-2:30', ti: 'Investing review + study', no: '45 min review + 45 min study.', s: '13:00', e: '14:30' },
    { id: 'f-play', cat: 'FAMILY', days: null, time: '2:30-6:00', ti: 'Family play - no laptop', no: 'Park, errands, VR cricket.', s: '14:30', e: '18:00' },
    { id: 'f-read', cat: 'READ', days: null, time: 'ANY TIME', ti: 'Reading - 20 min', no: 'Keep the daily streak on off days too.', s: null, e: null },
    { id: 'f-learn', cat: 'LEARN', days: null, time: '6:30-7:00', ti: 'Light learn - read or listen', no: 'Low effort, high compound.', s: '18:30', e: '19:00' },
    { id: 'f-preview', cat: 'WORK', days: [0], time: '7:30-7:45', ti: '15-min week preview', no: 'Confirm office/WFH days. Top 3 for Monday.', s: '19:30', e: '19:45' },
    { id: 'f-sleep', cat: 'SLEEP', days: null, time: '9:45 PM', ti: 'Screens off 9:45 - sleep 10:00', no: 'Especially Sunday.', s: '21:45', e: '22:00' }
  ]
};

export const CATS = ['TRAIN', 'LEARN', 'READ', 'FAMILY', 'WORK', 'SLEEP'];

/* Validated for the dark glass surface (#141826): OKLCH L 0.48-0.67,
   chroma >= 0.1, adjacent-pair CVD dE >= 12, contrast >= 3:1. */
export const CAT_COLORS = {
  TRAIN: '#16a34a',
  LEARN: '#3b82f6',
  READ: '#d97706',
  FAMILY: '#a855f7',
  WORK: '#ea580c',
  SLEEP: '#6366f1'
};

/* Read-only full-day schedule shown on the SCHEDULE tab. */
export const SCHEDULE_REF = {
  office: [
    ['6:00-6:45', 'MON: Home strength - 30 min', 'Cable circuit, light. Ball tonight is the main event.'],
    ['6:15-7:30', 'WED/THU: Gym - 1 hr strength', 'Wed lower+core. Thu upper. Whoop age 41 to 34 happens here.'],
    ['7:30-8:00', 'Shower / breakfast / Vikranth', 'Protein-first, no sugar. Out by 8.'],
    ['8:00-9:00', 'Commute in - Audio University', 'Acquired, Invest Like the Best, All-In, Dwarkesh, We Study Billionaires.'],
    ['9:00-11:00', 'Standups - all 4 teams', 'SFMC / Data Cloud / CMS / Hydration. Teams check #1.'],
    ['11:00-12:00', 'Post-standup + deep work #1', 'Unblock, Jira, stories, release planning.'],
    ['12:00-12:40', 'Lunch + email batch 1', 'Clean lunch. Teams check #2.'],
    ['12:40-1:00', 'Reading - 20 min', 'Business/investing rotation. Calendar-blocked.'],
    ['1:00-4:00', 'Meetings + deep work #2', 'Stakeholders, UDP alignment, whiteboarding.'],
    ['4:00-4:50', 'Email batch 2 + EOD wrap', 'Teams check #3. Tomorrow top 3. Leave by 5.'],
    ['5:00-6:00', 'Commute home', 'Family call or decompress. Arrive as Dad, not Manager.'],
    ['6:00-7:30', 'Family + dinner', 'Vikranth window. Phone away.'],
    ['7:30-8:15', 'WED: $5k deploy / THU: Toastmasters', 'Deploy + research; or Table Topics + story rep.'],
    ['8:15-9:15', 'WED: study hour / THU: AI build', 'Earnings + valuation; or JARVIS task.'],
    ['8:00-11:00', 'MON: Basketball night', 'VO2 engine. Hydrate. No late snacks.'],
    ['9:45 PM', 'WED/THU: screens off, sleep 10', '~8 hrs on non-ball nights.'],
    ['11:30 PM', 'MON: sleep right after ball', '~6.5h. Tue gym auto-regulates by Whoop.']
  ],
  wfh: [
    ['6:15-7:30', 'TUE/THU: Gym - 1 hr strength', 'Tue full body (check recovery). Thu upper.'],
    ['6:30-7:00', 'FRI: Mobility + core', 'Save the legs - ball tonight.'],
    ['7:00-8:00', 'FRI: Deep learning hour', 'Freshest hour of the week. AI / business / investing.'],
    ['7:30-8:30', 'Slow morning + Vikranth', 'No commute = best morning of the week.'],
    ['8:30-12:00', 'Work - standups + deep work', 'Standups 9-11 from home.'],
    ['12:00-12:40', 'Lunch + email batch 1', 'At the table, not the desk.'],
    ['12:40-1:00', 'Reading - 20 min', 'Same slot every day.'],
    ['1:00-4:00', 'Meetings + deep work #2', 'Fri: EOW review + next-week plan.'],
    ['4:00-5:00', 'Email batch 2 + EOD', 'Laptop CLOSES at 5.'],
    ['5:00-5:30', 'Steps walk - 30 min', 'Stroller + Vikranth. Replaces commute steps.'],
    ['5:30-7:30', 'Family + dinner', 'Longest family window.'],
    ['7:30-8:15', 'TUE: Spoken Craft / THU: Toastmasters', 'Drills, story rep, self-review.'],
    ['8:15-9:15', 'TUE/THU: AI build hour', 'One named task.'],
    ['8:00-11:00', 'FRI: Basketball night', 'Saturday sleeps in for you.'],
    ['9:45 PM', 'TUE/THU: screens off, sleep 10', 'Tomorrow depends on tonight.'],
    ['11:30 PM', 'FRI: sleep after ball', 'Rest day absorbs it.']
  ],
  off: [
    ['7:30-8:30', 'SAT: sleep in, slow morning', 'Recovery from Friday ball. No agenda.'],
    ['6:45-8:00', 'SUN: sleep in to 6:45-7', 'Recovery score sets the week.'],
    ['9:00-10:00', 'SAT: boxing + cable / SUN: mobility + walk', 'Strength #5 or active recovery.'],
    ['10:30-12:30', 'SAT: protected AI build - 2 hrs', 'Month-6 deliverable engine.'],
    ['1:00-2:30', 'SAT: investing review + study', '45m review + 45m study.'],
    ['2:30-6:00', 'Family play - no laptop', 'Park, errands, VR cricket. The point.'],
    ['6:30-7:00', 'Light learn', 'Read or listen. Low effort, high compound.'],
    ['7:30-7:45', 'SUN: 15-min week preview', 'Office/WFH days + Monday top 3. Then close it.'],
    ['9:45 PM', 'Screens off, sleep 10:00', 'Sunday especially - Monday is office + ball.'],
    ['', 'OFF-DAY RULES', 'No manager work. No coding Sunday. No investing Sunday. Holidays = Sunday template.']
  ]
};
