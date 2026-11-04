# Albion House voice lines

Nothing is recorded yet. Every line is silent until you set its `src` in `voice.js` (for example `voice/ash_problem.m4a`, a path relative to `spy/`). Lines marked **subtitled** show their text on screen whether or not audio exists. Voice obeys the sound toggle.

The broadcaster, Thamesmouth Wireless News, is invented.

| Line id | Speaker | Where it plays | Text |
|---|---|---|---|
| `ash_problem` | Ash | Opening cutscene, Ash on the phone | Chief, we have a problem. |
| `pm_keep_safe` | Eleanor Hale | Day 1 cutscene at No.10 | Keep Britain safe, C. And keep it out of the papers. |
| `ash_green_ours` | Ash | Day 3 opening cutscene | The woman in green isn’t one of theirs, C. She’s ours. |
| `call_pm1` | Eleanor Hale | Day 1 No.10 call, on answering | C. The Varenian ambassador is at the Foreign Office shouting about a British spy. I can tell the House we’ve never heard of them, or stand by them and take the heat. Your call. |
| `call_hale2` | Eleanor Hale | Day 2/3 No.10 call about Tom Archer | C, the Varenian ambassador has asked me about a man called Tom Archer. Is he one of yours? |
| `call_deal` | Eleanor Hale | Day 3 No.10 call: the deal | C, Kesk’s people have offered a deal. Leave her there, and the talks go ahead. |
| `call_kesk` | Colonel Kesk | Kesk rings the desk | Good evening, C. We have never spoken. Let us keep it that way, after tonight. |
| `kesk_letter_0` | Colonel Kesk | Day 3 start: Kesk letter | Kesk’s first letter, read aloud. |
| `kesk_letter_1` | Colonel Kesk | Day 3: Kesk letter with hidden ink | Kesk’s second letter, read aloud. |
| `kesk_letter_3` | Colonel Kesk | Day 3 late: Kesk letter | Kesk’s last letter, read aloud. |
| `bulletin_day1` | Thamesmouth Wireless News | Day 1 front page (subtitled) | Thamesmouth Wireless News, midnight. A man has collapsed on a bench in Bath. Police have sealed off the street, and Downing Street says it is monitoring events. |
| `bulletin_day2_win` | Thamesmouth Wireless News | Day 2 front page, team caught (subtitled) | Thamesmouth Wireless News. Three people were held at Harwich tonight in a late police operation. Officials will not say why. |
| `bulletin_day2_lose` | Thamesmouth Wireless News | Day 2 front page, team escaped (subtitled) | Thamesmouth Wireless News. Police now fear the three people wanted over the Bath collapse have left the country. |
| `bulletin_end_win` | Thamesmouth Wireless News | Ending: she gets out (subtitled) | Thamesmouth Wireless News. A woman described only as a British national has landed at an airfield in Oxfordshire. Whitehall says nothing at all. |
| `bulletin_end_mixed` | Thamesmouth Wireless News | Ending: partial (subtitled) | Thamesmouth Wireless News. Confused reports from the Varenian border tonight. London neither confirms nor denies a British operation. |
| `bulletin_end_loss` | Thamesmouth Wireless News | Ending: she is caught (subtitled) | Thamesmouth Wireless News. The Varenian Republic has paraded a woman it calls a British spy. The Foreign Office is seeking urgent clarification. |

The phone calls and Kesk letters change with the player’s earlier choices; the text above is the core line, and the full wording is whatever is on screen in `desk.js` and `day3.js` (letterText). Record the core line, or one take per variant and add ids.
