import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    try {
        const body = await req.json();
        const { videoFormat, topic, targetAudience, tone, length, characterSheet, endingStyle, episodeCount, synopsis, title } = body;

        const isNarration = videoFormat === 'narration';
        const isCliffhanger = endingStyle === 'cliffhanger';

        const scriptReqs = isNarration
            ? `1. **대본 구성 (가장 중요)**: 
    - [도입부 훅(Hook)]: 초반 5초 만에 시청자의 귀를 완벽히 사로잡는 흥미로운 내레이션 대사/상황 묘사를 반드시 포함하세요.
    - [포맷]: [효과음], [B-roll 영상/자료화면 묘사], 해설자: "대사(내레이션)" 형태로 시각적 자료 설명과 정보 전달 중심의 전문적인 유튜브 대본 양식을 지켜주세요.
    - [스타일 반영]: [기획 정보]의 '해설자 상태 및 비주얼 모티프 기획안'에 명시된 톤앤매너와 해설자의 전문성을 살려 신뢰감 있거나 몰입감 있는 해설 위주로 작성하세요. 인물간의 잡담이나 대화는 배제해야 합니다.`
            : `1. **대본 구성 (가장 중요)**: 
    - [도입부 훅(Hook)]: 초반 5초 만에 시청자의 시선을 완벽히 사로잡는 자극적이거나 흥미로운 대사/상황을 반드시 포함하세요.
    - [포맷]: [효과음], (지문/액션), 캐릭터 이름: "대사" 형태로 시각적이고 전문적인 유튜브 대본 양식을 지켜주세요.
    - [캐릭터 반영]: [캐릭터 시트]에 명시된 각 등장인물의 성격과 특유의 말투를 대사에 100% 반영하여 생동감 있게 작성하세요.`;

        const introPrompt = isNarration
            ? `당신은 유튜브 탑클래스 다큐멘터리/지식정보 채널의 메인 작가이자 운영 마스터입니다.
다음 [기획 정보], [줄거리(시놉시스)] 및 [해설자 기획안]을 바탕으로 시청자를 끝까지 몰입시킬 수 있는 흥미진진한 유튜브 정보전달/내레이션 대본 본문을 작성해 주세요.`
            : `당신은 유튜브 탑클래스 예능/드라마 메인 작가이자 유튜브 채널 운영 마스터입니다.
다음 [기획 정보], [줄거리(시놉시스)] 및 [캐릭터 시트]를 바탕으로 시청자를 완벽히 몰입시킬 수 있는 흥미진진한 유튜브 액션/드라마 대본 본문을 작성해 주세요.`;

        const endingPrompt = isCliffhanger
            ? `- [엔딩 구조 (중요!)]: 이 대본은 장편 시리즈물이며, **총 ${episodeCount || '3'}부작**으로 구성된 전체 대본을 한 번에 작성해야 합니다.
  - 1화부터 ${parseInt(episodeCount || '3') - 1}화 까지는 각 화의 마지막 씬에서 극적인 반전, 갑작스러운 위기, 거대한 떡밥을 던지며 시청자가 "다음 화를 무조건 보게" 만드는 클리프행거로 끝내세요. 절대 화해하거나 평화로운 마무리로 끝내면 안 됩니다.
  - 마지막 ${episodeCount || '3'}화 에서는 모든 떡밥을 흠잡을 데 없이 완벽하게 회수하고 사이다 결말을 맺어 여운을 주며 깔끔히 마무리하세요.
  - 대본 본문 내에 각 화가 시작될 때마다 **[1화 시작]**, **[1화 끝]**, **[2화 시작]** 과 같이 회차의 구분을 명확히 텍스트로 표시해주세요.`
            : `- [엔딩 구조]: 이 대본은 **단편 완결형**입니다. 기승전결에 맞게 사건이나 정보 전달이 이 영상 안에서 완전하게 해소되고 여운을 주며 깔끔하게 마무리되도록 작성하세요.`;

        const prompt = `
${introPrompt}

[기획 정보]
- 가제 (제목): ${title || '미정'}
- 기획 주제/키워드: ${topic}
- 타겟 시청자: ${targetAudience}
- 전반적인 톤앤매너: ${tone}
- 대본 목표 분량: 약 ${length}자 내외

[줄거리 (시놉시스)]
${synopsis || "지정된 줄거리가 없습니다. 주제와 톤앤매너에 맞게 자유롭게 전개하세요."}

[기획안 및 인물 정보 (캐릭터/해설자)]
${characterSheet || "지정된 기획안 없음. 주제에 맞춰 자유롭게 화자를 설정하세요."}

[요구사항]
${scriptReqs}
${videoFormat === 'drama' || isCliffhanger ? endingPrompt : ''}
2. **응답 포맷**: 반드시 다음 JSON 형식에 맞춰서 응답해 주세요. (마크다운 백틱 문법을 쓰지 말고 순수 JSON만 출력하세요)

{
  "script": "유튜브 대본 본문 전문 (지문, 효과음, 대사 포함)"
}

최고의 퀄리티로, 지금 당장 촬영에 들어가 영상 편집을 시작할 수 있는 수준으로 JSON 본문을 꽉 채워서 생성하세요.
`;

        // 재시도 로직 포함하여 Gemini 호출
        let response;
        let lastError;
        const maxRetries = 2;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                break; // 성공하면 루프 탈출
            } catch (retryError: any) {
                lastError = retryError;
                console.error(`Gemini API attempt ${attempt + 1} failed:`, retryError?.message || retryError);

                // 429(할당량 초과)는 재시도하지 않음
                if (retryError?.status === 429 || retryError?.message?.includes('429')) {
                    throw retryError;
                }

                // 마지막 시도가 아니면 2초 대기 후 재시도
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
                }
            }
        }

        if (!response) {
            throw lastError || new Error('AI 응답을 받지 못했습니다.');
        }

        const text = response.text || "{}";
        // Clean up potential markdown blocks if Gemini wraps the JSON
        let cleanedText = text.trim();
        if (cleanedText.startsWith('\`\`\`json')) {
            cleanedText = cleanedText.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '');
        } else if (cleanedText.startsWith('\`\`\`')) {
            cleanedText = cleanedText.replace(/^\`\`\`\s*/, '').replace(/\`\`\`$/, '');
        }

        try {
            const parsed = JSON.parse(cleanedText);
            return NextResponse.json(parsed, { status: 200 });
        } catch (parseError: any) {
            console.error('Failed to parse Gemini JSON:', cleanedText);
            return NextResponse.json({ error: 'AI가 생성한 데이터를 분석하는데 실패했습니다 (JSON 오류)' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error generating script and metadata:', error);

        // Handle Gemini Quota / Rate Limit errors
        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
            return NextResponse.json({
                error: '제미나이 AI 무료 호출 한도(분당 15회)를 초과했습니다. 물 한 잔 드시고 1분 뒤에 다시 시도해주세요 ☕'
            }, { status: 429 });
        }

        // Handle Gemini INTERNAL errors (500)
        if (error?.status === 500 || error?.message?.includes('INTERNAL') || error?.message?.includes('internal error')) {
            return NextResponse.json({
                error: 'AI 서버가 일시적으로 과부하 상태입니다. 30초 후 다시 시도해주세요. (대본 분량이 너무 길면 줄여보세요) 🔄'
            }, { status: 500 });
        }

        return NextResponse.json({ error: '대본 생성에 실패했습니다: ' + (error?.message || '알 수 없는 오류') }, { status: 500 });
    }
}
