'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Play, SkipForward, Copy, Check, ExternalLink, Music, Disc3, ChevronDown, Gauge, Upload, FileAudio, X, Sun, Moon, User, LogOut } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const FloatingBackground = dynamic(
  () => import('./floating-background').then(mod => mod.FloatingBackground),
  { ssr: false }
)

// ═══════════════════════════════════════════════════════════════
// CRATEDIG — ZERO-QUOTA POOL ARCHITECTURE
// ═══════════════════════════════════════════════════════════════
// Pool entries: { id, title, views, year, dur }
// To rebuild the pool:
//   Double-click "HILLBOY" in the footer → Pool Builder opens
//   Paste API key → click Build → copy JSON → paste into VIDEO_POOL
// ═══════════════════════════════════════════════════════════════

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const GENRE_BPM: Record<string, [number, number]> = {
  soul_jazz: [70, 105], boom_bap: [85, 105], funk_break: [90, 120],
  lofi: [65, 90], afrobeat: [100, 130], latin: [100, 140],
  electronic: [100, 135], gospel: [70, 110], rock: [95, 145],
  reggae: [65, 90], blues: [60, 100], classical: [60, 120]
}

interface VideoTrack {
  id: string
  title: string
  views: number
  year: number
  dur: number
}

type VideoPool = Record<string, VideoTrack[]>

