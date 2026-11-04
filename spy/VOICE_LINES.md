# Albion House voice lines

All lines are recorded (Chatterbox, cloning our own Kokoro reference voices) in `audio/voice/*.mp3`.

The opening cutscene shows the narrator lines as captions. If a clip runs longer than its shot, the shot holds until the clip finishes, so you can record at a natural pace.

Colonel Kesk reads his letters in a cold, measured voice, unhurried and faintly amused. The on-screen letters add sentences that change with the player's choices. The voiced lines cover only the parts every player sees.

The broadcaster, Thamesmouth Wireless News, is invented.

| Line id | Speaker | Where it plays | Text |
|---|---|---|---|
| `nar_open_1` | Narrator (deep, gravelly older British male, unhurried) | Opening, rain on the Thames as Big Ben strikes midnight (0:00.6) | You are C. As of tonight, you run His Majesty's most secret service. |
| `nar_open_2` | Narrator | Opening, the cab pulls up at Albion House (about 0:08) | Nobody voted for you. Almost nobody knows your name. |
| `nar_open_3` | Narrator | Opening, same cab shot (about 0:14) | Your first day was meant to begin tomorrow. |
| `nar_open_4` | Narrator | Opening, the desk phone; it rings after the line (about 0:17.7) | Then, at midnight... the telephone rang. |
| `ash_problem` | Ash | Opening cutscene, Ash on the phone | Chief, we have a problem. |
| `pm_keep_safe` | Eleanor Hale | Day 1 cutscene at No.10 | Keep Britain safe, C. And keep it out of the papers. |
| `ash_green_ours` | Ash | Day 3 opening cutscene | The woman in green isn’t one of theirs, C. She’s ours. |
| `call_pm1` | Eleanor Hale | Day 1 No.10 call, on answering | C. The Varenian ambassador is at the Foreign Office shouting about a British spy. I can tell the House we’ve never heard of them, or stand by them and take the heat. Your call. |
| `call_hale2` | Eleanor Hale | Day 2/3 No.10 call about Tom Archer | C, the Varenian ambassador has asked me about a man called Tom Archer. Is he one of yours? |
| `call_deal` | Eleanor Hale | Day 3 No.10 call: the deal | C, Kesk’s people have offered a deal. Leave her there, and the talks go ahead. |
| `call_kesk` | Colonel Kesk | Kesk rings the desk | Good evening, C. We have never spoken. Let us keep it that way, after tonight. |
| `kesk_letter_0` | Colonel Kesk | Day 3 start: Kesk letter | My dear C. Welcome to Friday. You have something of mine in York, I think. Or rather, you are about to go and look for it. K. |
| `kesk_letter_1` | Colonel Kesk | Day 3: Kesk letter with hidden ink | My dear C. I have been watching how you work. I know your habits now, and I have made my arrangements. K. |
| `kesk_letter_3` | Colonel Kesk | Day 3 late: Kesk letter | My dear C. Tonight you will try to take something that belongs to the Republic. I will be at the border myself. Bring a warm coat. Green, perhaps. K. |
| `bulletin_day1` | Thamesmouth Wireless News | Day 1 front page (subtitled) | Thamesmouth Wireless News, midnight. A man has collapsed on a bench in Bath. Police have sealed off the street, and Downing Street says it is monitoring events. |
| `bulletin_day2_win` | Thamesmouth Wireless News | Day 2 front page, team caught (subtitled) | Thamesmouth Wireless News. Three people were held at Harwich tonight in a late police operation. Officials will not say why. |
| `bulletin_day2_lose` | Thamesmouth Wireless News | Day 2 front page, team escaped (subtitled) | Thamesmouth Wireless News. Police now fear the three people wanted over the Bath collapse have left the country. |
| `bulletin_end_win` | Thamesmouth Wireless News | Ending: she gets out (subtitled) | Thamesmouth Wireless News. A woman described only as a British national has landed at an airfield in Oxfordshire. Whitehall says nothing at all. |
| `bulletin_end_mixed` | Thamesmouth Wireless News | Ending: partial (subtitled) | Thamesmouth Wireless News. Confused reports from the Varenian border tonight. London neither confirms nor denies a British operation. |
| `bulletin_end_loss` | Thamesmouth Wireless News | Ending: she is caught (subtitled) | Thamesmouth Wireless News. The Varenian Republic has paraded a woman it calls a British spy. The Foreign Office is seeking urgent clarification. |

The phone calls and Kesk letters change with the player’s earlier choices; the text above is the core line, and the full wording is whatever is on screen in `desk.js` and `day3.js` (letterText). Record the core line, or one take per variant and add ids.


## Act 2 additions

