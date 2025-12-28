export const ANALYSIS_MENT_DB_EN = {
    // --- 1. Me vs Other Gender (Interaction) ---
    // [Me: Good] vs [Other: Bad(<30)] -> Survival Guide
    watch_out_other: [
        "You’re walking on sunshine, but the {otherGender}s in {region} are a literal thundercloud. Pro tip: Just nod, smile, and don't ask 'what's wrong.'",
        "Feeling great? Good for you. But the {otherGender} side is a ticking time bomb right now. Read the room before you speak. 🤫",
        "Your happiness might actually trigger them today. Keep your vibe low-key; it's a dangerous world out there for an optimist.",
        "Dark clouds over the {otherGender} camp. Your sunshine isn't strong enough to pierce their mood fortress today. Stay safe."
    ],

    // [Me: Bad] vs [Other: Bad(<30)] -> Shared Misery
    cheer_up_other: [
        "Different genders, same struggle. It seems all of {region} is under a collective cloud of gloom today. Misery loves company, right?",
        "You're not alone in the trenches. The {otherGender} stats are just as apocalyptic. Let’s find comfort in this shared chaos.",
        "Everyone’s soul is a bit crushed today, regardless of gender. The kindest thing you can do is pretend you didn't see each other.",
        "The vibe in {region} is officially cursed today. It’s not you—it’s just bad urban Feng Shui. Don’t take it personally!"
    ],

    // [Me: Good] vs [Other: Good(>70)] -> Golden Opportunity
    chance_other: [
        "You’re good, they’re good! Statistically, your success rate for basically anything social just jumped 200%. Go for it.",
        "The {otherGender} mood is sky-high! Combine that with your vibe, and {region} is guaranteed to be a party tonight. 🚀",
        "Perfect timing. If there’s a {otherGender} you’ve been meaning to talk to, do it now. They’re practically waiting for good news.",
        "Love and good vibes are in the air. Staying home on a day like this is a criminal waste of top-tier data!"
    ],

    // [Me: Bad] vs [Other: Good(>70)] -> Relative Deprivation
    envy_other: [
        "It’s a festival over there, but a rainstorm right here. If life feels unfair, treat yourself to the priciest dinner you can find. 🥂",
        "What are they so happy about? Their laughter is just white noise to your soul today. Block it out.",
        "Life’s a bit rude today, isn't it? They hit {otherScore}% happiness while you're down here. Put on your noise-canceling headphones and retreat.",
        "Is everyone on a date but you? Don't let their high energy get you down. Buy yourself a gift—you deserve it more than they do."
    ],

    // --- 2. Me vs Peer (Peer Dynamics) ---
    // [Me: Bad] vs [Peer: Bad(<30)] -> Comradeship
    peer_solidarity: [
        "We need to stick together. It seems every {gender} in {region} is having a collective breakdown today. 🤝",
        "It’s not just you. Our entire squad is painting the map 'Red.' Let’s just grab some comfort food and call it a day.",
        "Heads up, comrade. The data proves your depression is strictly a regional phenomenon. Don't let the stats win.",
        "Our gender's mood score is a tragic {myScore}%. This isn't personal; it's a local disaster. Hang in there."
    ],

    // [Me: Bad] vs [Peer: Good(>70)] -> The Black Sheep
    peer_black_sheep: [
        "Did everyone else win the lottery? You seem to be the only one left out of the party. Don't worry, your wave is coming.",
        "Everyone's having a blast but you. It stings, but just borrow some of their luck and shamelessly fake it 'til you make it.",
        "Feeling left behind? The data confirms it. But hey, an average is just a number. Finish the day at your own pace.",
        "Don't get swept up in their incomprehensible energy. Heal in silence and prepare for your comeback tomorrow."
    ],

    // [Me: Good] vs [Peer: Bad(<30)] -> Carrying the Team
    peer_captain: [
        "Your peers are wilting. You are the only oxygen tank in this entire sector. Time to carry the vibe! 🏃‍♂️",
        "A lone beacon of hope in our dark camp. Time to save your comrades with that annoying amount of positive energy you have.",
        "Everyone’s gloomy, but you’re literally glowing. Share the wealth. Maybe the first round of drinks is on you? 😉",
        "You are officially the Captain of the {gender} zone in {region} today. Lead your depressed colleagues back to the light!"
    ],

    // [Me: Good] vs [Peer: Good(>70)] -> Peak Harmony
    peer_harmony: [
        "Team 'All Green'! An impromptu gathering is mandatory today. It’s going to be legendary, trust the data.",
        "We are finally on the same wavelength. Score: {myScore}%! This kind of teamwork is practically unstoppable.",
        "What a day to be alive. Gather this collective firepower and go conquer every restaurant in {region}.",
        "Maximum vibes. Buy a lottery ticket, hit the gym, or start a business. The energy is exploding right now. 🔥"
    ],

    // --- 3. Me vs World (Regional Context) ---
    world_outlier_good: [
        "You are the sole survivor in this desolate {region}. Please keep that smile—you’re the only thing keeping the city's average up.",
        "The world is in grayscale, but you’re in 4K Technicolor. Your existence is the city's greatest comfort today.",
        "Everyone’s on edge, so watch your back. But your happiness is so unassailable, they can’t even touch your vibe."
    ],
    world_outlier_bad: [
        "Is it raining only on you? Don't force a smile. Protecting your 'me-time' is the only logical move for your mental health today.",
        "The world is a kaleidoscope, and you're just... not feeling it. Closing social media is highly recommended for your sanity.",
        "Poverty amidst plenty. Don't let others' happiness bruise your soul; go home early and let Netflix raise you."
    ],
    world_disaster: [
        "It's not you, the Feng Shui of {region} is just cursed today. Go home ASAP. Just breathing today is an achievement.",
        "Abort mission! {region} is filled with pure rage. It’s hell out there; evacuate to your blanket fort immediately. 🚩",
        "It’s like the opening scene of a disaster movie. Everyone is angry for no reason. Survival strategy: 'Aggressive Kindness.'"
    ],
    world_utopia: [
        "{region} is a flaw-free zone right now. A blessed day! Staying home is a criminal waste of precious data. Get out there!",
        "Is this heaven? Even strangers are being suspiciously kind. A miraculous day—don't let it go to waste. ✨",
        "Absolute perfection. Your positivity is resonating with the entire city. Enjoy it to the fullest while it lasts."
    ],

    // --- 4. Special Nudges (15% Chance) ---
    bad_sugar_rush: [
        "Are you actually sad, or is this just low blood sugar? Eat a donut and re-evaluate your life in 10 minutes. 🍩",
        "The 'Bad' button you just pressed... you didn't press it just because you're hungry, did you? Be honest."
    ],
    bad_debugger: [
        "Wait! Don't let a bad 5 minutes convince you that you've had a bad day. Your day is better than you think.",
        "Did you actually think about that choice, or was it just a reflex? Take a deep breath and try to find one good thing. 🧘‍♂️"
    ],
    good_gaslighting: [
        "By clicking 'Good,' you just boosted {region}’s happiness density by 0.01%. You're basically a local hero. 🌟",
        "That choice just made the city air 1% warmer. Look at you, being a literal ray of sunshine."
    ],
    speed_check: [
        "Whoa, 0.3 seconds? Did you even feel your feelings, or was that just muscle memory? Let's be real. 😉",
        "You clicked that faster than a reflex. Is this your mood or just your habit? Take a second to actually check in."
    ],
    deja_vu: [
        "Glitch in the matrix! You picked this exact mood at this exact time last week. Is your life on a loop? 🔄",
        "Exactly 7 days ago, you were in this same headspace. Your mood is surprisingly predictable. Creepy."
    ]
} as const;

export type ScenarioType = keyof typeof ANALYSIS_MENT_DB_EN;