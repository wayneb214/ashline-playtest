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

## Panel build lines (Nov 2026)

All made with Chatterbox performing our own invented Kokoro reference voices; every take checked by automatic transcription. C never speaks. Files: `audio/voice/<id>.mp3`.

| id | voice | line |
|---|---|---|
| `cine_day1_1` | Narrator (opening narrator voice) | Wednesday. 07:10. Downing Street. |
| `cine_day2_1` | Narrator (opening narrator voice) | Thursday. Vass is alive. |
| `cine_day2_2` | Narrator (opening narrator voice) | Three suspects. One night to stop them leaving. |
| `cine_day3_1` | Narrator (opening narrator voice) | Friday. York. |
| `cine_bath_1` | Narrator (opening narrator voice) | 23:47. Bath. |
| `cine_bath_2` | Narrator (opening narrator voice) | A man collapses on a bench near the Circus. |
| `cine_bath_3` | Narrator (opening narrator voice) | He is one of ours. |
| `cine_ferry_1` | Narrator (opening narrator voice) | Harwich. 23:10. The night ferry. |
| `cine_ferry_win` | Narrator (opening narrator voice) | Plain clothes at the gangway. Now. |
| `cine_ferry_mixed` | Narrator (opening narrator voice) | One taken at the services. Two still aboard. |
| `cine_ferry_loss` | Narrator (opening narrator voice) | The ferry clears the harbour wall. |
| `cine_border_1` | Narrator (opening narrator voice) | The Varenian border. A queue of cars in the dark. |
| `cine_border_2` | Narrator (opening narrator voice) | She is in the boot, under a picnic blanket. |
| `cine_border_3` | Narrator (opening narrator voice) | A guard. A dog. |
| `cine_end3_win_1` | Narrator (opening narrator voice) | Pine forest. Our side of the line. |
| `cine_end3_win_2` | Narrator (opening narrator voice) | She asks for a cup of tea. |
| `cine_end3_mixed_1` | Narrator (opening narrator voice) | She’s out. One of ours isn’t. |
| `cine_end3_mixed_2` | Narrator (opening narrator voice) | Kesk will want a trade. |
| `cine_end3_loss_1` | Narrator (opening narrator voice) | The barrier. A grey car. Gone. |
| `cine_end3_loss_2` | Narrator (opening narrator voice) | Kesk wins this round. |
| `cine_end3_traded_1` | Narrator (opening narrator voice) | A deal is a deal. |
| `cine_end3_traded_2` | Narrator (opening narrator voice) | Nobody mentions a woman in green. |
| `cine_day4_1` | Narrator (opening narrator voice) | Tuesday. Albion House. |
| `cine_day5_1` | Narrator (opening narrator voice) | Wednesday. 06:40. |
| `cine_bridge_1` | Narrator (opening narrator voice) | 05:40. The Vell bridge. Fog on the water. |
| `cine_bridge_2` | Narrator (opening narrator voice) | Two cars. One each end. Nobody wants to go first. |
| `cine_day6_1` | Narrator (opening narrator voice) | Thursday. London. Rain. |
| `cine_end6_knight` | Narrator (opening narrator voice) | Knighted in silence. |
| `cine_end6_quiet` | Narrator (opening narrator voice) | A quiet Tuesday. |
| `cine_end6_scandal` | Narrator (opening narrator voice) | On the front page. |
| `cine_end6_resign` | Narrator (opening narrator voice) | Resignation by Friday. |
| `call_panic_macrae` | Fiona Macrae (Linnet) | C? It’s Fiona. There’s a grey car outside the hotel. The same one as this morning. I think I’m blown. Do I run? |
| `react_panic_sit_macrae` | Fiona Macrae (Linnet) | Right. Fine. |
| `call_panic_pryce` | Gareth Pryce (Wren) | C? It’s Gareth. There’s a grey car outside the hotel. The same one as this morning. I think I’m blown. Do I run? |
| `react_panic_sit_pryce` | Gareth Pryce (Wren) | Right. Fine. |
| `call_panic_hartley` | Tom Hartley (Harrier) | C? It’s Tom. There’s a grey car outside the hotel. The same one as this morning. I think I’m blown. Do I run? |
| `react_panic_sit_hartley` | Tom Hartley (Harrier) | Right. Fine. |
| `call_panic_ada` | Ada Finch | C? It’s Ada. There’s a grey car outside the hotel. The same one as this morning. I think I’m blown. Do I run? |
| `react_panic_sit_ada` | Ada Finch | Right. Fine. |
| `call_panic_hollis` | Major Tom Hollis | C? It’s Tom. There’s a grey car outside the hotel. The same one as this morning. I think I’m blown. Do I run? |
| `react_panic_sit_hollis` | Major Tom Hollis | Right. Fine. |
| `call_panic_sam` | Sam Bhatt | C? It’s Sam. There’s a grey car outside the hotel. The same one as this morning. I think I’m blown. Do I run? |
| `react_panic_sit_sam` | Sam Bhatt | Right. Fine. |
| `op_macrae_part` | Fiona Macrae (Linnet) | Half a job, C. Better than none. |
| `op_pryce_part` | Gareth Pryce (Wren) | Partly done, C. They saw something. |
| `op_hartley_part` | Tom Hartley (Harrier) | Half of it. Not good enough. |
| `op_ada_part` | Ada Finch | Half of it, C. Not the half we wanted. |
| `op_hollis_part` | Major Tom Hollis | A draw, C. We live to fight another day. |
| `op_sam_part` | Sam Bhatt | Got some of it, C. Not all. |
| `op_ada_pos` | Ada Finch | Ada. In position. Everything’s where the file said. |
| `op_ada_eyes` | Ada Finch | Eyes on. Matches the photograph. |
| `op_ada_lost` | Ada Finch | Lost the target. Checking the side streets. |
| `op_ada_ask` | Ada Finch | C, the numbers have changed. I need a decision. |
| `op_ada_push` | Ada Finch | Understood. Moving in. |
| `op_ada_hold` | Ada Finch | Holding. Noting everything. |
| `op_ada_abort` | Ada Finch | Pulling out. Nothing left behind. |
| `op_ada_done` | Ada Finch | Done, C. Exactly to plan. |
| `op_ada_hurt` | Ada Finch | It went wrong, C. I’m hurt, but I’m clear. |
| `op_ada_send1` | Ada Finch | On it, C. |
| `op_ada_send2` | Ada Finch | I’ll check it twice. |
| `op_ada_send3` | Ada Finch | Leave it with me. |
| `op_ada_freed` | Ada Finch | You came back for me. Thank you, C. |
| `op_hollis_pos` | Major Tom Hollis | Hollis. In position. Lovely evening for it. |
| `op_hollis_eyes` | Major Tom Hollis | Target in sight. Steady now. |
| `op_hollis_lost` | Major Tom Hollis | Lost him. Not to worry. I’ll pick him up. |
| `op_hollis_ask` | Major Tom Hollis | Decision time, C. Push or pull? |
| `op_hollis_push` | Major Tom Hollis | Right. Over the top. |
| `op_hollis_hold` | Major Tom Hollis | Holding. I’ve waited in worse places. |
| `op_hollis_abort` | Major Tom Hollis | Withdrawing. In good order. |
| `op_hollis_done` | Major Tom Hollis | All done, C. Textbook. |
| `op_hollis_hurt` | Major Tom Hollis | Took a knock, C. Nothing a cup of tea won’t fix. |
| `op_hollis_send1` | Major Tom Hollis | Very good, C. |
| `op_hollis_send2` | Major Tom Hollis | Consider it done. |
| `op_hollis_send3` | Major Tom Hollis | Righto. On my way. |
| `op_hollis_freed` | Major Tom Hollis | Knew you wouldn’t leave an old soldier, C. |
| `op_sam_pos` | Sam Bhatt | Sam here. Parked up, engine running. |
| `op_sam_eyes` | Sam Bhatt | Got him. Grey coat, walking fast. |
| `op_sam_lost` | Sam Bhatt | Lost him at the lights. Going round the block. |
| `op_sam_ask` | Sam Bhatt | C, it’s getting tight. Do I go, or do I bail? |
| `op_sam_push` | Sam Bhatt | Hold on to something. Going. |
| `op_sam_hold` | Sam Bhatt | Sitting tight. Engine’s warm. |
| `op_sam_abort` | Sam Bhatt | Bailing out. Back roads home. |
| `op_sam_done` | Sam Bhatt | Sorted, C. Nobody saw a thing. |
| `op_sam_hurt` | Sam Bhatt | Bit of a crash, C. I’m all right. Mostly. |
| `op_sam_send1` | Sam Bhatt | On my way, C. |
| `op_sam_send2` | Sam Bhatt | I know a short cut. |
| `op_sam_send3` | Sam Bhatt | Give me twenty minutes. |
| `op_sam_freed` | Sam Bhatt | About time, C. Who’s driving? |
| `call_pm1` | Eleanor Hale | C. The Varenian ambassador is at the Foreign Office, shouting about a British spy. The Courier has a photograph of one of yours. I can tell the House we’ve never heard of them, or stand by them and take the heat. Your call. |
| `call_hale2` | Eleanor Hale | C. The man on the bench in Bath. The Courier says he was one of ours. Was he? I need to know before I stand up in the House. |
| `call_deal` | Eleanor Hale | C. An offer, through the back door. Colonel Kesk will release Tom Archer, the lorry driver they’ve held for six weeks, if we forget a woman in a green coat. I don’t know who she is, and I don’t want to. Do we have a deal? |
| `call_kesk` | Colonel Kesk | Good evening, C. Is it raining in London? It is snowing here. I will be at the border myself tonight. Bring a warm coat. Green, perhaps. Are you looking forward to it? |
| `kesk_d4_letter` | Colonel Kesk | My dear C. Such a handsome building. I have always wanted to see where you work. Now I have. Someone of yours was kind enough to show me the door. |
| `kesk_d5_call` | Colonel Kesk | Good morning, C. I have your friend. You have mine, or you will by tomorrow. Let us meet on the bridge at dawn, like civilised men. Bring something worth carrying. |
| `react_hale2_truth` | Eleanor Hale | Thank you for not lying to me, C. |
| `react_hale2_deny` | Eleanor Hale | I see. |
| `react_pm_careful` | Eleanor Hale | Good. |
| `react_pm_firm` | Eleanor Hale | Then be quick about it. |
| `react_pm_yes` | Eleanor Hale | I’ll hold you to that, C. |
| `react_pm_honest` | Eleanor Hale | At least you’re honest. |
| `react_pm_tonight` | Eleanor Hale | Midnight, then. |
| `react_pm_letter` | Eleanor Hale | Let’s hope I never need to. |
| `kl0_open` | Colonel Kesk | My dear C. Welcome to Friday. You have something of mine in York, I think. Or rather, you are about to go and look for it. |
| `kl0_upstairs` | Colonel Kesk | Your friend upstairs sends his regards. |
| `kl0_exit_win` | Colonel Kesk | You have my tall friend. I would like him back. |
| `kl0_exit_loss` | Colonel Kesk | My three travellers are home, and thank you for the ferry. |
| `kl_habit_low` | Colonel Kesk | You are a patient man, C. You like the quiet way: a cup of tea, a photograph, a long wait. |
| `kl_habit_med` | Colonel Kesk | You do love your paperwork, C. Warrants, letters, polite men in suits at the front door. |
| `kl_habit_high` | Colonel Kesk | You are a gambler, C. Fast cars, kicked doors, no time for tea. |
| `kl_habit_none` | Colonel Kesk | I can’t make you out yet, C. I will. |
| `kl_counter_low` | Colonel Kesk | So I have told my people to watch the quiet doors. |
| `kl_counter_med` | Colonel Kesk | So I have friends who read your paperwork before you sign it. |
| `kl_counter_high` | Colonel Kesk | So I have put men on every fast road out of town. |
| `ash_case_d1_defector` | Ash | A Grey House clerk wants to come over, Chief. Somebody’s already following her. |
| `ash_case_d1_mole` | Ash | One of our three is talking to the Grey House. Find out who. |
| `ash_case_d1_leak` | Ash | The Courier has one of our reports. The first edition goes at three. |
| `ash_case_d1_sabotage` | Ash | Someone wants to cut a sea cable tonight. Two reports, two places. Pick one. |
| `ash_case_d2_courier` | Ash | A courier at the airport with a diplomatic bag. Two hours to make him talk. |
| `ash_case_d2_safehouse` | Ash | A flat in Bristol, above a launderette. Whatever they left goes on the board. |
| `ash_case_d2_mole2` | Ash | Unfinished business in this building, Chief. Let’s settle it. |
| `ash_case_d2_exit` | Ash | They leave tonight. Link the board right and we can stop them. |
| `ash_case_d3_york` | Ash | York first, Chief. Two watchers saw her house. Only one of them is telling the truth. |
| `ash_case_d3_tail` | Ash | Her plan has to cross London. Shake the watchers before it does. |
| `ash_case_d3_cable` | Ash | A pod on the Kestrel Line, and we can hear Kesk hunting her. |
| `ash_case_d3_exfil` | Ash | This is it, Chief. The Green Coat comes home tonight, or not at all. |
| `ash_case_d4_watch` | Ash | Someone is watching our front door. Find them, and what they saw. |
| `ash_case_d4_manchester` | Ash | One interpreter in Manchester is Grey House. Don’t spoil the Chancellor’s deal. |
| `ash_case_d4_faces` | Ash | Café photos from across the road. Spot who keeps coming back. |
| `ash_case_d4_leak` | Ash | Somebody showed Kesk our door. Time to name them. |
| `ash_case_d5_recon` | Ash | Walk the bridge before dawn, Chief. Count the cars. |
| `ash_case_d5_press` | Ash | The Bugle has our officer’s name. If it runs, the swap is off. |
| `ash_case_d5_proof` | Ash | A postcard from Kessgrad. If it’s in Kesk’s code, our officer is alive. |
| `ash_case_d5_swap` | Ash | Dawn on the bridge. Our officer for his. Nobody blinks first. |
| `ash_case_d6_find` | Ash | Kesk sells tractors now, apparently. Find where he sleeps. |
| `ash_case_d6_chase` | Ash | He’s moving. Put everyone on the ground that suits them. |
| `ash_case_d6_showdown` | Ash | He’s walking into Downing Street, Chief. Get there first. |
| `res_win_1` | Ash | Good work, Chief. |
| `res_win_2` | Ash | That’s one for us. |
| `res_win_3` | Ash | Clean. The Prime Minister will never know how close it was. |
| `res_mixed_1` | Ash | Half a win, Chief. We’ll take it. |
| `res_mixed_2` | Ash | Messy, but it holds. |
| `res_mixed_3` | Ash | Not clean. Not a disaster either. |
| `res_loss_1` | Ash | That one got away from us. |
| `res_loss_2` | Ash | We’ll pay for that tomorrow. |
| `res_loss_3` | Ash | Bad luck, Chief. Or bad judgement. We’ll find out which. |
| `cue_tail` | Ash | Three corners. Watch the mirrors. |
| `cue_cable` | Ash | Gently, Chief. The seabed hears everything. |
| `cue_chase` | Ash | Keep him in sight, all the way to Whitehall. |
| `cue_swap` | Ash | Slow steps. Nobody runs on a bridge. |
| `cue_showdown` | Ash | Last move, Chief. Make it count. |
| `cue_interro` | Ash | Watch how he reacts. Friendly, hard, or bluff. |
| `cue_crunch` | Ash | Two calls at once, Chief, and one team free. Your choice. |
| `cue_exfil` | Ash | Signal, car, checkpoint, barrier. One at a time. |
| `cue_leak` | Ash | Three names. The cleared ones are crossed out. Pick the one who talked. |
| `cue_accuse` | Ash | Look at who was where. Then name them. |
| `mini_lie_win` | Ash | You caught both lies. The York house is ours to read. |
| `mini_lie_mixed` | Ash | One lie caught, one missed. Half the trail is good. |
| `mini_lie_loss` | Ash | We believed the wrong watcher. York will be harder. |
| `int_courier_give0` | The courier | A tall man paid me in Bath. Cash. Very tall. Didn’t give a name. |
| `int_courier_give1` | The courier | They have a ferry tonight. Three berths. Harwich. |
| `int_courier_friendly` | The courier | Tea won’t help you. |
| `int_courier_hard` | The courier | I want my embassy. |
| `int_courier_bluff` | The courier | Your file is empty. I can see it from here. |
| `int_mole2_macrae_give0` | Fiona Macrae (Linnet) | I never met them. I only ever rang a number. |
| `int_mole2_macrae_friendly` | Fiona Macrae (Linnet) | Tea won’t help you. |
| `int_mole2_macrae_hard` | Fiona Macrae (Linnet) | I want a lawyer. |
| `int_mole2_macrae_bluff` | Fiona Macrae (Linnet) | Your file is empty. I can see it from here. |
| `int_mole2_pryce_give0` | Gareth Pryce (Wren) | I never met them. I only ever rang a number. |
| `int_mole2_pryce_friendly` | Gareth Pryce (Wren) | Tea won’t help you. |
| `int_mole2_pryce_hard` | Gareth Pryce (Wren) | I want a lawyer. |
| `int_mole2_pryce_bluff` | Gareth Pryce (Wren) | Your file is empty. I can see it from here. |
| `int_mole2_hartley_give0` | Tom Hartley (Harrier) | I never met them. I only ever rang a number. |
| `int_mole2_hartley_friendly` | Tom Hartley (Harrier) | Tea won’t help you. |
| `int_mole2_hartley_hard` | Tom Hartley (Harrier) | I want a lawyer. |
| `int_mole2_hartley_bluff` | Tom Hartley (Harrier) | Your file is empty. I can see it from here. |
| `crunch_good` | Ash | Right call. People before paper. |
| `crunch_bad` | Ash | The papers will keep. I hope the other one does. |