| Line id | Speaker | Text |
|---|---|---|
| `op_macrae_pos` | linnet | Linnet. In position. Nice and quiet. |
| `op_macrae_eyes` | linnet | Eyes on. That's her, the one by the window. |
| `op_macrae_lost` | linnet | I've lost her. Give me a minute. |
| `op_macrae_ask` | linnet | C, it's getting crowded. I need a decision. |
| `op_macrae_push` | linnet | Right. Going now. |
| `op_macrae_hold` | linnet | Holding. Patience, then. |
| `op_macrae_abort` | linnet | Pulling out. Coming home the long way. |
| `op_macrae_done` | linnet | It's done, C. Clean as a whistle. |
| `op_macrae_hurt` | linnet | It's gone wrong, C. I'm out, but only just. |
| `op_macrae_send1` | linnet | On it, C. |
| `op_macrae_send2` | linnet | Leave it with me. |
| `op_macrae_send3` | linnet | Aye. I'll handle it. |
| `op_pryce_pos` | wren | Wren here. In position. Nobody's looked twice. |
| `op_pryce_eyes` | wren | Eyes on. Two men, a parked car. |
| `op_pryce_lost` | wren | Lost them. Sorry, C. Working back. |
| `op_pryce_ask` | wren | They're getting twitchy, C. Your call. |
| `op_pryce_push` | wren | Understood. Going in. |
| `op_pryce_hold` | wren | Holding. I can wait all night. |
| `op_pryce_abort` | wren | Pulling out. Nobody saw a thing. |
| `op_pryce_done` | wren | Job done, C. Not a whisper. |
| `op_pryce_hurt` | wren | Bad news, C. I'm hurt. Not badly. Getting clear. |
| `op_pryce_send1` | wren | Right you are, C. |
| `op_pryce_send2` | wren | I'll be a shadow. |
| `op_pryce_send3` | wren | Leave it to me, C. |
| `op_hartley_pos` | harrier | Harrier. In position. Ready when you are. |
| `op_hartley_eyes` | harrier | Contact. Eyes on the target. |
| `op_hartley_lost` | harrier | I've lost him. Damn it. |
| `op_hartley_ask` | harrier | C, it's on a knife edge. Push or pull me out? |
| `op_hartley_push` | harrier | Going now. Hard. |
| `op_hartley_hold` | harrier | Holding. Don't like it, but holding. |
| `op_hartley_abort` | harrier | Pulling out. Back the long way. |
| `op_hartley_done` | harrier | Done. We've got it, C. |
| `op_hartley_hurt` | harrier | I'm hit, C. It's not bad. Getting out. |
| `op_hartley_send1` | harrier | On it, C. |
| `op_hartley_send2` | harrier | Say no more. |
| `op_hartley_send3` | harrier | I'll get it done. |
| `bulletin_end_traded` | news | Thamesmouth Wireless News. A British lorry driver held in Varenia is home tonight. In Kessgrad, trade talks open on Monday as planned. |


## Act 2 (Days 4–6)

| id | who | line |
|---|---|---|
| ash_d4_open | Ash | Chief. A letter came for you this morning. Hand delivered. To this address. |
| kesk_d4_letter | Colonel Kesk | My dear C. Such a handsome building. I have always wanted to see where you work. Now I have. Someone of yours was kind enough to show me. K. |
| call_pm_d4 | Eleanor Hale | C, there's a Varenian trade delegation in Manchester, and the Chancellor wants that deal. Whatever you're doing near them, be careful. |
| bulletin_day4 | Thamesmouth Wireless News | Thamesmouth Wireless News. A Varenian trade delegation has cut short its visit to Manchester. Officials describe the talks as cordial. |
| ash_d5_open | Ash | They've taken one of ours, Chief. At the airport in Kessgrad, this morning. |
| kesk_d5_call | Colonel Kesk | Good morning, C. I have your friend. You have mine. Let us meet on the bridge at dawn, like civilised men. |
| call_pm_d5 | Eleanor Hale | C. I want our officer home, and I want it quiet. No headlines, no heroics. Can you do that? |
| bulletin_day5_win | Thamesmouth Wireless News | Thamesmouth Wireless News. A British citizen detained in Varenia has been released. The Foreign Office called it a humanitarian gesture. |
| bulletin_day5_lose | Thamesmouth Wireless News | Thamesmouth Wireless News. Varenia says a British national will stand trial in Kessgrad. Downing Street has made no comment. |
| ash_d6_open | Ash | He's here, Chief. Kesk is in London. He landed an hour ago, under another name. |
| kesk_d6_letter | Colonel Kesk | My dear C. I am in your city. Rain, buses, very good tea. Come and find me before Friday, or I shall find you. K. |
| call_pm_d6 | Eleanor Hale | C. Kesk is in London, and the Foreign Secretary knows. Bring me something by tonight, or bring me your resignation. |
| kesk_d6_final | Colonel Kesk | Well played, C. Or nearly. I shall see you again. |
| bulletin_a2_knight | Thamesmouth Wireless News | Thamesmouth Wireless News. A senior civil servant has been quietly honoured tonight. No reason was given, and none is expected. |
| bulletin_a2_quiet | Thamesmouth Wireless News | Thamesmouth Wireless News. A Varenian diplomat has left London at short notice. The embassy calls it a routine rotation. |
| bulletin_a2_scandal | Thamesmouth Wireless News | Thamesmouth Wireless News. Questions in the House tonight over a foreign intelligence officer seen in Westminster. Ministers say they were not told. |
| bulletin_a2_resign | Thamesmouth Wireless News | Thamesmouth Wireless News. The head of a little known government department has resigned with immediate effect. Downing Street thanked them for their service. |
| op_macrae_freed | Linnet | I knew you'd come, C. I knew it. |
| op_pryce_freed | Wren | Took your time, C. Thank you. |
| op_hartley_freed | Harrier | You came. Course you did. |
