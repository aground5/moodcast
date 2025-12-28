export const ANALYSIS_MENT_DB_DE = {
    // --- 1. Ich vs. Anderes Geschlecht (Interaktion) ---
    // [Me: Good] vs [Other: Bad(<30)] -> Überlebensstrategie
    watch_out_other: [
        "Du strahlst wie die Sonne, aber die {otherGender} in {region} sind gerade ein wandelndes Gewitter. Heute gilt: Lächeln, nicken und bloß nicht nach dem ‚Warum‘ fragen. 🤫",
        "Gute Laune? Schön für dich. Aber bei den {otherGender} herrscht gerade Explosionsgefahr. Lies den Raum, bevor du den Mund aufmachst. ^^;",
        "Dein Grinsen könnte heute als Provokation missverstanden werden. Behalte dein Glück lieber für dich – es ist da draußen gerade gefährlich für Optimisten.",
        "Dunkle Wolken über dem Lager der {otherGender}. Dein Sonnenschein wird heute nicht ausreichen, um deren Festung der schlechten Laune zu stürmen."
    ],

    // [Me: Bad] vs [Other: Bad(<30)] -> Gemeinsames Elend
    cheer_up_other: [
        "Verschiedene Geschlechter, gleicher Frust. Scheinbar liegt ganz {region} unter einer kollektiven Käseglocke. Geteiltes Leid ist halbes Leid, oder? 🤝",
        "Du bist nicht allein im Schützengraben. Die Statistiken der {otherGender} sehen genauso apokalyptisch aus. Suchen wir Trost im gemeinsamen Chaos.",
        "Heute sind alle Seelen ein wenig zertrümmert, egal welches Geschlecht. Das Beste, was du tun kannst: So tun, als hättest du niemanden gesehen.",
        "Der Vibe in {region} ist heute offiziell verflucht. Es liegt nicht an dir – es ist einfach schlechtes Stadt-Feng-Shui. Nimm es nicht persönlich!"
    ],

    // [Me: Good] vs [Other: Good(>70)] -> Goldene Gelegenheit
    chance_other: [
        "Dir geht’s gut, denen geht’s gut! Statistisch gesehen ist deine Erfolgsquote für alles Soziale gerade um 200 % gestiegen. Nutze es! 🚀",
        "Die Stimmung bei den {otherGender} ist auf dem Höhepunkt! Kombiniere das mit deinem Vibe und {region} wird heute Nacht garantiert zur Partyzone.",
        "Perfektes Timing. Wenn du jemanden vom {otherGender} beeindrucken willst, dann jetzt. Sie warten praktisch nur auf gute Nachrichten.",
        "Liebe und Endorphine liegen in der Luft. An so einem Tag zu Hause zu bleiben, wäre eine kriminelle Verschwendung erstklassiger Daten!"
    ],

    // [Me: Bad] vs [Other: Good(>70)] -> Relative Deprivation
    envy_other: [
        "Da drüben ist Festival, hier ist Regenfront. Wenn sich das Leben unfair anfühlt, gönn dir das teuerste Abendessen, das du finden kannst. 🥂",
        "Warum sind die alle so glücklich? Das Lachen der {otherGender} ist heute nur weißes Rauschen für deine Seele. Einfach ignorieren.",
        "Das Schicksal ist heute ein wenig unhöflich, oder? Sie haben {otherScore} % Glück erreicht, während du am Boden bist. Kopfhörer auf und Rückzug.",
        "Sind heute alle auf einem Date, außer dir? Lass dich nicht von deren Energie runterziehen. Kauf dir selbst ein Geschenk – du hast es mehr verdient als die."
    ],

    // --- 2. Ich vs. Eigene Gruppe (Peer Dynamics) ---
    peer_solidarity: [
        "Wir müssen zusammenhalten. Es scheint, als hätten alle {gender} in {region} heute einen kollektiven Nervenzusammenbruch. 🤝",
        "Es liegt nicht nur an dir. Unser ganzes Team färbt die Karte gerade ‚Tiefrot‘. Lass uns einfach Frustessen organisieren und den Tag abhaken.",
        "Kopf hoch, Kamerad. Die Daten beweisen: Deine Depression ist heute ein rein regionales Phänomen. Lass die Statistik nicht gewinnen.",
        "Unser Stimmungs-Score liegt bei tragischen {myScore} %. Das ist nichts Persönliches, das ist eine lokale Katastrophe. Halte durch!"
    ],

    peer_black_sheep: [
        "Haben alle anderen im Lotto gewonnen? Du scheinst der Einzige zu sein, der nicht zur Party eingeladen wurde. Keine Sorge, deine Welle kommt noch.",
        "Alle haben Spaß, nur du nicht. Es sticht ein bisschen, aber leih dir einfach ein Stück von deren Glück und ‚fake it until you make it‘. 😤",
        "Gefühl, abgehängt zu sein? Die Daten bestätigen es. Aber hey, ein Durchschnitt ist nur eine Zahl. Beende den Tag in deinem eigenen Tempo.",
        "Lass dich nicht von dieser unverständlichen Euphorie der anderen mitreißen. Heile in Ruhe und bereite dein Comeback für morgen vor."
    ],

    peer_captain: [
        "Deine Leute lassen die Köpfe hängen. Du bist der einzige Sauerstofftank in diesem Sektor. Zeit, den Vibe zu retten! 🏃‍♂️",
        "Ein einsames Leuchtfeuer in unserem dunklen Lager. Zeit, deine Kameraden mit deiner (vielleicht nervigen) positiven Energie zu retten.",
        "Alle sind düster, aber du strahlst buchstäblich. Teile deinen Reichtum. Vielleicht geht die erste Runde Drinks auf dich? 😉",
        "Du bist heute offiziell der Captain der {gender}-Zone in {region}. Führe deine deprimierten Kollegen zurück ans Licht!"
    ],

    peer_harmony: [
        "Team ‚Alles Grün‘! Ein spontanes Treffen ist heute Pflicht. Das wird legendär – vertrau den Daten. ✨",
        "Wir sind endlich auf der gleichen Wellenlänge. Score: {myScore} %! Dieses Teamwork ist praktisch unaufhaltsam.",
        "Was für ein Tag. Sammle diese kollektive Feuerkraft und erobere jedes Restaurant in {region}. 🔥",
        "Maximale Energie. Kauf ein Lotterielos, geh ins Fitnessstudio oder gründe ein Startup. Die Power muss irgendwo hin!"
    ],

    // --- 3. Ich vs. Die Welt (World Context) ---
    world_outlier_good: [
        "Du bist der einzige Überlebende in diesem trostlosen {region}. Bitte bewahre dir dieses Lächeln – du hältst den Stadtdurchschnitt allein oben.",
        "Die Welt ist in Graustufen, aber du bist in 4K Technicolor. Deine Existenz ist heute der größte Trost für diese Stadt.",
        "Alle sind gereizt, also pass auf deinen Rücken auf. Aber dein Glück ist so unantastbar, dass sie deinem Vibe nichts anhaben können."
    ],

    world_outlier_bad: [
        "Regnet es nur über dir? Erzwinge kein Lächeln. Deinen ‚Me-Time‘-Modus zu schützen, ist heute die einzig logische Entscheidung.",
        "Die Welt ist ein Kaleidoskop, und du fühlst es einfach nicht. Social Media zu ignorieren wird heute dringend für deine geistige Gesundheit empfohlen.",
        "Armut inmitten von Überfluss. Lass dich nicht vom Glück der anderen verletzen; geh früh nach Hause und lass dich von Netflix trösten."
    ],

    world_disaster: [
        "Es liegt nicht an dir, das Feng-Shui von {region} ist heute einfach verflucht. Geh so schnell wie möglich nach Hause. Atmen ist heute schon eine Leistung. 🚩",
        "Mission abbrechen! {region} ist voller Wut. Da draußen ist die Hölle; evakuiere dich sofort in deine Festung aus Decken und Kissen.",
        "Wie die Anfangsszene eines Katastrophenfilms. Alle sind ohne Grund wütend. Überlebensstrategie: ‚Aggressive Freundlichkeit‘."
    ],

    world_utopia: [
        "{region} ist gerade eine fehlerfreie Zone. Ein gesegneter Tag! Zu Hause zu bleiben ist eine kriminelle Verschwendung von Daten. Geh raus! ✨",
        "Ist das der Himmel? Sogar Fremde sind verdächtig nett. Ein wunderbarer Tag – lass ihn nicht ungenutzt verstreichen.",
        "Absolute Perfektion. Deine Positivität resoniert mit der ganzen Stadt. Genieße es in vollen Zügen, solange es anhält."
    ],

    // --- 4. Spezielle Nudges (Meta - 15 % Wahrscheinlichkeit) ---
    bad_sugar_rush: [
        "Bist du wirklich traurig oder hast du einfach nur Hunger? Iss einen Donut und überdenke dein Leben in 10 Minuten noch einmal. 🍩",
        "Der ‚Schlecht‘-Button, den du gerade gedrückt hast... hast du den nur gedrückt, weil du ‚hangry‘ bist? Sei ehrlich."
    ],
    bad_debugger: [
        "Warte! Lass dir von 5 schlechten Minuten nicht einreden, dass du einen schlechten Tag hattest. Dein Tag ist besser, als du denkst. 🧘‍♂️",
        "War das gerade eine bewusste Wahl oder nur ein Reflex? Atme tief durch und versuche, eine einzige gute Sache an heute zu finden."
    ],
    good_gaslighting: [
        "Indem du auf ‚Gut‘ geklickt hast, hast du die Glücksdichte von {region} um 0,01 % gesteigert. Du bist praktisch ein lokaler Held. 🌟",
        "Diese Wahl hat die Stadtluft gerade um 1 Grad wärmer gemacht. Schau dich an, du wandelnder Sonnenschein."
    ],
    speed_check: [
        "Hoppla, 0,3 Sekunden? Hast du deine Gefühle überhaupt gespürt oder war das nur Muskelgedächtnis? Sei ehrlich zu dir selbst. 😉",
        "Du hast schneller geklickt, als dein Gehirn denken kann. Ist das deine echte Laune oder nur Gewohnheit? Halt kurz inne."
    ],
    deja_vu: [
        "Glitch in der Matrix! Du hast exakt diese Laune zur exakt gleichen Zeit letzte Woche gewählt. Läuft dein Leben in einer Schleife? 🔄",
        "Genau vor 7 Tagen warst du in der gleichen Stimmung. Deine Laune ist erschreckend vorhersehbar. Fast schon gruselig."
    ]
} as const;

export type ScenarioType = keyof typeof ANALYSIS_MENT_DB_DE;