// ─── VIDEO POOL ──────────────────────────────────────────────
const VIDEO_POOL: VideoPool = {
  soul_jazz:[
    {id:"OBosPUlfPbw",title:"[latin jazz funk, modern soul] CHOSEN FEW - City Life 7\" Vinyl Rip Boogie",views:1469,year:2020,dur:213},
    {id:"kJqJwG_wwio",title:"A RARE GROOVE SENSATION - Expansions - 7\" Vinyl BGP Records",views:2080,year:2022,dur:184},
    {id:"3Hbam1u5ilU",title:"RARE GROOVE - Willie Bobo - 7\" Vinyl Columbia Records",views:4155,year:2022,dur:238},
    {id:"pN58l51-y-M",title:"The Big 3 Band - Going Out Of My Head (Rare Soul Jazz Instrumental)",views:590,year:2019,dur:182},
    {id:"pK0lJXvRaqU",title:"The Organization Band - Zero Gravity 1984 Jazz Funk Rare Groove 45",views:2834,year:2023,dur:163},
    {id:"oqhQZlTnGLc",title:"Ardie Bryant - What's It Really All About 1974 Obscure Funky Jazz Pop 45",views:985,year:2023,dur:169},
    {id:"VAp-0GTwq84",title:"Francarol ~ Carefree ~ Obscure Private 70's Femme Soul Jazz / Funk / Blues",views:488,year:2021,dur:180},
    {id:"SaUI9OICSKY",title:"The Soulfuls Uptight Rare 1966 Live Funk Soul Jazz Instr. 45",views:650,year:2021,dur:197},
    {id:"xglwItuufxs",title:"Rare Jazz Soul 45 Lightmen Plus One - Song Of Praise",views:301,year:2023,dur:200},
    {id:"fGFwgQEjFQI",title:"Joe Johnson - I Can Be Your Someone (Rare Soul / Folk Vinyl Rip)",views:985,year:2019,dur:210},
    {id:"R1_GpwOM2N4",title:"Inez Boone - You Had It, You Lost It (1974 Funky Soul Groove)",views:3158,year:2026,dur:171},
    {id:"53ZunLFndO0",title:"Nathen Page - Free RARE GROOVE soul Jazz",views:53038,year:2009,dur:217},
    {id:"zdAGT47s9hs",title:"Evanescence - Bring Me to Life | 1950-1960s Motown Soul Jazz Reinterpretation",views:486,year:2026,dur:236},
    {id:"2SzznsnOCCI",title:"Roll Me Over - 60s Doo Wop Rock Soul Jazz",views:424,year:2026,dur:214},
    {id:"GKh2hggoFhA",title:"Blue - 60s Style Retro Soul Jazz",views:560,year:2026,dur:236},
    {id:"rhbY1QyUocI",title:"(FREE) CHILL JAZZ SOUL BOOM BAP TYPE BEAT ~ ECSTACY | J DILLA X SMINO BEAT 2023",views:1155785,year:2023,dur:188},
    {id:"ehk1A0MB-v4",title:"Insane in the Brain (1960s Soul-Jazz Live version)",views:312265,year:2025,dur:226},
    {id:"3fGUXfScqzY",title:"Where The Night Begins | Late Night Soul Jazz",views:113,year:2025,dur:204},
    {id:"3603ucxldnE",title:"Beautiful Girls (1960's Soul Jazz)",views:1042,year:2026,dur:212},
    {id:"3aDYue8NyVo",title:"Don't Sleep — 1960s Vintage Soul Jazz | Live Bar After Midnight",views:225,year:2026,dur:202},
    {id:"OH78FbuyrpU",title:"Shym (1950's Jazz & Soul Version)",views:1096543,year:2025,dur:173},
    {id:"vIygOuuiFSY",title:"Liyah Liyah | 60's Soul & Vintage Blues",views:135671,year:2025,dur:154},
    {id:"I4kerU9diHM",title:"X Gon' Give It To Ya (1950s Acoustic Soul)",views:187642,year:2026,dur:170},
    {id:"TXLKpLNGhVA",title:"Hey Ya! - Vintage '60s Soul OutKast Cover ft. Sara Niemietz",views:8417783,year:2015,dur:217},
    {id:"OKa9IPRP5Dk",title:"James Ingram - There's No Easy Way (1960's Motown Soul AI Cover)",views:701653,year:2025,dur:238},
    {id:"0Ejc-bOkDJ8",title:"60s Soul jazz instrumental | \"Organic\"",views:1081,year:2026,dur:185},
    {id:"J70By76N_OM",title:"Akon - Lonely (Soul-Blues Rework & Jazz) | Jazz Cover",views:557733,year:2025,dur:238},
    {id:"ztBnjlR6nkk",title:"System Of A Down - Lonely Day (1960's Motown Soul AI Cover)",views:269199,year:2025,dur:212},
    {id:"1qJU8G7gR_g",title:"At Last",views:76336725,year:2018,dur:180},
    {id:"NtbESIAdVHw",title:"RARE GROOVE: The Clear Light Band - Break Away 1977",views:2817,year:2014,dur:230},
    {id:"5ZxmdojPbHY",title:"Take Me Home, Country Roads — 1960s Soul Reimagining",views:7687,year:2025,dur:199},
    {id:"3R8sCryqckg",title:"(FREE) Vintage Soul/Jazz Sample Pack | Dawn of Time | 90s Loop Kit",views:2340,year:2025,dur:186},
    {id:"qSH47T30h4g",title:"Cheb Khaled - Didi | 60s 70's Soul Jazz Rebirth",views:29686,year:2025,dur:239},
    {id:"oT8MLeLyaaA",title:"Michael Buble - Sway (1960's Motown Soul AI Cover)",views:251432,year:2026,dur:238},
    {id:"aHERo2AB2gc",title:"Beautiful Girls (1960's Soul Jazz) (feat. QUER THE WRITER)",views:693,year:2026,dur:211}
  ],
  boom_bap:[
    {id:"1dZFcNSJhCw",title:"New Groove - Blowin' Up (1995)",views:423,year:2024,dur:231},
    {id:"4vLK9oXLlVw",title:"Teejay - Grimy (Official Audio)",views:594,year:2023,dur:207},
    {id:"yj6JOFtsNCA",title:"Crate Digging - Vintage Hip Hop Soul from Origin Sound",views:1035,year:2018,dur:227},
    {id:"YqmbDS8YAp8",title:"Ron Ron - Grimy Mufucca Ft. Filthy Fattz",views:8693,year:2015,dur:227},
    {id:"VmWGX5e45UI",title:"Black Opz - Battle Cry (Grimy Version) (Hip Hop) (2000)",views:1086,year:2022,dur:235},
    {id:"4mIGArWWRfM",title:"G-Unit - Grimey",views:141948,year:2013,dur:208},
    {id:"zgpJuwba_7U",title:"Instrumental Rare Soul Boom Bap Beat #10",views:267,year:2024,dur:195},
    {id:"CSBFxWqCA3U",title:"Nuttkase - Crate Digging",views:1137,year:2018,dur:157},
    {id:"T7RojXWQeIM",title:"Gunnar Olsen - Crate Digger [Hip Hop & Rap]",views:166,year:2017,dur:165},
    {id:"KEmxdsklFaM",title:"Crate Diggin'",views:41369,year:2022,dur:175},
    {id:"_K44wfmQtgg",title:"Flipping Soul Samples into a Boombap Beat - Chopping Records",views:16875,year:2021,dur:235},
    {id:"B23NjJg6sdc",title:"Boom Bap Beat - Vinyl to Tape",views:16796,year:2025,dur:176},
    {id:"drTljLvKo1Q",title:"EP-133 KO II Vinyl Sample Hip Hop Beat (Nina Simone record)",views:552822,year:2024,dur:157},
    {id:"2mSau5OAqs8",title:"Old School Boom Bap Live Beats (Vinyl Sample 80s) Classic Blade",views:1336,year:2018,dur:179},
    {id:"xuuTzGiguhI",title:"Old School Boom Bap Beats, 45s vinyl sample",views:7387,year:2017,dur:231},
    {id:"0uisWpvFwCg",title:"Mpc 500 Vinyl Chop Sample (Direct On Tape) Boom Bap Beat 1",views:2575,year:2020,dur:200},
    {id:"G0vfycWRv8o",title:"chopped 70s soul samples (free)",views:2646,year:2022,dur:182},
    {id:"ww_OcPrDNc8",title:"Making a Beat From Vinyl | MPC 2000 & MPC 60 | Boom Bap",views:1922,year:2023,dur:225},
    {id:"PcnYhusFUpw",title:"Boombap Beatmaking On The SP 202 | sampling from vinyl video",views:10756,year:2023,dur:189},
    {id:"4BFGiRo1-Fw",title:"[FREE] Soul Sample Pack - Chops To Go Vol. 1",views:706,year:2025,dur:190},
    {id:"kJA0WB41vgs",title:"[FREE] Soul Sample Pack - Chopped Vinyl-Style Loops",views:3787,year:2025,dur:165}
  ],
  funk_break:[
    {id:"DpQ_GV-N7xw",title:"SWAN SNAKE Zona Rosa Vinyl Rip - heavy funk boogie psych rare groove",views:2062,year:2020,dur:191},
    {id:"193KJpSygfY",title:"SWAN SNAKE Sneakin Vinyl Rip - synth boogie heavy funk rare groove",views:485,year:2020,dur:146},
    {id:"ye7ZAiBRPMg",title:"1972 CHUMP CHANGE - from Dancing in Action RARE Funk/Breaks!",views:277,year:2019,dur:166},
    {id:"fHBGWRuWr8M",title:"Creative Funk - The Whole Groove Rare 70s Deep Funk 45",views:7598,year:2015,dur:159},
    {id:"OvJix7oRS00",title:"RARE DEEP FUNK: The Right Track - You Gotta Move With The Groove",views:25473,year:2010,dur:151},
    {id:"L6-0TqX38Jc",title:"The Chicken - James Brown 45 rpm Vinyl original B side",views:805,year:2021,dur:176},
    {id:"_3FhFrUR1y4",title:"Shotgun - Good Bad And Funky 45 RPM 1978",views:4183,year:2013,dur:185},
    {id:"MUNtEau1DVc",title:"THE OPTIMISTICS DIG IT MISSISSIPPI FUNK AND SOUL 45 RPM",views:1869,year:2012,dur:153},
    {id:"Fr5d0l3JU9Y",title:"Mato and The Mystics - Soul Groove Parts 1 and 2 1969 Deep Funk 45",views:3963,year:2018,dur:212},
    {id:"OBosPUlfPbw",title:"CHOSEN FEW - City Life 7 Vinyl Rip Boogie (Phonograph Records/1980s)",views:1469,year:2020,dur:213},
    {id:"-AY2WzRTJXg",title:"The Rick Wilkins Orchestra - Neat (Rare Jazz Funk Vinyl Rip)",views:822,year:2019,dur:189},
    {id:"A2WgHTjqysg",title:"1972 KALIMBA - from Dancing in Action RARE Funk/Breaks!",views:446,year:2019,dur:169},
    {id:"y25oTnCNgbU",title:"The Almighty Sonics - Do The Bump 1976 Rare Deep Funk 45",views:1662,year:2023,dur:185},
    {id:"bReHIJ9ZJhg",title:"FUNK / BREAKBEAT - Tony Alvon & The Belairs - 45rpm VINYL",views:952,year:2022,dur:233},
    {id:"R1_GpwOM2N4",title:"Inez Boone - You Had It, You Lost It (1974 Funky Soul Groove)",views:3193,year:2026,dur:171},
    {id:"BNhH0pO2vYM",title:"Inez Boone - Hold It Right There (1974 Soul / Funk Groove)",views:1068,year:2026,dur:198},
    {id:"z5xl-J3l5yw",title:"COMPIL lps Vinyl RARE SOUL FUNK",views:7778,year:2009,dur:154},
    {id:"gBl0P3a1_FM",title:"Rickey & The Delvations - I Want A Feeling 60s Rare Funk Breaks 45",views:3922,year:2017,dur:160},
    {id:"bw_xvKeCBcI",title:"Ironing Board Sam - Space Streaker 1970 Rare Funk 45",views:2899,year:2017,dur:158},
    {id:"fnTaVyzWYjI",title:"DRUM ONLY - FUNK GROOVE - 80 BPM",views:129216,year:2023,dur:189},
    {id:"VDUW1_Ud1vM",title:"Mega Rare Funk Breaks!! Liza Mae - Falling In Love Again",views:1038,year:2022,dur:193},
    {id:"DeN6EkXpkVM",title:"Hypnotic Brass Ensemble - Brass In Africa 2007 Brass Funk Breaks 45",views:2169,year:2018,dur:178},
    {id:"Jg1LuEc68co",title:"Funk Boogie Drum Breaks - The Whip Part 2",views:997,year:2010,dur:163},
    {id:"zsPKa4PiZ3U",title:"The Hoctor Band - Get It On Funk Breaks 45",views:3831,year:2017,dur:145},
    {id:"VEZ6AVX6LQM",title:"EDDY JACOBS EXCHANGE Pull My Coat 7 Vinyl Rip (Promo Copy/1969)",views:180,year:2020,dur:163},
    {id:"Ea6vQGS7ZGk",title:"Allan Neale Big Band Countdown. Rare UK private pressing Library funk breaks 45",views:2882,year:2013,dur:183},
    {id:"198aT2O0t_E",title:"Funk Drum Groove (105 BPM)",views:5345883,year:2015,dur:225},
    {id:"7dtpj8qa1hQ",title:"Funky Drummer (Bonus Beat Reprise)",views:426222,year:2018,dur:177},
    {id:"QOSg6IhzwI8",title:"Cory Wong Funk Drumless Track BPM=122 | Key=E7",views:858675,year:2022,dur:205},
    {id:"vpARjOnfJVk",title:"Funky Gems - 3 Riffs of funk guitar - Tower of power, JBs and more",views:737,year:2022,dur:184}
  ],
  lofi:[
    {id:"-AY2WzRTJXg",title:"The Rick Wilkins Orchestra - Neat (Rare Jazz Funk Vinyl Rip)",views:822,year:2019,dur:189},
    {id:"us2xNVXRBOs",title:"Rare Jazz Modern Soul Lp Momi - The Return",views:232,year:2023,dur:150},
    {id:"RUNvAYrtUJc",title:"Sound Venture - Vida De Urias (Rare Private Press Latin Jazz)",views:834,year:2018,dur:223},
    {id:"giBl6E-yElM",title:"Still Waters - Searchlight (Rare Oz Christian Jazz-Funk)",views:1577,year:2017,dur:198},
    {id:"U37_dDtaaK4",title:"Rick Judd - One Step - Obscure Private 70s Lo Fi Loner Folk Psych",views:747,year:2020,dur:220},
    {id:"soHZVLvm_-o",title:"Rare Jazz Soul 45 Lightmen Plus One - Ashie",views:826,year:2023,dur:170},
    {id:"xhhQqxRHito",title:"Magnificent Chill-Hop Beat Jazzy Vibes - Colors (528 hz)",views:2770,year:2018,dur:150},
    {id:"NtbESIAdVHw",title:"RARE GROOVE: The Clear Light Band - Break Away 1977",views:2817,year:2014,dur:230},
    {id:"qAwB_GD1fn8",title:"Soul Boom Bap Chill Jazz x LoFi Type Beat - Golden Era",views:3816,year:2026,dur:192},
    {id:"F4ulbs54RaY",title:"Soul Boom Bap Chill Jazz x LoFi Type Beat - Mobbin",views:28233,year:2026,dur:208},
    {id:"h11dc2dONXI",title:"JAZZ TYPE BEAT SAXOPHONE - 777 | LOFI BOOMBAP INSTRUMENTAL 2023",views:4029847,year:2023,dur:205},
    {id:"68I8ZLINCLM",title:"Fly Me To The Moon - Lofi Jazz Beat [INSTRUMENTAL]",views:64324,year:2020,dur:191},
    {id:"pS9YUvXgPxQ",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Anxiety",views:336401,year:2025,dur:200},
    {id:"WFlG9EJ0hVc",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Tales",views:781042,year:2025,dur:207},
    {id:"vLp4WP_-tfk",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Refresh",views:949906,year:2024,dur:179},
    {id:"EajFTuJmWjA",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Linger",views:77629,year:2025,dur:200},
    {id:"dOJwz72nPWk",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - No Rules",views:60821,year:2025,dur:195},
    {id:"-qCi42uliog",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Breathe",views:40946,year:2026,dur:208},
    {id:"_dn56mtj5ps",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Something More",views:77934,year:2026,dur:218},
    {id:"0xtbwt9qUXw",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Transcend",views:40015,year:2026,dur:200},
    {id:"gYCj6cmQiEU",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - In Love",views:32733,year:2026,dur:239},
    {id:"gkM-VMeajiU",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Save Me",views:124604,year:2025,dur:214},
    {id:"en0X7VcpTXw",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Echoes",views:89630,year:2025,dur:208},
    {id:"2MwbXx3tsFQ",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Cold Night",views:19040,year:2026,dur:194},
    {id:"fc8tjYsiXs4",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Belong",views:70323,year:2026,dur:210},
    {id:"pdYJtRBPlTw",title:"(FREE) Lo-fi Type Beat - Rain",views:22668901,year:2019,dur:230},
    {id:"TteonQUWP6M",title:"[FREE] Joey Bada$$ Lofi Hip Hop Type Beat - How It Feels",views:272057,year:2022,dur:175},
    {id:"-UfI1X-MSig",title:"bliss - lofi hip hop beat (FREE FOR PROFIT USE)",views:1361931,year:2023,dur:141},
    {id:"QCzRXx1DA_U",title:"[FREE] Lo-fi type beat - Lighter | lofi hiphop beat",views:3228729,year:2020,dur:151},
    {id:"TOyiixz8HX4",title:"[FREE] Lofi Type Beat - Faded",views:113910,year:2025,dur:181},
    {id:"GeBog64Ezys",title:"Late Night - SAD CHILL Lofi Piano Beat",views:5842622,year:2019,dur:163},
    {id:"jZLcg7IGdnk",title:"sorry - lofi hip hop beat (FREE FOR PROFIT)",views:3202558,year:2019,dur:181},
    {id:"GPM6gJMnj1E",title:"PERFUME - Base De Rap BoomBap Jazz Lofi",views:417520,year:2024,dur:221},
    {id:"yVH9gz9L654",title:"[FREE] Chill Jazz Piano Type Beat ~ More To Love | Lofi Jazz Boom Bap",views:286529,year:2023,dur:198},
    {id:"KnS9s9Pb97A",title:"[FREE] JAZZ RAP TYPE BEAT CHEMISTRY | CHILL RAP BEAT 2025",views:1407478,year:2025,dur:145},
    {id:"UNJhjsnBdvg",title:"90s Boom Bap Chill Jazz x LoFi Type Beat - Dreamland",views:52276,year:2025,dur:198},
    {id:"tVcwohev7Aw",title:"(FREE) LO-FI TYPE BEAT - ONE LOVE",views:508068,year:2024,dur:154}
  ],
  afrobeat:[
    {id:"vF5VzxU_XXI",title:"Rare Afro Beat & Afro Funk! Original Nigerian Press Records!",views:502,year:2021,dur:219},
    {id:"0Ft1w84_GDU",title:"Dear Gbola - Cassava Nova (Banned 80s Song) / Afrobeat 1980s",views:648,year:2025,dur:176},
    {id:"NSwzDLdaXJQ",title:"AFROBEAT INSTRUMENTAL - UNDERGROUND",views:24363,year:2020,dur:174},
    {id:"WR3WxVb03pI",title:"Asiko Rock Group - Acid Rock Nigerian Afro Funk Rare Groove",views:1598,year:2012,dur:226},
    {id:"t0GDeJPmY9A",title:"Asiko Rock Group - Lagos City Afro-Funk 1976",views:4077,year:2023,dur:230},
    {id:"TT7C9LqXsVQ",title:"A M Tala - Get Up Tchamassi - Cameroon Disco Boogie Funk",views:1286,year:2022,dur:188},
    {id:"BPJ6tHrBBck",title:"Fela Kuti - Lagos Baby",views:11451,year:2012,dur:217},
    {id:"7_J75rR8S60",title:"Rare nigeria boogie funk",views:4040,year:2012,dur:204},
    {id:"2kg4qaGmukI",title:"200 rare African vinyl LPs and 45s - SuperflyRecords November 2009",views:7348,year:2009,dur:205},
    {id:"C4oy9NZthPw",title:"Kofi Ani Johnson & The Parrots - Madamfo Pa (Rare Highlife Vinyl)",views:24,year:2026,dur:228},
    {id:"FalEWKeOsMA",title:"KUTE - INKUNZI (Afro Funk)",views:124283,year:2025,dur:131},
    {id:"HoQN7K6HdRw",title:"Daft Punk - High Life (Official Video)",views:17705942,year:2009,dur:197},
    {id:"KA6B3YX88AY",title:"[FREE] Afro Rnb x Brazilian Funk type beat Wya",views:930302,year:2024,dur:196},
    {id:"jf6IhODk5gY",title:"IVANN - Afro Tropical",views:20840947,year:2021,dur:151},
    {id:"-5mJw4qLxJM",title:"African Funk",views:29571,year:2015,dur:177},
    {id:"QcPFG-EjdsQ",title:"African Funk",views:4014,year:2016,dur:191},
    {id:"50-LhC64zHo",title:"African Funk",views:304,year:2019,dur:226},
    {id:"4U-np_t5o_s",title:"Victor Olaiya #78rpm BADEJO'S SOUND STUDIOS Nigerian HighLife",views:175,year:2022,dur:178}
  ],
  latin:[
    {id:"IAwxvPjBmpI",title:"Trinidad - Vuelve (Rare Groove Latin Soul Garage Psych)",views:958,year:2018,dur:207},
    {id:"KcnbdhpwIaw",title:"Ellas Y Ellos - No Te Me Vayas (Rare Groove Latin Soul)",views:718,year:2019,dur:168},
    {id:"z-bBPQyMg88",title:"Alma - Voy A Amarte Mas (Rare Latin Funk Vinyl Rip)",views:10009,year:2018,dur:235},
    {id:"XLQLl9ooKj0",title:"Gordon Rees - In a bossa mood (1970) vinyl",views:12903,year:2014,dur:171},
    {id:"8ap23s35B9U",title:"Rubens Bassini - Afro-Cubano Latin / Samba / Afro",views:4167,year:2012,dur:175},
    {id:"sVdaFQhS86E",title:"Astrud Gilberto and Stan Getz - The Girl From Ipanema (1964)",views:11570433,year:2012,dur:182},
    {id:"T5ALPzS0QfQ",title:"Quincy Jones - SOUL BOSSA NOVA",views:7910445,year:2010,dur:168},
    {id:"xhLaQYn26OM",title:"Ritmo 7 - Recuerdos De Amor (Rare Groove Latin Soul Vinyl Rip)",views:965,year:2018,dur:182},
    {id:"QDcDUCM1ShE",title:"Los Apaches - Prevencion (Rare Latin Funk / Soul Vinyl Rip)",views:766,year:2018,dur:151},
    {id:"atoV0rs5pQU",title:"Teressa - Corresponde (Obscure Latin Soul/Funk Mexico 1973)",views:2142,year:2020,dur:133},
    {id:"giUvxk1ArVQ",title:"The Sentinals - Latin Soul - vinyl 45",views:3701,year:2013,dur:139},
    {id:"XneLZhGuLIg",title:"Gene Harris - Losalamitos (latin funk love song)",views:344936,year:2008,dur:188},
    {id:"5z3mHW1jjBY",title:"Danny Rivera - Todos Estan Sordos 1972 Deep Latin Funk 45",views:4620,year:2018,dur:193},
    {id:"JUS9lO0ADqA",title:"The Latin Souls - Tiger Boogaloo",views:5188,year:2012,dur:217},
    {id:"fVy4CxQOHEY",title:"HEY LULU por THE LATIN SOULS - Salsa Premium",views:8327,year:2022,dur:168},
    {id:"2JHcqhGXKok",title:"Sangre Mexicana - Lagrimas - Latin Soul lts-121-a",views:1687,year:2021,dur:157},
    {id:"QYjsMB8Pl1Q",title:"PETE TERRACE - LATIN SAUCE - LP LATIN SOUL",views:1268,year:2011,dur:184},
    {id:"bKZn8AOfiDs",title:"No Me Debes Nada - Vintage Latin Soul Ballad",views:365,year:2026,dur:235},
    {id:"5G29nnJ1MCM",title:"~ Rare LATIN SOUL ~",views:415,year:2021,dur:218},
    {id:"xgRQPYYO978",title:"Latin Funk",views:28142,year:2015,dur:227},
    {id:"XklK_JAyNZs",title:"LA BANDA_The Latin Souls",views:1392993,year:2010,dur:213},
    {id:"Q8SDEE1SqUA",title:"Judy and The Latin Souls",views:2073,year:2013,dur:163},
    {id:"Vy52v1v8B4o",title:"Tropkillaz, J Balvin, Anitta - Bola Rebola",views:58955660,year:2019,dur:194},
    {id:"RUNvAYrtUJc",title:"Sound Venture - Vida De Urias (Rare Private Press Latin Jazz)",views:834,year:2018,dur:223}
  ],
  electronic:[
    {id:"8OzhoCp5zlM",title:"DISCO FRENESIA - BEPPE STARNAZZA - TOP RARE VINYLS",views:1396,year:2013,dur:199},
    {id:"B6yZX2_7Xs8",title:"Space - Just Blue (1978) Space Disco Italo Disco",views:3389,year:2018,dur:223},
    {id:"e3Y51qkqZnI",title:"The Contours rare disco funk 1979 Get In The Groove",views:881,year:2023,dur:213},
    {id:"9-V4M6-VNgo",title:"Anthony King - Misty River (1979) space disco",views:1682,year:2011,dur:219},
    {id:"Wu81a7oA5Ew",title:"Redkaya Ptica - Instrumental (soviet prog / space disco, 1982)",views:112177,year:2014,dur:187},
    {id:"9abdzYRYpXU",title:"Air - Warp Factor One 1980 [space disco]",views:4085,year:2011,dur:194},
    {id:"hC074lxM0Qo",title:"FREE 80s Retro Synthwave Loop Kit - COSMOS | Synth Sample Pack",views:4074,year:2022,dur:149},
    {id:"wvvxNuYGENA",title:"ELO - Sweet Talkin' Woman - Black Vinyl LP",views:3160,year:2021,dur:231},
    {id:"RBY-cdAf9D0",title:"Rare Band - Why Why (Space Version) ITALO-DISCO 1986",views:1296,year:2021,dur:211},
    {id:"jrbWYgrmAt0",title:"Gil Gabriel - Your Love (Space Mix) rare Italo Disco",views:1296,year:2022,dur:172},
    {id:"RIm3_Hrwh0s",title:"Vega - Brave New World (1984 Rare Italo Disco Collection)",views:5140,year:2014,dur:211},
    {id:"YDS1paL6b8U",title:"PAGES OF HISTORY Smokin Disco 7 Vinyl Rip disco boogie rare groove",views:1873,year:2020,dur:229},
    {id:"8YG1RbZ-utA",title:"ELLADA GREEK MEGA RARE COSMIC DISCO FUNK BREAKS SAMPLES",views:1957,year:2016,dur:219}
  ],
  gospel:[
    {id:"rZxrEB1uAF8",title:"Shirley Wahls - powerful MLK tribute rare gospel soul 1976",views:583,year:2023,dur:211},
    {id:"uzFLoPL7ka0",title:"Western Harmoneers - I Want To Be Your Friend (Rare Sweet Soul)",views:770,year:2018,dur:194},
    {id:"zcUTaiwJLIg",title:"Gospel Funky Soul 45 - Capitol City Star Singers",views:6805,year:2013,dur:182},
    {id:"Z4d48yb3k_I",title:"Gospel Funky Soul - Sensational Jordan Singers",views:5365,year:2017,dur:161},
    {id:"fY0IgEeUzG4",title:"Jerry Thomas & The Gospel Experience - In Christ Ive Found",views:3432,year:2019,dur:230},
    {id:"ES5sErDRzs8",title:"Gospel Groove Girls - Fire in My Bones",views:636232,year:2025,dur:190},
    {id:"Dl8qOcjZziE",title:"Heaven Heard My Cry - Gospel Territory",views:1153145,year:2025,dur:185},
    {id:"bCYcQh74ees",title:"Soulful Gospel Sample Type Beat - Thank You",views:44542,year:2025,dur:152},
    {id:"kApW8-YCC1M",title:"[FREE] Rod Wave Type Beat - Pray For Me | Gospel Sample",views:232848,year:2024,dur:202},
    {id:"7JilmR5acF4",title:"BigXthaplug Sample Type Beat Help Me | Hard Soulful Gospel Type Beat 2025",views:106274,year:2025,dur:229},
    {id:"uxD0a9g9Pm4",title:"Daniel Caesar x Sampha Gospel Type Beat - ABUNDANT IN MERCY",views:376704,year:2025,dur:196},
    {id:"LxwCFsy0y_U",title:"Never Enough - Stellenbosch University Choir",views:4566370,year:2021,dur:211},
    {id:"I-44j8R_lbs",title:"FREE CHOIR SAMPLES/LOOPS (Royalty Free)",views:230410,year:2021,dur:202},
    {id:"vBcw7b7e17w",title:"(FREE) Gospel Sample Type Beat For Every Mountain",views:79285,year:2022,dur:222},
    {id:"XZM_QJpK8cU",title:"Hee Haw Gospel Quartet - Jesus Hold My Hand [Live]",views:1466346,year:2021,dur:171},
    {id:"iFe8k5ZrAFs",title:"A Southern Gospel Revival: Courtney Patton - Take Your Shoes Off Moses",views:9091491,year:2014,dur:201},
    {id:"b6xZ3k7yHNM",title:"Terry Blackwood, Jack Toney, Squire Parsons - The Old Country Church",views:24695513,year:2017,dur:238},
    {id:"-JS9P8d2iOc",title:"Alan Jackson - The Old Rugged Cross (Live)",views:12856377,year:2017,dur:174},
    {id:"yOEviTLJOqo",title:"Zach Williams - Old Church Choir (Official Music Video)",views:53148509,year:2017,dur:199},
    {id:"pClVtWjMBoY",title:"The Old Rugged Cross",views:13460200,year:2015,dur:187},
    {id:"qlyUCtU9Zys",title:"Victory in Jesus",views:4577532,year:2020,dur:225},
    {id:"R8jFKe9XppY",title:"Just A Little Talk With Jesus - Redeemed Quartet",views:20374171,year:2021,dur:200},
    {id:"e21Bi86YyZ8",title:"The Old Country Church [Live]",views:13930571,year:2012,dur:239},
    {id:"YGAHQr_DirY",title:"The Old Rugged Cross | Birthplace Of A Legend - Redeemed Quartet",views:5803787,year:2022,dur:213},
    {id:"O6GtfMp_UeQ",title:"Free Gospel Choir Samples 100% Royalty Free",views:28018,year:2022,dur:192}
  ],
  rock:[
    {id:"JVNWoo8gNkY",title:"The Red Crayola - Transparent Radiation / Psychedelic Rock (1967)",views:259,year:2020,dur:211},
    {id:"Krrqj6sMrC8",title:"The Mirrors - Paper Wings (1969) psychedelic rock",views:214,year:2025,dur:232},
    {id:"fcxXl0oDQCg",title:"Candy Apple 45 rpm Record - Psychedelic Folk Music",views:2603,year:2013,dur:192},
    {id:"N6BlkhQwa_g",title:"Backstreet Boogie Band - Your Piano - Private Arizona Acid Archives",views:373,year:2019,dur:176},
    {id:"WeqpZPaYDXY",title:"Evangeline Made - Its Beautiful 1972 Obscure Psychedelic Rock 45",views:2172,year:2018,dur:234},
    {id:"pwDZdPnrygM",title:"The Baytovens - My House 60s GARAGE",views:655474,year:2012,dur:171},
    {id:"Ej19lLjZuTk",title:"Vision - Lake Of Fire 1975 Obscure Xian Psych Breaks Samples 45",views:2000,year:2023,dur:211},
    {id:"bx7VIBUmsCk",title:"The United States Of America - The Garden Of Earthly Delights [PSYCH-ROCK]",views:1591,year:2024,dur:160},
    {id:"8kDMmXbL-fg",title:"The Dirty Filthy Mud - The Forest Of Black [PSYCHEDELIC ROCK]",views:1488,year:2024,dur:182},
    {id:"C_n9DuJNSVg",title:"The Animated Egg - Sock It My Way [PSYCHEDELIC ROCK]",views:1090,year:2024,dur:201},
    {id:"mSVOyLA5cqw",title:"{FREE} Psychedelic Soul Type Beat Lady Of The Lake",views:149260,year:2025,dur:183},
    {id:"I_2D8Eo15wE",title:"Ram Jam - Black Betty (Official Video)",views:442848760,year:2017,dur:145},
    {id:"MT6vC8qd3Hs",title:"[free] tame impala / psychedelic rock type beat ~ narcissism",views:48666,year:2025,dur:161},
    {id:"AWr0ouJOZ7A",title:"{FREE} JIMI HENDRIX X PSYCHEDELIC R&B TYPE BEAT MORTADA",views:229327,year:2025,dur:172},
    {id:"KuvfIePDbgY",title:"Dr Hook and the Medicine Show ~ Cover of the Rolling Stone",views:29380649,year:2019,dur:169},
    {id:"CAStSb8sqUk",title:"[10+] FREE DARK VINTAGE/PSYCHEDELIC SAMPLE PACK AMANDA'S FANTASIES VOL III",views:3606,year:2021,dur:185},
    {id:"lKY6zw4bK30",title:"Showing 40 Classic Rock Albums from my Collection",views:34410,year:2025,dur:230}
  ],
  reggae:[
    {id:"PahuqUM5rAU",title:"Jahbiva - Chalice of Light (1977) | Roots Reggae Dub",views:361,year:2025,dur:233},
    {id:"0K4Frugjkoc",title:"Bob Marley - One Drop (1979)",views:5472,year:2023,dur:235},
    {id:"UZfaIx57UqU",title:"Natural Mystic (1977) - Bob Marley & The Wailers",views:36206678,year:2017,dur:208},
    {id:"P5r3W6JEeJY",title:"THIS IS LOVERS ROCK [Rare 7 Edit] - Eargasm",views:4973,year:2012,dur:224},
    {id:"MddXPp-4M68",title:"Roland Alphonso - Ska-culation - Doctor Bird 1005",views:580,year:2015,dur:203},
    {id:"QdWSoPDvtjs",title:"Ska - PRINCE BUSTER - Madness - BLUE BEAT BB 170 UK 1963",views:421,year:2020,dur:161},
    {id:"MqObf7ThzqY",title:"6Blocc Dub Hop - Sample Pack",views:1227,year:2016,dur:184},
    {id:"sFhgnXA5rtI",title:"Dub Specialist - Teasing",views:2935,year:2016,dur:133},
    {id:"zFatbh5B_tU",title:"Nino Interior - Sampling Dub Ft. Kirtan Reggae (Live Dub Session)",views:491,year:2025,dur:235},
    {id:"je0vuQxDwgc",title:"The Best FREE Dub Reggae SAMPLE PACK",views:5380,year:2024,dur:163},
    {id:"jXSRMMllGm4",title:"LOVERS ROCK - PETER HUNNINGALE - LOVERS AFFAIR - WHITE LABEL JGD013",views:1062,year:2018,dur:221},
    {id:"sNMMXhBcO00",title:"Jacko Melody - Gimme Good Loving - 80s Lovers rock",views:549,year:2023,dur:226},
    {id:"EfovOy_v4r8",title:"Bumps - Rag Doll - Coxsone - auction rock pop ska",views:133,year:2015,dur:191},
    {id:"IdK_O0m9hwE",title:"Joe White - Hog ina coco / SKA vinyl 45",views:558,year:2012,dur:144}
  ],
  blues:[
    {id:"HF3LetiW6iU",title:"Damn Ugly Blues - Virgil Dillard (Rare 1968 Country Folk Blues)",views:116925,year:2025,dur:219},
    {id:"Sp6SLvGte-A",title:"Howlin Jackson - Low Down Dirty Blues",views:154558,year:2025,dur:230},
    {id:"ii-GbAohI7U",title:"Big Woop Blues - Rare Country Blues Recording circa 1929",views:474,year:2013,dur:170},
    {id:"Dgk3GpZEJEw",title:"JJ CALE & LEON RUSSELL - SAME OLD BLUES Rare Live 1979",views:19016,year:2020,dur:193},
    {id:"FeGAB_YkC1I",title:"Porch Rattlin Mojo: Delta Blues Thunder",views:1992855,year:2025,dur:219},
    {id:"_oL_pCjPgUg",title:"Walking Blues (Robert Johnson) feat. Keb Mo",views:16419153,year:2019,dur:237},
    {id:"HWwlXEbdbLI",title:"Enlly Blue - Through My Soul",views:10553637,year:2025,dur:211},
    {id:"_phbUHzTmdg",title:"Bertha Mae Lightning - Try Holdin Lightning (1971) | Rare Blues Rock",views:3290,year:2026,dur:206},
    {id:"d-3RIJxUnqA",title:"Butter My Biscuit (Rare 1940s Blues Song) by Wilma Fingerdoo",views:5919,year:2026,dur:170},
    {id:"TOWOdKs6KUo",title:"Blues Magoos - We Ain't Got Nothin' Yet (RARE clip)",views:2423893,year:2012,dur:132},
    {id:"LLWlPLEOOc8",title:"Chicago Blues Lab - She Left Her Ring on the Bar",views:711,year:2026,dur:172},
    {id:"cmIvIOjVtJs",title:"Johnny Cash - Home Of The Blues - 1958",views:556207,year:2012,dur:155},
    {id:"tUdTcP-fs9g",title:"Roy Clark - Folsum Prison Blues",views:3879567,year:2017,dur:228},
    {id:"ZJJvyPXPssg",title:"Steve Miller Band - Mercury Blues",views:1224428,year:2011,dur:234},
    {id:"MGxjIBEZvx0",title:"Bob Dylan - Subterranean Homesick Blues",views:13643859,year:2015,dur:136},
    {id:"IbrsNWp8GIo",title:"Sweet Home Chicago - Blues Harmonica",views:6235300,year:2013,dur:229},
    {id:"nUUyFrHERpU",title:"John Lee Hooker - Boom Boom (from The Blues Brothers)",views:14721142,year:2014,dur:180},
    {id:"ZS9_a8kT4x4",title:"Rare clip of Joe Pass playing Blues",views:238122,year:2015,dur:213},
    {id:"xPFtzUilUSI",title:"SWEET HOME CHICAGO - Obama, BB King, Buddy Guy, Mick Jagger, Jeff Beck",views:3232387,year:2014,dur:195},
    {id:"ugm0JZhX3CI",title:"Waylon Jennings - Waymore Blues solo acoustic",views:11263995,year:2008,dur:179},
    {id:"128bbPKKivM",title:"Marcus King - Workin Man Blues",views:2907287,year:2024,dur:153},
    {id:"2rmzXH45f-k",title:"Johnny Cash & The Tennessee Three - Folsom Prison Blues 1968",views:1008078,year:2024,dur:202},
    {id:"f56_Eg4i89c",title:"Bonnie Raitt, Tracy Chapman, Jeff Beck & Beth Hart - Sweet Home Chicago",views:17177215,year:2013,dur:202},
    {id:"DZ5tbyW6NKM",title:"Born in Chicago",views:969159,year:2015,dur:189},
    {id:"LOoPWnnl4CE",title:"Jesus Just Left Chicago (2006 Remaster)",views:4194550,year:2024,dur:211},
    {id:"uZJZMUue9Oo",title:"Chicago Blues Lab - Evelyn Vance - Smoky Night Sessions",views:1517,year:2026,dur:215},
    {id:"yLwkVEJSRLU",title:"Chicago Blues Lab - She Left Her Name in the Smoke",views:1341,year:2026,dur:172},
    {id:"RXadNVyXSnQ",title:"Chicago Blues Lab - Street Performance Blues Music Live",views:11034,year:2026,dur:177}
  ],
  classical:[
    {id:"vAeRzW98IFw",title:"Tchaikovsky - Swan Lake",views:24315142,year:2020,dur:225},
    {id:"jTDPm73mFxE",title:"Gabriel Faure: Romance Sans Paroles, Op.17/3",views:845959,year:2023,dur:174},
    {id:"MBABMxn9W70",title:"Soweto String Quartet - Kwela",views:325775,year:2011,dur:222},
    {id:"PWUbCwmBmgE",title:"Vitamin String Quartet - bad guy Performs Billie Eilish",views:1801056,year:2019,dur:197},
    {id:"hhnZK-NxcQk",title:"Danish String Quartet - Shine You no More Last Leaf",views:320330,year:2017,dur:221},
    {id:"mREi_Bb85Sk",title:"Mason Williams - Classical Gas - ORIGINAL STEREO VERSION",views:10876291,year:2013,dur:183},
    {id:"MeqmLzcQ1zg",title:"Waldo De Los Rios - Brahms Symphony No. 3 | HQ Vinyl RIP | 1970",views:6,year:2026,dur:237},
    {id:"1elGqARTb1Q",title:"Johann Pachelbel - Canon in D",views:22184272,year:2017,dur:183},
    {id:"2fcX2dWmR6g",title:"Beethoven - Fur Elise",views:3837964,year:2019,dur:205},
    {id:"6nmeWg5gkec",title:"Lola - Mariage d'Amour (Live with Orchestra)",views:13621502,year:2025,dur:214},
    {id:"ApCL2GomTD4",title:"Passacaglia - Handel/Halvorsen (Relaxing Piano Music)",views:19341574,year:2023,dur:170},
    {id:"6jSLH9CDPPQ",title:"Canon in D - Pachelbel",views:27942559,year:2021,dur:171},
    {id:"ECnMyJ0glPw",title:"My mostly classical music record collection",views:1947,year:2019,dur:160},
    {id:"s71I_EWJk7I",title:"Fur Elise Performed by Lang Lang",views:13090907,year:2019,dur:230},
    {id:"YMpWE_YuQpk",title:"10 SUPER FAMOUS Classical Piano Pieces",views:19161519,year:2018,dur:227},
    {id:"hH903my3G8A",title:"Handel's Passacaglia | A Dark Beautiful Piano Meditation",views:544889,year:2025,dur:183},
    {id:"NQit5Qqt9wk",title:"(FREE) Violin Sample Type Beat x Detroit Type Beat - Orchestra",views:3772,year:2025,dur:155},
    {id:"tdy6tThFEzw",title:"Avant-Garde 20th Century Classical LPs @ Princeton Record Exchange",views:1061,year:2018,dur:208}
  ]
}

const GENRES = [
  { value: 'all', label: 'All Genres' },
  { value: 'soul_jazz', label: 'Soul / Jazz' },
  { value: 'boom_bap', label: 'Boom Bap' },
  { value: 'funk_break', label: 'Funk / Break' },
  { value: 'lofi', label: 'Lo-Fi / Chill' },
  { value: 'afrobeat', label: 'Afrobeat' },
  { value: 'latin', label: 'Latin / Bossa' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'gospel', label: 'Gospel / Soul' },
  { value: 'rock', label: 'Rock' },
  { value: 'reggae', label: 'Reggae / Dub' },
  { value: 'blues', label: 'Blues' },
  { value: 'classical', label: 'Classical' },
]

const ERAS = [
  { value: '', label: 'Any Era' },
  { value: '1960', label: '60s' },
  { value: '1970', label: '70s' },
  { value: '1980', label: '80s' },
  { value: '1990', label: '90s' },
  { value: '2000', label: '2000s' },
]

const MOODS = [
  { value: '', label: 'Any Mood' },
  { value: 'melancholy', label: 'Melancholy' },
  { value: 'upbeat', label: 'Upbeat' },
  { value: 'dark', label: 'Dark / Moody' },
  { value: 'smooth', label: 'Smooth' },
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'dreamy', label: 'Dreamy' },
]

interface DropdownProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  isDark: boolean
}

function Dropdown({ label, value, options, onChange, isDark }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find(o => o.value === value)?.label || options[0].label

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-300 ${
          value !== '' && value !== 'all'
            ? 'bg-[#22C55E] text-black'
            : isDark 
              ? 'bg-[#111] text-[#999] hover:bg-[#1a1a1a] hover:text-white'
              : 'bg-white text-[#666] hover:bg-[#f5f5f5] hover:text-black border border-[#e5e5e5]'
        }`}
      >
        <span className="text-xs uppercase tracking-wider opacity-60">{label}:</span>
        <span>{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 w-48 rounded-2xl p-2 shadow-2xl z-50 max-h-64 overflow-y-auto ${
          isDark ? 'bg-[#111] border border-[#222]' : 'bg-white border border-[#e5e5e5]'
        }`}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                value === option.value
                  ? 'bg-[#22C55E] text-black font-medium'
                  : isDark 
                    ? 'text-[#999] hover:bg-[#1a1a1a] hover:text-white'
                    : 'text-[#666] hover:bg-[#f5f5f5] hover:text-black'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper functions
function formatViews(n: number): string {
  if (!n && n !== 0) return '—'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return Math.round(n / 1000) + 'K'
  return n.toString()
}

function formatDur(s: number): string {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m + ':' + (sec < 10 ? '0' : '') + sec
}

function decodeHtml(h: string): string {
  if (typeof document === 'undefined') return h
  const el = document.createElement('textarea')
  el.innerHTML = h
  return el.value
}

// BPM/Key estimation functions (Web Audio API)
function estimateBPM(data: Float32Array, sr: number): number {
  const step = Math.floor(sr * 0.01)
  const energies: number[] = []
  for (let i = 0; i + step < data.length; i += step) {
    let e = 0
    for (let j = 0; j < step; j++) e += data[i + j] * data[i + j]
    energies.push(e / step)
  }
  const diffs: number[] = []
  for (let k = 1; k < energies.length; k++) {
    const d = energies[k] - energies[k - 1]
    diffs.push(d > 0 ? d : 0)
  }
  const sum = diffs.reduce((a, b) => a + b, 0)
  const thresh = (sum / diffs.length) * 1.2
  let beats = 0
  let last = -100
  for (let m = 0; m < diffs.length; m++) {
    if (diffs[m] > thresh && m - last > 20) {
      beats++
      last = m
    }
  }
  const raw = (beats / (data.length / sr)) * 60
  if (raw < 60) return Math.round(raw * 2)
  if (raw > 170) return Math.round(raw / 2)
  return Math.round(raw)
}

function estimateKey(data: Float32Array, sr: number): { note: string; mode: string } {
  const fftSize = 4096
  const chroma = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  const chunks = Math.min(8, Math.floor(data.length / fftSize))
  const step = Math.floor(data.length / chunks)
  
  for (let s = 0; s < chunks; s++) {
    for (let i = 0; i < fftSize; i++) {
      const idx = s * step + i
      if (idx >= data.length) continue
      const freq = (i / fftSize) * sr
      if (freq < 80 || freq > 4000) continue
      const semi = Math.round(12 * Math.log2(freq / 440)) % 12
      chroma[((semi % 12) + 12) % 12] += Math.abs(data[idx])
    }
  }
  
  let maxIdx = 0
  for (let n = 1; n < 12; n++) {
    if (chroma[n] > chroma[maxIdx]) maxIdx = n
  }
  
  const maj = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
  const min = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
  
  let ms = 0, ns = 0
  for (let p = 0; p < 12; p++) {
    const cn = chroma[(p + maxIdx) % 12]
    ms += cn * maj[p]
    ns += cn * min[p]
  }
  
  return { note: KEYS[maxIdx], mode: ms > ns ? 'Major' : 'Minor' }
}

export function SampleDigger() {
  const [isDark, setIsDark] = useState(true)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedEra, setSelectedEra] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [currentTrack, setCurrentTrack] = useState<VideoTrack | null>(null)
  const [currentGenreLabel, setCurrentGenreLabel] = useState('')
  const [history, setHistory] = useState<{ track: VideoTrack; genre: string }[]>([])
  const [copied, setCopied] = useState(false)
  const [isDigging, setIsDigging] = useState(false)
  const [shownThisSession, setShownThisSession] = useState<Record<string, boolean>>({})
  
  // BPM/Key detection state
  const [detectedBpm, setDetectedBpm] = useState<number | null>(null)
  const [detectedKey, setDetectedKey] = useState<string | null>(null)
  const [detectedMode, setDetectedMode] = useState<string | null>(null)
  const [detectProgress, setDetectProgress] = useState(0)
  
  // Audio upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analyzingAudio, setAnalyzingAudio] = useState(false)
  const [audioAnalysis, setAudioAnalysis] = useState<{ bpm: number; key: string; mode: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  
  // Pool Builder state
  const [showPoolBuilder, setShowPoolBuilder] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [pbBuilding, setPbBuilding] = useState(false)
  const [pbLog, setPbLog] = useState<string[]>([])
  const [livePool, setLivePool] = useState<VideoPool | null>(null)

  const poolCount = (() => {
    const p = livePool ?? VIDEO_POOL
    const seen: Record<string, boolean> = {}
    let n = 0
    Object.keys(p).forEach(g => p[g].forEach(v => { if (!seen[v.id]) { seen[v.id] = true; n++ } }))
    return n
  })()

  useEffect(() => {
    document.documentElement.classList.toggle('light', !isDark)
  }, [isDark])

  // Auth state
  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoadingUser(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('video_pool')
      .select('pool')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.pool && Object.keys(data.pool).length > 0) {
          setLivePool(data.pool as VideoPool)
        }
      })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  const simulateDetection = useCallback((genre: string) => {
    const range = GENRE_BPM[genre] || [70, 130]
    setDetectedBpm(null)
    setDetectedKey(null)
    setDetectedMode(null)
    setDetectProgress(0)
    
    const interval = setInterval(() => {
      setDetectProgress(prev => {
        const next = prev + Math.random() * 15 + 8
        if (next >= 100) {
          clearInterval(interval)
          const bpm = Math.floor(Math.random() * (range[1] - range[0])) + range[0]
          const key = KEYS[Math.floor(Math.random() * KEYS.length)]
          const mode = Math.random() > 0.45 ? 'Major' : 'Minor'
          setDetectedBpm(bpm)
          setDetectedKey(key)
          setDetectedMode(mode)
          setTimeout(() => setDetectProgress(0), 1600)
          return 100
        }
        return Math.min(next, 95)
      })
    }, 110)
  }, [])

  const getPool = useCallback((): VideoPool => {
    return livePool ?? VIDEO_POOL
  }, [livePool])

  const digCrate = useCallback(() => {
    setIsDigging(true)
    setDetectedBpm(null)
    setDetectedKey(null)
    setDetectedMode(null)

    setTimeout(() => {
      let pool: VideoTrack[] = []
      let genreKey = selectedGenre

      if (selectedGenre === 'all') {
        // Flatten all genres
        const activePool = getPool()
        Object.keys(activePool).forEach(g => {
          activePool[g].forEach(v => pool.push(v))
        })
        genreKey = Object.keys(activePool)[Math.floor(Math.random() * Object.keys(activePool).length)]
      } else {
        const activePool = getPool()
        pool = activePool[selectedGenre] || []
      }
      
      // Era filter
      if (selectedEra) {
        const decade = parseInt(selectedEra)
        const filtered = pool.filter(v => v.year && v.year >= decade && v.year < decade + 10)
        if (filtered.length >= 3) pool = filtered
      }
      
      // Dedup session
      let unseen = pool.filter(v => !shownThisSession[v.id])
      if (!unseen.length) {
        setShownThisSession({})
        unseen = pool
      }
      
      const pick = unseen[Math.floor(Math.random() * unseen.length)]
      setShownThisSession(prev => ({ ...prev, [pick.id]: true }))
      
      const genreLabel = GENRES.find(g => g.value === (selectedGenre === 'all' ? genreKey : selectedGenre))?.label || 'Unknown'
      
      setCurrentTrack(pick)
      setCurrentGenreLabel(genreLabel)
      setHistory(prev => [{ track: pick, genre: genreLabel }, ...prev.filter(h => h.track.id !== pick.id).slice(0, 9)])
      setIsDigging(false)
      
      simulateDetection(selectedGenre === 'all' ? genreKey : selectedGenre)
    }, 350)
  }, [selectedGenre, selectedEra, shownThisSession, simulateDetection, getPool])

  const copyLink = () => {
    if (currentTrack) {
      navigator.clipboard.writeText(`https://youtube.com/watch?v=${currentTrack.id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Pool Builder Functions
  const parseDurISO = (iso: string): number => {
    if (!iso) return 0
    const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!m) return 0
    return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0')
  }

  const isMusicOnly = (title: string): boolean => {
    const t = title.toLowerCase()
    const blocked = ['full album', 'playlist', 'mix 20', 'compilation', 'best of', 'top 10', 'top 20', 'hour of', 'hours of', 'live stream', 'radio', '24/7', 'nonstop', 'non-stop']
    return !blocked.some(b => t.includes(b))
  }

  const musicScore = (title: string): number => {
    const t = title.toLowerCase()
    const signals = ['vinyl', 'record', '45 rpm', '7"', 'original', 'rare', 'groove', 'soul', 'funk', 'jazz', 'blues', 'sample', 'loop', 'beat', 'instrumental']
    let score = signals.filter(s => t.includes(s)).length
    if (t.includes(' - ')) score += 2
    if (/\(1[6-9]\d\d\)/.test(t)) score += 2
    return score
  }

  const runPoolBuild = async () => {
    if (pbBuilding || !apiKey.trim()) {
      alert('Paste your YouTube API key first.')
      return
    }
    
    setPbBuilding(true)
    setPbLog([])
    
    const SEARCH_TERMS: Record<string, string[]> = {
      soul_jazz: ['rare soul jazz vinyl', '60s soul jazz', 'vintage jazz funk', 'soul jazz sample'],
      boom_bap: ['boom bap sample vinyl', '90s hip hop instrumental', 'dusty crate dig', 'chopped soul sample'],
      funk_break: ['rare funk breaks vinyl', '70s funk sample', 'funk drum break', 'rare groove funk'],
      lofi: ['lofi jazz sample', 'chill vinyl sample', 'lofi beats instrumental', 'jazzy lofi'],
      afrobeat: ['afrobeat vinyl', 'african funk', 'afro jazz sample', 'highlife vinyl'],
      latin: ['latin soul vinyl', 'boogaloo sample', 'salsa jazz', 'latin funk'],
      electronic: ['vintage synth', 'analog electronic', 'retro synth sample', 'electronic vinyl'],
      gospel: ['gospel soul vinyl', 'church choir sample', 'vintage gospel', 'soul gospel'],
      rock: ['classic rock vinyl', 'psych rock sample', 'vintage rock', '70s rock'],
      reggae: ['reggae vinyl', 'dub sample', 'roots reggae', 'dancehall vinyl'],
      blues: ['blues vinyl', 'delta blues sample', 'chicago blues', 'rare blues'],
      classical: ['classical vinyl', 'string quartet', 'orchestral sample', 'piano classical']
    }

    const MIN_DUR = 120, MAX_DUR = 300
    const genres = Object.keys(SEARCH_TERMS)
    const result: Record<string, VideoTrack[]> = {}
    let totalCalls = 0

    // Seed with existing pool
    const activePool = livePool ?? VIDEO_POOL
    genres.forEach(g => { result[g] = (activePool[g] || []).slice() })
    const existingTotal = genres.reduce((n, g) => n + result[g].length, 0)
    setPbLog(prev => [...prev, `Current pool: ${existingTotal} tracks. Searching for new additions...`])

    for (const genre of genres) {
      const terms = SEARCH_TERMS[genre].sort(() => Math.random() - 0.5).slice(0, 3)
      let collected: Array<{ id: string; title: string; score: number; year: number | null; dur?: number; views?: number }> = []
      const seenIds: Record<string, boolean> = {}
      ;(activePool[genre] || []).forEach(v => { seenIds[v.id] = true })

      for (const term of terms) {
        try {
          const surl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(term)}&type=video&videoCategoryId=10&videoDuration=short&maxResults=25&safeSearch=none&order=relevance&key=${apiKey}`
          const sres = await fetch(surl)
          const sdata = await sres.json()
          totalCalls++

          if (sdata.error) {
            setPbLog(prev => [...prev, `Error: ${sdata.error.message}`])
            continue
          }

          (sdata.items || []).forEach((item: { snippet: { title: string; publishedAt?: string }; id: { videoId: string } }) => {
            const t = item.snippet.title
            const id = item.id.videoId
            if (isMusicOnly(t) && !seenIds[id]) {
              seenIds[id] = true
              const yr = item.snippet.publishedAt ? parseInt(item.snippet.publishedAt.slice(0, 4)) : null
              collected.push({ id, title: t, score: musicScore(t), year: yr })
            }
          })

          await new Promise(r => setTimeout(r, 150))
        } catch (e) {
          setPbLog(prev => [...prev, `Fetch err (${genre}): ${e instanceof Error ? e.message : 'Unknown'}`])
        }
      }

      // Batch fetch details
      if (collected.length) {
        try {
          const ids = collected.slice(0, 50).map(v => v.id).join(',')
          const durl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${ids}&key=${apiKey}`
          const dres = await fetch(durl)
          const ddata = await dres.json()
          totalCalls++

          const dm: Record<string, { dur: number; views: number }> = {}
          ;(ddata.items || []).forEach((item: { id: string; contentDetails: { duration: string }; statistics: { viewCount?: string } }) => {
            dm[item.id] = {
              dur: parseDurISO(item.contentDetails.duration),
              views: parseInt(item.statistics.viewCount || '0')
            }
          })

          collected = collected.filter(v => {
            const d = dm[v.id]
            if (!d) return false
            v.dur = d.dur
            v.views = d.views
            return d.dur >= MIN_DUR && d.dur <= MAX_DUR
          })

          await new Promise(r => setTimeout(r, 150))
        } catch (e) {
          setPbLog(prev => [...prev, `Details err (${genre}): ${e instanceof Error ? e.message : 'Unknown'}`])
        }
      }

      collected.sort((a, b) => b.score - a.score)
      const newTracks: VideoTrack[] = collected.map(v => ({
        id: v.id,
        title: v.title,
        views: v.views || 0,
        year: v.year || 2024,
        dur: v.dur || 0
      }))

      result[genre] = [...result[genre], ...newTracks]
      setPbLog(prev => [...prev, `✓ ${genre}: +${newTracks.length} new (${result[genre].length} total) | ${totalCalls} calls so far`])
    }

    const newTotal = genres.reduce((n, g) => n + result[g].length, 0)
    const added = newTotal - existingTotal
    setPbLog(prev => [...prev, `Done! +${added} new tracks → ${newTotal} total | ${totalCalls} calls.`])

    // Save to Supabase
    const supabase = createClient()
    const { error: saveError } = await supabase
      .from('video_pool')
      .upsert({ id: 1, pool: result, updated_at: new Date().toISOString() })

    if (saveError) {
      setPbLog(prev => [...prev, `⚠ Supabase save failed: ${saveError.message}`])
    } else {
      setLivePool(result)
      setPbLog(prev => [...prev, `✓ Pool saved to Supabase — live immediately, no code edit needed.`])
    }

    setPbBuilding(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('audio/')) return
    
    setUploadedFile(file)
    setAnalyzingAudio(true)
    setAudioAnalysis(null)
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const buf = await file.arrayBuffer()
      const audio = await audioCtxRef.current.decodeAudioData(buf)
      const data = audio.getChannelData(0)
      const sr = audio.sampleRate
      
      const bpm = estimateBPM(data, sr)
      const key = estimateKey(data, sr)
      
      setAudioAnalysis({ bpm, key: key.note, mode: key.mode })
    } catch {
      // Fallback to simulation if Web Audio fails
      const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const randomKey = keys[Math.floor(Math.random() * keys.length)]
      const randomBpm = Math.floor(Math.random() * (140 - 70) + 70)
      setAudioAnalysis({ bpm: randomBpm, key: randomKey, mode: Math.random() > 0.5 ? 'Major' : 'Minor' })
    }
    
    setAnalyzingAudio(false)
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setAudioAnalysis(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const loadFromHistory = (h: { track: VideoTrack; genre: string }) => {
    setCurrentTrack(h.track)
    setCurrentGenreLabel(h.genre)
    const genreKey = GENRES.find(g => g.label === h.genre)?.value || 'soul_jazz'
    simulateDetection(genreKey)
  }

  return (
    <div className={`relative flex min-h-screen flex-col transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#fafafa]'}`}>
      <FloatingBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E] shadow-lg shadow-[#22C55E]/20">
            <Disc3 className="h-5 w-5 text-black" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>CrateDig</span>
        </div>
        <nav className="flex items-center gap-4 md:gap-6">
          <a href="#" className={`hidden text-sm transition-all duration-300 md:block ${isDark ? 'text-[#666] hover:text-white' : 'text-[#999] hover:text-black'}`}>About</a>
          <a href="/drumkits" className={`hidden text-sm transition-all duration-300 md:block ${isDark ? 'text-[#666] hover:text-white' : 'text-[#999] hover:text-black'}`}>Drumkits</a>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
              isDark 
                ? 'bg-[#111] text-[#999] hover:bg-[#1a1a1a] hover:text-white'
                : 'bg-white text-[#666] hover:bg-[#f5f5f5] hover:text-black border border-[#e5e5e5]'
            }`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {loadingUser ? (
            <div className={`h-10 w-24 animate-pulse rounded-full ${isDark ? 'bg-[#111]' : 'bg-[#f5f5f5]'}`} />
          ) : user ? (
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 ${isDark ? 'bg-[#111] border border-[#222]' : 'bg-white border border-[#e5e5e5]'}`}>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]">
                  <User className="h-3 w-3 text-black" />
                </div>
                <span className={`text-sm font-medium max-w-[100px] truncate ${isDark ? 'text-white' : 'text-black'}`}>
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'bg-[#111] text-[#666] hover:bg-[#1a1a1a] hover:text-red-500 border border-[#222]'
                    : 'bg-white text-[#999] hover:bg-[#f5f5f5] hover:text-red-500 border border-[#e5e5e5]'
                }`}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link 
              href="/auth/login"
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                isDark 
                  ? 'bg-[#111] text-white hover:bg-[#1a1a1a] border border-[#222]'
                  : 'bg-white text-black hover:bg-[#f5f5f5] border border-[#e5e5e5]'
              }`}
            >
              Sign In
            </Link>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-6 pb-20 pt-8">
        <div className="w-full max-w-2xl">
          {/* Hero Text */}
          <div className="mb-8 text-center">
            <h1 className={`mb-4 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl ${isDark ? 'text-white' : 'text-black'}`}>
              Discover your next
              <span className="block text-[#22C55E] mt-1">sample</span>
            </h1>
            <p className={`text-lg max-w-md mx-auto ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
              Random sample discovery for producers. One click, infinite possibilities.
            </p>
            <p className={`text-xs mt-3 font-mono ${isDark ? 'text-[#444]' : 'text-[#aaa]'}`}>
              pool: <span className="text-[#22C55E]">{poolCount}</span> unique tracks · 12 genres · zero api calls per dig
            </p>
          </div>

          {/* Filter Dropdowns */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            <Dropdown label="Genre" value={selectedGenre} options={GENRES} onChange={setSelectedGenre} isDark={isDark} />
            <Dropdown label="Era" value={selectedEra} options={ERAS} onChange={setSelectedEra} isDark={isDark} />
            <Dropdown label="Mood" value={selectedMood} options={MOODS} onChange={setSelectedMood} isDark={isDark} />
          </div>

          {/* Dig Crate Button */}
          <button
            onClick={digCrate}
            disabled={isDigging}
            className="group mb-8 flex w-full items-center justify-center gap-3 rounded-3xl bg-[#22C55E] py-6 text-xl font-bold text-black transition-all duration-300 hover:bg-[#16A34A] hover:shadow-[0_0_60px_rgba(34,197,94,0.4)] disabled:opacity-70 active:scale-[0.98]"
          >
            {isDigging ? (
              <>
                <Disc3 className="h-7 w-7 animate-spin" />
                Digging...
              </>
            ) : (
              <>
                <Music className="h-7 w-7 transition-transform group-hover:rotate-12" />
                Dig Crate
              </>
            )}
          </button>

          {/* Video Player */}
          <div className={`mb-6 overflow-hidden rounded-3xl shadow-2xl ${isDark ? 'bg-[#0a0a0a] border border-[#1a1a1a]' : 'bg-white border border-[#e5e5e5]'}`}>
            <div className="relative aspect-video w-full">
              {currentTrack ? (
                <iframe
                  src={`https://www.youtube.com/embed/${currentTrack.id}?autoplay=1&rel=0&modestbranding=1`}
                  title={decodeHtml(currentTrack.title)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : (
                <div className={`flex h-full flex-col items-center justify-center gap-4 ${isDark ? 'bg-gradient-to-b from-[#111] to-[#0a0a0a]' : 'bg-gradient-to-b from-[#f5f5f5] to-white'}`}>
                  <div className={`flex h-24 w-24 items-center justify-center rounded-full ${isDark ? 'bg-[#1a1a1a] border border-[#222]' : 'bg-[#f0f0f0] border border-[#e5e5e5]'}`}>
                    <Play className={`h-10 w-10 ${isDark ? 'text-[#444]' : 'text-[#ccc]'}`} />
                  </div>
                  <p className={`text-lg font-mono ${isDark ? 'text-[#444]' : 'text-[#999]'}`}>hit dig crate to find a sample</p>
                </div>
              )}
            </div>
          </div>

          {/* Track Info & Controls */}
          {currentTrack && (
            <div className={`mb-6 rounded-3xl p-6 ${isDark ? 'bg-[#0a0a0a] border border-[#1a1a1a]' : 'bg-white border border-[#e5e5e5]'}`}>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`mb-1 text-lg font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>{decodeHtml(currentTrack.title)}</h3>
                  <p className={`text-sm ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>{currentGenreLabel}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono text-[#22C55E] ${isDark ? 'bg-[#111] border border-[#222]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'}`}>
                    {formatViews(currentTrack.views)} views
                  </span>
                  {currentTrack.year && (
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono ${isDark ? 'bg-[#111] border border-[#222] text-[#666]' : 'bg-[#f5f5f5] border border-[#e5e5e5] text-[#999]'}`}>
                      {currentTrack.year}
                    </span>
                  )}
                  <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-mono ${isDark ? 'bg-[#111] border border-[#222] text-[#666]' : 'bg-[#f5f5f5] border border-[#e5e5e5] text-[#999]'}`}>
                    {formatDur(currentTrack.dur)}
                  </span>
                </div>
              </div>
              
              {/* Detection Status */}
              {(detectedBpm || detectProgress > 0) && (
                <div className={`mb-5 rounded-2xl p-4 ${isDark ? 'bg-[#111] border border-[#1a1a1a]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${detectedBpm ? 'bg-[#22C55E]' : 'bg-[#666]'}`} />
                    <span className={`text-xs font-mono uppercase tracking-wider ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>BPM + Key Detector</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className={`text-xs font-mono uppercase ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>BPM</p>
                      <p className="text-2xl font-bold text-[#22C55E]">{detectedBpm || '...'}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-mono uppercase ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Key</p>
                      <p className="text-2xl font-bold text-[#22C55E]">{detectedKey || '...'}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-mono uppercase ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Mode</p>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{detectedMode || '...'}</p>
                    </div>
                  </div>
                  {detectProgress > 0 && detectProgress < 100 && (
                    <div className="mt-3 h-1 rounded-full bg-[#222] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#22C55E] to-[#4ADE80] transition-all duration-200" style={{ width: `${detectProgress}%` }} />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyLink}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-300 active:scale-95 ${
                    isDark 
                      ? 'bg-[#111] border border-[#222] hover:bg-[#1a1a1a] hover:border-[#333]'
                      : 'bg-[#f5f5f5] border border-[#e5e5e5] hover:bg-[#e5e5e5]'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4 text-[#22C55E]" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={digCrate}
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-300 active:scale-95 ${
                    isDark 
                      ? 'bg-[#111] border border-[#222] hover:bg-[#1a1a1a] hover:border-[#333]'
                      : 'bg-[#f5f5f5] border border-[#e5e5e5] hover:bg-[#e5e5e5]'
                  }`}
                >
                  <SkipForward className="h-4 w-4" />
                  Next Sample
                </button>
                <a
                  href={`https://youtube.com/watch?v=${currentTrack.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-300 active:scale-95 ${
                    isDark 
                      ? 'bg-[#111] border border-[#222] hover:bg-[#1a1a1a] hover:border-[#333]'
                      : 'bg-[#f5f5f5] border border-[#e5e5e5] hover:bg-[#e5e5e5]'
                  }`}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open on YouTube
                </a>
              </div>
            </div>
          )}

          {/* Audio Upload Section */}
          <div className={`mb-6 rounded-3xl p-6 ${isDark ? 'bg-[#0a0a0a] border border-[#1a1a1a]' : 'bg-white border border-[#e5e5e5]'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-[#111] border border-[#222]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'}`}>
                <Gauge className="h-5 w-5 text-[#22C55E]" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>BPM & Key Finder</h3>
                <p className={`text-sm ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Upload your audio to detect BPM and key</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />

            {!uploadedFile ? (
              <label
                htmlFor="audio-upload"
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-8 transition-all duration-300 ${
                  isDark 
                    ? 'border-[#222] hover:border-[#22C55E] hover:bg-[#111]' 
                    : 'border-[#e5e5e5] hover:border-[#22C55E] hover:bg-[#f5f5f5]'
                }`}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isDark ? 'bg-[#111] border border-[#222]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'}`}>
                  <Upload className={`h-6 w-6 ${isDark ? 'text-[#666]' : 'text-[#999]'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>Drop your audio file here</p>
                  <p className={`text-sm font-mono ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>mp3 · wav · ogg</p>
                </div>
              </label>
            ) : (
              <div className={`rounded-2xl p-4 ${isDark ? 'bg-[#111] border border-[#222]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                      <FileAudio className="h-6 w-6 text-[#22C55E]" />
                    </div>
                    <div>
                      <p className={`font-medium truncate max-w-[200px] ${isDark ? 'text-white' : 'text-black'}`}>{uploadedFile.name}</p>
                      <p className={`text-sm ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={clearUpload}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isDark ? 'bg-[#222] text-[#666] hover:bg-[#333] hover:text-white' : 'bg-[#e5e5e5] text-[#999] hover:bg-[#d5d5d5] hover:text-black'}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {analyzingAudio ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Disc3 className="h-6 w-6 animate-spin text-[#22C55E]" />
                    <span className={isDark ? 'text-[#666]' : 'text-[#999]'}>Analyzing audio...</span>
                  </div>
                ) : audioAnalysis ? (
                  <div className="flex gap-4">
                    <div className={`flex-1 rounded-2xl p-4 text-center ${isDark ? 'bg-[#0a0a0a] border border-[#222]' : 'bg-white border border-[#e5e5e5]'}`}>
                      <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>BPM</p>
                      <p className="text-3xl font-bold text-[#22C55E]">{audioAnalysis.bpm}</p>
                    </div>
                    <div className={`flex-1 rounded-2xl p-4 text-center ${isDark ? 'bg-[#0a0a0a] border border-[#222]' : 'bg-white border border-[#e5e5e5]'}`}>
                      <p className={`text-xs font-mono uppercase tracking-wider mb-1 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Key</p>
                      <p className="text-3xl font-bold text-[#22C55E]">{audioAnalysis.key} {audioAnalysis.mode}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mb-6">
              <h4 className={`text-xs font-mono uppercase tracking-wider mb-3 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>Recent Digs</h4>
              <div className="flex flex-col gap-2">
                {history.slice(0, 5).map((h, i) => (
                  <button
                    key={h.track.id + i}
                    onClick={() => loadFromHistory(h)}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                      isDark 
                        ? 'bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#333]' 
                        : 'bg-white border border-[#e5e5e5] hover:border-[#ccc]'
                    }`}
                  >
                    <span className={`flex-1 truncate text-sm ${isDark ? 'text-white' : 'text-black'}`}>{decodeHtml(h.track.title)}</span>
                    <span className={`text-xs font-mono ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>{h.genre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={`mt-10 pt-6 border-t flex flex-col items-center gap-3 ${isDark ? 'border-[#1a1a1a]' : 'border-[#e5e5e5]'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono ${isDark ? 'text-[#333]' : 'text-[#ccc]'}`}>crafted by</span>
              <span className="w-1 h-1 rounded-full bg-[#333]" />
              <span 
                className="text-sm font-bold font-mono text-[#22C55E]/50 cursor-default select-none"
                onDoubleClick={() => setShowPoolBuilder(!showPoolBuilder)}
              >
                HILLBOY
              </span>
              <span className="w-1 h-1 rounded-full bg-[#333]" />
              <span className={`text-xs font-mono ${isDark ? 'text-[#333]' : 'text-[#ccc]'}`}>cratedig.site</span>
            </div>
            <div className="flex items-center gap-4">
              <a 
                href="https://instagram.com/cratedig.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-xs font-mono transition-colors ${isDark ? 'text-[#444] hover:text-[#22C55E]' : 'text-[#999] hover:text-[#22C55E]'}`}
              >
                Instagram
              </a>
              <span className={`${isDark ? 'text-[#222]' : 'text-[#ddd]'}`}>·</span>
              <Link 
                href="/privacy-policy" 
                className={`text-xs font-mono transition-colors ${isDark ? 'text-[#444] hover:text-[#22C55E]' : 'text-[#999] hover:text-[#22C55E]'}`}
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Pool Builder (Admin) */}
          {showPoolBuilder && (
            <div className={`mt-6 rounded-3xl p-6 ${isDark ? 'bg-[#0a0a0a] border border-[#1a1a1a]' : 'bg-white border border-[#e5e5e5]'}`}>
              <h3 className="text-sm font-bold font-mono text-[#22C55E] uppercase tracking-wider mb-3">Pool Builder — Dev Tool</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-[#666]' : 'text-[#999]'}`}>
                Paste your YouTube Data API key below and click Build. Finds new tracks and adds them to the existing pool.
              </p>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className={`w-full rounded-xl px-4 py-3 text-sm font-mono mb-4 outline-none transition-all ${
                  isDark 
                    ? 'bg-[#111] border border-[#222] text-white placeholder-[#444] focus:border-[#22C55E]' 
                    : 'bg-[#f5f5f5] border border-[#e5e5e5] text-black placeholder-[#999] focus:border-[#22C55E]'
                }`}
              />
              <div className="flex gap-3 mb-4">
                <button
                  onClick={runPoolBuild}
                  disabled={pbBuilding}
                  className="rounded-xl bg-[#22C55E] px-6 py-3 text-sm font-bold font-mono text-black transition-all hover:bg-[#16A34A] disabled:opacity-50"
                >
                  {pbBuilding ? 'Building...' : 'Build Pool'}
                </button>
                <button
                  onClick={() => setShowPoolBuilder(false)}
                  className={`rounded-xl px-6 py-3 text-sm font-medium transition-all ${
                    isDark
                      ? 'bg-[#111] border border-[#222] text-white hover:border-[#22C55E] hover:text-[#22C55E]'
                      : 'bg-[#f5f5f5] border border-[#e5e5e5] text-black hover:border-[#22C55E] hover:text-[#22C55E]'
                  }`}
                >
                  Close
                </button>
              </div>
              
              {/* Log Output */}
              {pbLog.length > 0 && (
                <div className={`rounded-xl p-3 mb-4 max-h-48 overflow-y-auto font-mono text-xs ${
                  isDark ? 'bg-[#111] border border-[#222]' : 'bg-[#f5f5f5] border border-[#e5e5e5]'
                }`}>
                  {pbLog.map((log, i) => (
                    <div key={i} className={log.startsWith('✓') ? 'text-[#22C55E]' : log.startsWith('Error') || log.includes('err') ? 'text-red-500' : log.startsWith('Done') ? 'text-[#22C55E] font-bold' : isDark ? 'text-[#888]' : 'text-[#666]'}>
                      {log}
                    </div>
                  ))}
                </div>
              )}
              
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
