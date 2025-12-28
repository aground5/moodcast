export const ANALYSIS_MENT_DB_ES = {
    // --- 1. Yo vs. Otro Género (Interaction) ---
    // [Yo: Bien] vs [Otros: Mal(<30)] -> Guía de Supervivencia
    watch_out_other: [
        "Tú estás radiante, pero el sector de los {otherGender} en {region} es un campo de minas. Estrategia de hoy: sonríe, asiente y no preguntes «¿qué pasa?». 🤫",
        "¿De buen humor? ¡Qué envidia! Pero ojo, los {otherGender} son una bomba de tiempo ahora mismo. Lee bien el ambiente antes de abrir la boca. ^^;",
        "Tu sonrisa podría ser un insulto para ellos hoy. Mantén tu felicidad en perfil bajo; el mundo está peligroso para los optimistas ahí fuera.",
        "Nubes negras sobre el bando de los {otherGender}. Tu rayo de sol no será suficiente para derretir su fortaleza de mal humor hoy. ¡Cuidado!"
    ],

    // [Yo: Mal] vs [Otros: Mal(<30)] -> Miseria Compartida
    cheer_up_other: [
        "¿Géneros distintos, pero el mismo drama? Parece que todo {region} ha caído en una depresión colectiva. Al menos no estás solo en esto, ¿no? 🤝",
        "No eres el único en las trincheras. Las estadísticas de los {otherGender} son igual de apocalípticas. Busquemos consuelo en este caos compartido.",
        "Hoy todo el mundo tiene el alma un poco rota, sin importar el género. Lo mejor que puedes hacer es fingir que no has visto a nadie.",
        "La vibra en {region} está oficialmente maldita hoy. No eres tú, es solo un mal 'Feng Shui' urbano. ¡No te lo tomes como algo personal!"
    ],

    // [Yo: Bien] vs [Otros: Bien(>70)] -> Oportunidad de Oro
    chance_other: [
        "¡Tú bien, ellos bien! Estadísticamente, tu probabilidad de éxito en cualquier plan social acaba de subir un 200%. ¡A por todas! 🚀",
        "¡El humor de los {otherGender} está por las nubes! Suma eso a tu buena energía y {region} será una fiesta garantizada esta noche.",
        "Timing perfecto. Si hay alguien del grupo {otherGender} que te guste, lánzate ahora. Están en modo 'decir que sí' a todo.",
        "Amor y buena vibra en el aire. Quedarse en casa hoy es un pecado criminal contra los datos de primera categoría. ¡Sal ya! ✨"
    ],

    // [Yo: Mal] vs [Otros: Bien(>70)] -> Envidia Relativa
    envy_other: [
        "Ahí fuera es un festival, pero aquí dentro llueve. Si la vida te parece injusta, date el capricho de la cena más cara que encuentres. 🥂",
        "¿De qué se ríen tanto? La risa de los {otherGender} es solo ruido blanco para tu alma hoy. Ignóralos con estilo.",
        "El destino está un poco maleducado hoy, ¿verdad? Ellos con un {otherScore}% de felicidad y tú por los suelos. Ponte los cascos y aíslate.",
        "¿Todo el mundo tiene cita menos tú? No dejes que su energía te hunda. Cómprate un regalo; te lo mereces mucho más que ellos."
    ],

    // --- 2. Yo vs. Mi Grupo (Peer Dynamics) ---
    peer_solidarity: [
        "Tenemos que mantenernos unidos. Parece que todos los {gender} en {region} han tenido un colapso mental colectivo hoy. 🤝",
        "No es solo cosa tuya. Todo nuestro equipo está pintando el mapa de 'Rojo'. Vamos a por comida picante y olvidemos que este día existió.",
        "Arriba los corazones, camarada. Los datos demuestran que tu bajón es un fenómeno estrictamente regional. No dejes que las estadísticas ganen.",
        "El puntaje de humor de nuestro género es un trágico {myScore}%. No es algo personal, es un desastre local. ¡Resiste!"
    ],

    peer_black_sheep: [
        "¿Le ha tocado la lotería a todo el mundo menos a ti? Pareces ser el único fuera de la fiesta. Tranquilo, tu ola llegará pronto.",
        "Todos se lo están pasando bomba menos tú. Escuece, pero roba un poco de su suerte y finge hasta que te lo creas tú también. 😤",
        "¿Te sientes rezagado? Los datos lo confirman. Pero oye, una media es solo un número. Termina el día a tu propio ritmo.",
        "No te dejes arrastrar por esa energía incomprensible de los demás. Cúrate en silencio y prepara tu gran regreso para mañana."
    ],

    peer_captain: [
        "Tus compañeros se están marchitando. Eres el único tanque de oxígeno en todo este sector. ¡Es hora de liderar la vibra! 🏃‍♂️",
        "Un faro solitario en nuestro campamento oscuro. Hora de salvar a tus camaradas con esa (un poco molesta) energía positiva que tienes.",
        "Todos están sombríos, pero tú brillas literalmente. Comparte un poco de ese tesoro. ¿Quizás la primera ronda corre de tu cuenta? 😉",
        "Eres oficialmente el Capitán de la zona {gender} en {region} hoy. ¡Lleva a tus colegas deprimidos de vuelta a la luz!"
    ],

    peer_harmony: [
        "¡Equipo 'Todo Verde'! Quedada improvisada obligatoria hoy. Va a ser legendario, confía en los datos. ✨",
        "Por fin estamos en la misma sintonía. ¡Puntaje de {myScore}%! Este tipo de trabajo en equipo es prácticamente invencible.",
        "Qué día para estar vivo. Reúne toda esa potencia de fuego colectiva y ve a conquistar todos los restaurantes de {region}. 🔥",
        "Vibras al máximo. Compra lotería, ve al gimnasio o monta una startup. ¡La energía está a punto de explotar!"
    ],

    // --- 3. Yo vs. El Mundo (World Context) ---
    world_outlier_good: [
        "Eres el único superviviente en esta desolada {region}. Mantén esa sonrisa; eres lo único que mantiene alta la media de la ciudad.",
        "El mundo está en escala de grises, pero tú estás en Technicolor 4K. Tu existencia es el mayor consuelo de la ciudad hoy.",
        "Todo el mundo está de los nervios, así que vigila tus espaldas. Pero tu felicidad es tan inatacable que no pueden ni tocarte."
    ],

    world_outlier_bad: [
        "¿Solo llueve sobre ti? No fuerces la sonrisa. Proteger tu 'momento yo' es la única decisión lógica para tu salud mental hoy.",
        "El mundo es un caleidoscopio y tú... simplemente no lo sientes. Se recomienda cerrar las redes sociales por tu propia cordura.",
        "Pobreza en medio de la abundancia. No dejes que la felicidad ajena te hiera el alma; vete a casa pronto y deja que Netflix te consuele."
    ],

    world_disaster: [
        "No eres tú, el 'Feng Shui' de {region} está maldito hoy. Vete a casa cuanto antes. Respirar hoy ya es todo un logro. 🚩",
        "¡Abortar misión! {region} está lleno de pura rabia. Es el infierno ahí fuera; evacua a tu fuerte de mantas inmediatamente.",
        "Parece la escena inicial de una película de desastres. Todo el mundo está enfadado sin motivo. Estrategia: 'Amabilidad Agresiva'."
    ],

    world_utopia: [
        "¡{region} es una zona libre de fallos ahora mismo! Un día bendecido. Quedarse en casa es un desperdicio criminal de datos. ¡Sal! ✨",
        "¿Es esto el cielo? Hasta los desconocidos son sospechosamente amables. Un día milagroso; no dejes que se escape.",
        "Perfección absoluta. Tu positividad está resonando con toda la ciudad. Disfrútalo al máximo mientras dure."
    ],

    // --- 4. Nudges Especiales (Meta - 15% de probabilidad) ---
    bad_nudge: [
        "¿Estás triste de verdad o es solo una bajada de azúcar? Cómete un donut y vuelve a evaluar tu vida en 10 minutos. 🍩",
        "Ese botón de 'Mal' que acabas de pulsar... no lo habrás pulsado solo porque tienes hambre, ¿verdad? Sé sincero.",
        "¡Espera! No dejes que 5 minutos malos te convenzan de que has tenido un mal día. Tu día es mejor de lo que crees. 🧘‍♂️",
        "¿Has pensado de verdad esa elección o ha sido solo un reflejo? Respira hondo e intenta encontrar una sola cosa buena hoy."
    ]
} as const;

export type ScenarioType = keyof typeof ANALYSIS_MENT_DB_ES;