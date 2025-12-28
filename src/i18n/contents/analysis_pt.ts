export const ANALYSIS_MENT_DB_PT = {
    // --- 1. Eu vs. Outro Gênero (Interação) ---
    // [Me: Good] vs [Other: Bad(<30)] -> Guia de Sobrevivência
    watch_out_other: [
        "Você está radiante, mas a área dos {otherGender} em {region} é um campo minado agora. Estratégia de hoje: sorria, concorde e não pergunte 'o que houve?'. 🤫",
        "De bom humor? Que inveja! Mas cuidado, o lado {otherGender} é uma bomba-relógio no momento. Sinta o clima antes de abrir a boca. ^^;",
        "Seu sorriso pode ser um gatilho para eles hoje. Mantenha sua felicidade em 'modo discreto'; o mundo está perigoso para os otimistas lá fora.",
        "Nuvens pesadas sobre o bando dos {otherGender}. Seu raio de sol não será suficiente para derreter a fortaleza de mau humor deles hoje. Cuidado!"
    ],

    // [Me: Bad] vs [Other: Bad(<30)] -> Miséria Compartilhada
    cheer_up_other: [
        "Gêneros diferentes, mas o mesmo drama? Parece que toda {region} caiu em uma depressão coletiva. Pelo menos você não está só nessa, né? 🤝",
        "Você não é o único nas trincheiras. As estatísticas dos {otherGender} são igualmente apocalípticas. Vamos encontrar consolo nesse caos compartilhado.",
        "Hoje todo mundo está com a alma um pouco moída, não importa o gênero. O melhor a fazer é fingir que não viu ninguém e seguir o baile.",
        "A vibe em {region} está oficialmente amaldiçoada hoje. Não é você, é apenas um 'Feng Shui' urbano ruim. Não leve para o lado pessoal!"
    ],

    // [Me: Good] vs [Other: Good(>70)] -> Oportunidade de Ouro
    chance_other: [
        "Você bem, eles bem! Estatisticamente, sua chance de sucesso em qualquer plano social acabou de subir 200%. Vai com tudo! 🚀",
        "O humor dos {otherGender} está nas nuvens! Junte isso à sua boa energia e {region} será uma festa garantida hoje à noite.",
        "Timing perfeito. Se tem alguém do grupo {otherGender} que você gosta, fale agora. Estão em modo 'sim' para tudo hoje.",
        "Amor e boa vibe no ar. Ficar em casa hoje é um pecado contra os dados de primeira classe. Sai logo dessa sala! ✨"
    ],

    // [Me: Bad] vs [Other: Good(>70)] -> Inveja Relativa
    envy_other: [
        "Lá fora é um festival, mas aqui dentro chove. Se a vida parece injusta, se dê o luxo do jantar mais caro que puder encontrar hoje. 🥂",
        "Do que eles estão rindo tanto? A risada dos {otherGender} é apenas ruído branco para sua alma hoje. Ignore com classe.",
        "O destino está meio mal-educado hoje, né? Eles com {otherScore}% de felicidade e você no fundo do poço. Coloque os fones e se isole.",
        "Todo mundo tem um encontro menos você? Não deixe a energia deles te derrubar. Compre um presente para si mesmo; você merece mais que eles."
    ],

    // --- 2. Eu vs. Meu Grupo (Dinâmica de Pares) ---
    peer_solidarity: [
        "Precisamos nos manter unidos. Parece que todos os {gender} em {region} tiveram um colapso mental coletivo hoje. 🤝",
        "Não é só com você. Nosso time inteiro está pintando o mapa de 'Ruim'. Vamos comer algo bem gostoso e esquecer que este dia existiu.",
        "Levanta essa cabeça, camarada. Os dados provam que seu desânimo é um fenômeno puramente regional. Não deixe a estatística vencer.",
        "A pontuação de humor do nosso gênero é um trágico {myScore}%. Isso não é pessoal, é um desastre local. Resista!"
    ],

    peer_black_sheep: [
        "Todo mundo ganhou na loteria menos você? Parece que você é o único fora da festa. Calma, sua onda vai chegar logo.",
        "Todos estão se divertindo menos você. Dói, mas pegue um pouco da sorte deles emprestada e finja até acreditar. 😤",
        "Se sentindo deixado para trás? Os dados confirmam. Mas olha, uma média é apenas um número. Termine o dia no seu próprio ritmo.",
        "Não se deixe levar por essa energia incompreensível dos outros. Se cure em silêncio e prepare sua grande volta para amanhã."
    ],

    peer_captain: [
        "Seus companheiros estão murchando. Você é o único tanque de oxigênio em todo este setor. Hora de liderar a vibe! 🏃‍♂️",
        "Um farol solitário no nosso acampamento escuro. Hora de salvar seus camaradas com essa sua energia positiva (um pouco irritante).",
        "Todos estão sombrios, mas você brilha literalmente. Compartilha um pouco desse tesouro. Talvez a primeira rodada seja por sua conta? 😉",
        "Você é oficialmente o Capitão da zona {gender} em {region} hoje. Leve seus colegas deprimidos de volta para a luz!"
    ],

    peer_harmony: [
        "Time 'Tudo Verde'! Encontro improvisado obrigatório hoje. Vai ser lendário, confia nos dados. ✨",
        "Finalmente estamos na mesma sintonia. Pontuação de {myScore}%! Esse tipo de trabalho em equipe é praticamente invencível.",
        "Que dia para estar vivo! Reúna toda essa potência de fogo coletiva e vá conquistar todos os restaurantes de {region}. 🔥",
        "Vibração máxima. Compre loteria, vá à academia ou monte uma startup. A energia está prestes a explodir!"
    ],

    // --- 3. Eu vs. O Mundo (Contexto Regional) ---
    world_outlier_good: [
        "Você é o único sobrevivente nesta {region} desolada. Mantenha esse sorriso; você é a única coisa mantendo a média da cidade alta.",
        "O mundo está em escala de cinza, mas você está em Technicolor 4K. Sua existência é o maior consolo da cidade hoje.",
        "Todo mundo está com os nervos à flor da pele, então cuide das suas costas. Mas sua felicidade é tão inabalável que ninguém te toca."
    ],

    world_outlier_bad: [
        "Só chove em cima de você? Não force o sorriso. Proteger seu 'momento eu' é a única decisão lógica para sua saúde mental hoje.",
        "O mundo é um caleidoscópio e você... simplesmente não sente nada. Fechar as redes sociais é altamente recomendável hoje.",
        "Pobreza em meio à abundância. Não deixe a felicidade alheia ferir sua alma; vá para casa cedo e deixe a Netflix te consolar."
    ],

    world_disaster: [
        "Não é você, o 'Feng Shui' de {region} está amaldiçoado hoje. Vá para casa o mais rápido possível. Respirar hoje já é uma vitória. 🚩",
        "Abortar missão! {region} está cheia de pura raiva. É o inferno lá fora; evacue para o seu forte de cobertas imediatamente.",
        "Parece a cena inicial de um filme de desastre. Todo mundo está bravo sem motivo. Estratégia: 'Gentileza Agressiva'."
    ],

    world_utopia: [
        "{region} é uma zona livre de falhas agora! Um dia abençoado. Ficar em casa é um desperdício criminoso de dados. Sai já! ✨",
        "Isso é o céu? Até os desconhecidos estão suspeitamente amáveis. Um dia milagroso; não deixe ele escapar por nada.",
        "Perfeição absoluta. Sua positividade está ressoando com a cidade inteira. Aproveite ao máximo enquanto dura."
    ],

    // --- 4. Nudges Especiais (Meta - 15% de chance) ---
    bad_nudge: [
        "Você está triste de verdade ou é só fome? Come um brigadeiro e avalia sua vida de novo daqui a 10 minutos. 🍫",
        "Esse botão de 'Ruim' que você acabou de apertar... você não apertou só porque está com fome, né? Seja sincero.",
        "Espera! Respira fundo por 1 minuto e pensa de novo. É realmente tão ruim assim?",
        "Talvez seja só falta de sono? Uma boa noite de descanso vai consertar tudo hoje."
    ]
} as const;

export type ScenarioType = keyof typeof ANALYSIS_MENT_DB_PT;