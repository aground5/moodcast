export const ANALYSIS_MENT_DB_FR = {
    // --- 1. Moi vs. Autre Sexe (Interaction) ---
    // [Me: Good] vs [Other: Bad(<30)] -> Guide de Survie
    watch_out_other: [
        "Vous êtes sur un petit nuage, mais les {otherGender}s de {region} sont en plein orage. Conseil d’ami : souriez, acquiescez et ne demandez surtout pas « qu'est-ce qui ne va pas ? ». 🤫",
        "Vous avez la pêche ? Tant mieux. Mais côté {otherGender}, c'est une bombe à retardement. Tâtez le terrain avant d'ouvrir la bouche. ^^;",
        "Votre bonheur pourrait presque les agacer aujourd'hui. Gardez votre 'vibe' discrète ; c'est un monde dangereux pour les optimistes là-bas.",
        "Nuages sombres sur le camp des {otherGender}. Votre soleil ne suffira pas à percer leur forteresse de mauvaise humeur aujourd'hui. Soyez prudent."
    ],

    // [Me: Bad] vs [Other: Bad(<30)] -> Misère Partagée
    cheer_up_other: [
        "Genres différents, même combat. Il semble que tout {region} soit sous une dépression collective. La misère aime la compagnie, non ? 🤝",
        "Vous n'êtes pas seul dans les tranchées. Les stats des {otherGender} sont tout aussi apocalyptiques. Trouvons du réconfort dans ce chaos partagé.",
        "Tout le monde a l'âme un peu brisée aujourd'hui, peu importe le genre. La chose la plus gentille à faire est de faire semblant de ne pas vous voir.",
        "L'ambiance à {region} est officiellement maudite aujourd'hui. Ce n'est pas vous, c'est juste le mauvais Feng Shui urbain. Ne le prenez pas personnellement !"
    ],

    // [Me: Good] vs [Other: Good(>70)] -> Opportunité en Or
    chance_other: [
        "Vous allez bien, ils vont bien ! Statistiquement, votre taux de réussite pour n'importe quelle interaction sociale vient de bondir de 200 %. Foncez ! 🚀",
        "L'humeur des {otherGender} est au zénith ! Combinez ça avec votre bonne humeur, et {region} sera une fête garantie ce soir.",
        "Timing parfait. S’il y a un(e) {otherGender} à qui vous vouliez parler, c’est maintenant. Ils n'attendent pratiquement que de bonnes nouvelles.",
        "L'amour et les bonnes ondes sont dans l'air. Rester chez soi un jour pareil est un gaspillage criminel de données de premier choix ! ✨"
    ],

    // [Me: Bad] vs [Other: Good(>70)] -> Privation Relative
    envy_other: [
        "C'est un festival là-bas, mais la pluie ici. Si la vie vous semble injuste, offrez-vous le dîner le plus cher possible. 🥂",
        "Qu'est-ce qui les rend si joyeux ? Leur rire n'est qu'un bruit de fond pour votre âme aujourd'hui. Ignorez-les.",
        "Le destin est un peu impoli aujourd'hui, n'est-ce pas ? Ils ont atteint {otherScore} % de bonheur alors que vous êtes au plus bas. Casque sur les oreilles et retraite stratégique.",
        "Tout le monde est en rendez-vous sauf vous ? Ne laissez pas leur énergie vous abattre. Achetez-vous un cadeau — vous le méritez plus qu'eux."
    ],

    // --- 2. Moi vs. Mon Groupe (Peer Dynamics) ---
    peer_solidarity: [
        "Nous devons rester unis. Il semble que chaque {gender} à {region} fasse une dépression collective aujourd'hui. 🤝",
        "Ce n'est pas seulement vous. Toute notre équipe peint la carte en 'Rouge'. Allons manger quelque chose de réconfortant et oublions cette journée.",
        "Haut les cœurs, camarade. Les données prouvent que votre déprime est strictement un phénomène régional. Ne laissez pas les stats gagner.",
        "Le score d'humeur de notre genre est un tragique {myScore} %. Ce n'est pas personnel, c'est un désastre local. Tenez bon !"
    ],

    peer_black_sheep: [
        "Est-ce que tout le monde a gagné au loto sauf vous ? Vous semblez être le seul laissé pour compte. Ne vous inquiétez pas, votre vague arrive.",
        "Tout le monde s'éclate sauf vous. Ça pique, mais empruntez un peu de leur chance et faites semblant jusqu'à ce que ça devienne vrai. 😤",
        "Vous vous sentez largué ? Les données le confirment. Mais bon, une moyenne n'est qu'un chiffre. Finissez la journée à votre rythme.",
        "Ne vous laissez pas emporter par leur énergie incompréhensible. Guérissez en silence et préparez votre retour triomphal pour demain."
    ],

    peer_captain: [
        "Vos pairs se fanent. Vous êtes la seule bouteille d'oxygène dans tout ce secteur. C'est le moment de porter la 'vibe' ! 🏃‍♂️",
        "Un phare solitaire dans notre camp sombre. Il est temps de sauver vos camarades avec cette dose (un peu agaçante) d'énergie positive que vous avez.",
        "Tout le monde est morose, mais vous rayonnez littéralement. Partagez votre richesse. Peut-être que la première tournée est pour vous ? 😉",
        "Vous êtes officiellement le Capitaine de la zone {gender} à {region} aujourd'hui. Ramenez vos collègues déprimés vers la lumière !"
    ],

    peer_harmony: [
        "Équipe 'Tout Vert' ! Un rassemblement improvisé est obligatoire aujourd'hui. Ça va être légendaire, faites confiance aux données. ✨",
        "Nous sommes enfin sur la même longueur d'onde. Score : {myScore} % ! Ce genre de travail d'équipe est pratiquement imbattable.",
        "Quelle journée incroyable. Rassemblez cette puissance de feu collective et allez conquérir tous les restaurants de {region}. 🔥",
        "Vibrations maximales. Achetez un billet de loterie, allez à la salle de sport ou lancez un business. L'énergie explose en ce moment !"
    ],

    // --- 3. Moi vs. Le Monde (World Context) ---
    world_outlier_good: [
        "Vous êtes le seul survivant dans ce {region} désolé. Gardez ce sourire — vous êtes le seul à maintenir la moyenne de la ville.",
        "Le monde est en nuances de gris, mais vous êtes en Technicolor 4K. Votre existence est le plus grand réconfort de la ville aujourd'hui.",
        "Tout le monde est à cran, alors surveillez vos arrières. Mais votre bonheur est si inattaquable qu'ils ne peuvent même pas toucher à votre 'vibe'."
    ],

    world_outlier_bad: [
        "Pleut-il seulement sur vous ? Ne forcez pas le sourire. Protéger votre 'me-time' est la seule décision logique pour votre santé mentale aujourd'hui.",
        "Le monde est un kaléidoscope, et vous... vous ne le sentez juste pas. Fermer les réseaux sociaux est hautement recommandé pour votre sérénité.",
        "La pauvreté au milieu de l'abondance. Ne laissez pas le bonheur des autres blesser votre âme ; rentrez tôt et laissez Netflix vous consoler."
    ],

    world_disaster: [
        "Ce n'est pas vous, le Feng Shui de {region} est juste maudit aujourd'hui. Rentrez chez vous ASAP. Juste respirer aujourd'hui est un exploit. 🚩",
        "Abandonnez la mission ! {region} est rempli d'une rage pure. C'est l'enfer dehors ; évacuez vers votre fort de couvertures immédiatement.",
        "On dirait la scène d'ouverture d'un film catastrophe. Tout le monde est en colère sans raison. Stratégie de survie : 'Gentillesse Agressive'."
    ],

    world_utopia: [
        "{region} est une zone sans défaut en ce moment. Une journée bénie ! Rester à la maison est un gaspillage criminel de données précieuses. Sortez ! ✨",
        "Est-ce le paradis ? Même les inconnus sont louablement gentils. Une journée miraculeuse — ne la laissez pas passer.",
        "Perfection absolue. Votre positivité résonne avec toute la ville. Profitez-en au maximum tant que ça dure."
    ],

    // --- 4. Nudges Spéciaux (Meta - 15 % de chance) ---
    bad_nudge: [
        "Êtes-vous vraiment triste, ou est-ce juste une hypoglycémie ? Mangez un éclair au chocolat et réévaluez votre vie dans 10 minutes. 🍫",
        "Le bouton 'Mauvais' sur lequel vous venez d'appuyer... vous n'avez pas cliqué juste parce que vous avez faim, n'est-ce pas ? Soyez honnête.",
        "Attendez ! Ne laissez pas 5 mauvaises minutes vous convaincre que vous avez passé une mauvaise journée. Votre journée est meilleure que vous ne le pensez. 🧘‍♂️",
        "Avez-vous vraiment réfléchi à ce choix, ou était-ce juste un réflexe ? Prenez une grande inspiration et essayez de trouver une seule bonne chose."
    ]
} as const;

export type ScenarioType = keyof typeof ANALYSIS_MENT_DB_FR;