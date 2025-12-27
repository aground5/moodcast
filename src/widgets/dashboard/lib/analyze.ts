export const analyzeMood = (gender: 'male' | 'female', mood: 'good' | 'bad', region: string) => {
    const templates = {
        male_good: [
            `오늘 ${region} 남자들 표정이 밝네요. 로또라도 당첨된 걸까요?`,
            `기분이 좋으시군요! 오늘 ${region}의 분위기 메이커는 바로 당신입니다.`,
        ],
        male_bad: [
            `오늘 ${region} 남자들은 다들 화가 나 있네요. 말 한마디도 조심하는 게 상책!`,
            `저기압이네요. 고기앞으로 가시는 건 어떨까요? 힘내세요!`,
        ],
        female_good: [
            `오늘 ${region} 여자분들 컨디션 최상이네요! 거리에 꽃이 핀 것 같아요.`,
            `기분 좋은 하루! 당신의 미소가 ${region}를 밝히고 있습니다.`,
        ],
        female_bad: [
            `오늘 ${region} 여자분들 건드리면 큰일나요. 조심조심...`,
            `기분이 별로시군요. 달달한 디저트로 기분 전환 어떠세요?`,
        ]
    };

    const key = `${gender}_${mood}` as keyof typeof templates;
    const messages = templates[key];
    return messages[Math.floor(Math.random() * messages.length)];
};
