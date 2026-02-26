import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { videoFormat, topic, targetAudience, tone, synopsis, title, length, episodeCount, endingStyle, visualStyle, lighting } = body;

        const isNarration = videoFormat === 'narration';

        // ====== 영상 길이 × 편수 기반 등장인물 수 가이드라인 ======
        const videoLength = parseInt(length || '10000');
        const episodes = parseInt(episodeCount || '1');
        const totalScale = videoLength * episodes; // 총 대본 분량

        let characterCountGuide = '';
        if (!isNarration) {
            // 장르별 기본 인물 성향
            const genreHints: Record<string, string> = {
                'romance': '로맨스 장르이므로 주인공 커플 중심 + 주변 인물(친구, 라이벌) 위주로 구성하세요.',
                'thriller': '스릴러/서스펜스 장르이므로 용의자, 목격자 등 긴장감을 높이는 인물들을 배치하세요.',
                'horror': '호러 장르이므로 공포를 겪는 인물들과 미스터리한 존재를 함께 구성하세요.',
                'mystery': '미스터리/추리 장르이므로 탐정 역할, 용의자 후보들, 피해자 등 다양한 입장의 인물이 필요합니다.',
                'sci-fi': 'SF 장르이므로 과학자, AI, 미래 인물 등 세계관에 맞는 캐릭터를 구성하세요.',
                'fantasy': '판타지/무협 장르이므로 동료, 적대 세력, 조언자 등 모험에 필요한 인물을 배치하세요.',
                'history': '역사/사극 장르이므로 실제 인물 모티프나 시대에 맞는 계급/직책 인물을 구성하세요.',
                'action': '액션/느와르 장르이므로 주인공, 적대 세력 리더, 조력자 등 핵심 대결 구도를 만드세요.',
                'comedy': '코미디 장르이므로 개성 강한 캐릭터들의 케미가 중요합니다.',
                'family': '가족/휴먼 드라마이므로 가족 구성원이나 이웃, 직장 동료 등을 구성하세요.',
                'fairytale': '동화/애니메이션이므로 주인공, 도우미 동물/마법사, 악당 등 전형적 구조를 따르세요.',
                'anecdote': '썰툰/사연 기반이므로 사연의 당사자와 주변 인물 위주로 구성하세요.',
                'music-video': '뮤직비디오 세계관이므로 상징적이고 비주얼이 강렬한 인물 위주로 구성하세요.',
            };

            const genreHint = genreHints[topic] || '';

            // 총 분량 기반 인원 가이드
            let minChars: number, maxChars: number, recommendNote: string;

            if (totalScale <= 3000) {
                // 1~3분 × 1편
                minChars = 1; maxChars = 2;
                recommendNote = '아주 짧은 영상이므로 주인공 1명 + 상대역 1명 정도면 충분합니다.';
            } else if (totalScale <= 5000) {
                // 5분 × 1편
                minChars = 2; maxChars = 3;
                recommendNote = '짧은 영상이므로 핵심 인물 2~3명으로 압축하세요.';
            } else if (totalScale <= 10000) {
                // 10분 × 1편
                minChars = 3; maxChars = 4;
                recommendNote = '10분 단편이므로 주인공 + 핵심 조연 1~2명이 적절합니다.';
            } else if (totalScale <= 20000) {
                // 10분 × 2편 또는 20분 × 1편
                minChars = 4; maxChars = 6;
                recommendNote = '2편 분량이므로 서브플롯이 가능합니다. 핵심 인물 4~6명이 적정합니다.';
            } else if (totalScale <= 50000) {
                // 10분 × 3~5편
                minChars = 5; maxChars = 7;
                recommendNote = '시리즈물이므로 갈등 구조가 복잡해집니다. 주연 2~3명 + 조연 3~4명이 적정합니다.';
            } else {
                // 10분 × 5편 이상 또는 30분 × 여러편
                minChars = 6; maxChars = 8;
                recommendNote = '대규모 시리즈이지만 유튜브 특성상 8명을 넘기면 시청자가 헷갈립니다. 최대 8명까지만 구성하세요.';
            }

            characterCountGuide = `
[등장인물 수 가이드라인 - 매우 중요!]
- 영상 길이: 약 ${(videoLength / 1000).toFixed(0)}분 분량
- 편수: ${episodes}편 (${endingStyle === 'cliffhanger' ? '시리즈물 (클리프행어 구조)' : '단편 완결형'})
- 총 대본 규모: 약 ${totalScale.toLocaleString()}자
- ${genreHint}
- 📌 적정 등장인물 수: **최소 ${minChars}명 ~ 최대 ${maxChars}명**
- 📌 ${recommendNote}
- ⚠️ 유튜브 영상 특성상 아무리 편수가 많아도 주요 등장인물이 **8명을 절대 넘지 마세요**. 시청자가 인물 파악이 어려워집니다.
- 각 인물에게는 명확한 역할(주인공, 조력자, 반동인물, 관찰자 등)을 부여하세요.
`;
        }

        const characterReqs = isNarration
            ? `각 항목마다 반드시 다음 내용들을 구체적으로 작성해 주세요 (내레이션/정보전달/다큐 형식에 맞게):
1. 기본 정보 (해설자/내레이터의 이름, 나이, 성별, 직업/전문성, 보이스 톤)
2. 시나리오 내 역할 (이 해설자가 영상 전체를 어떤 시각으로 이끌어 갈 것인지)
3. 시각적 메인 모티프 (영상 전반에 깔릴 1~2개의 핵심적인 풍경, 사물, 혹은 추상적 분위기에 대한 묘사)
4. 해설자의 외모 묘사 (실제 화면에 등장할 경우를 대비한 구체적인 인상착의 및 스타일링)
5. 종합적인 영상의 인상 (전체적인 조명, 색감, 느낌)`
            : `각 캐릭터마다 반드시 다음 항목들을 구체적으로 포함해서 마크다운 형식으로 작성해 주세요:
1. 기본 정보 (이름, 나이, 성별, 직업/역할, 핵심 성격 키워드)
2. 시나리오 내 역할 (이 캐릭터가 영상에서 어떤 역할을 할 것인지 간략히)
3. 얼굴 구조 (얼굴형, 눈, 코, 입, 특징 등)
4. 헤어 스타일 (색상, 길이, 스타일)
5. 의상 및 악세사리 (기본 착장, 주요 아이템)
6. 종합적인 인상 (외모에서 풍기는 전체적인 분위기)`;

        const introPrompt = isNarration
            ? `당신은 최고의 영상 콘텐츠 기획자이자 스토리보드 디렉터입니다.
제공된 [기획 정보] 및 [줄거리(시놉시스)]를 바탕으로, 내레이터 중심의 영상에 어울리는 '핵심 해설자 상태 및 비주얼 모티프 기획안'을 매력적으로 구성해 주세요.`
            : `당신은 최고의 영상 콘텐츠 기획자이자 캐릭터 디자이너입니다.
제공된 [기획 정보], [줄거리(시놉시스)], 그리고 [등장인물 수 가이드라인]을 바탕으로, 이 이야기 속에 등장시켜 극을 이끌어갈 '핵심 등장인물들의 캐릭터 시트(Character Sheet)'를 기획해 주세요.
반드시 아래 [등장인물 수 가이드라인]에 명시된 인원수 범위를 지켜주세요. 이야기의 밀도와 규모를 분석하여 가이드라인 범위 안에서 가장 적합한 인물 수를 결정하세요.`;

        const prompt = `
${introPrompt}

[기획 정보]
- 가제 (제목): ${title || '미정'}
- 기획 주제/키워드: ${topic}
- 타겟 시청자: ${targetAudience}
- 전반적인 톤앤매너: ${tone}
- 🎨 핵심 화풍 (Visual Style): ${visualStyle || '미지정'}
- 💡 메인 조명 (Lighting): ${lighting || '미지정'}

[줄거리 (시놉시스)]
${synopsis || '지정된 줄거리가 없습니다. 주제에 맞게 자유롭게 설정하세요.'}

${characterCountGuide}

[요구사항]
${characterReqs}

*주의: 각 캐릭터/외모 정보는 나중에 이미지 생성 AI(미드저니 등) 프롬프트를 짤 때 바로 쓸 수 있을 정도로 시각적이고 구체적인 묘사 위주로 자세하게 작성해 주세요.
* 반드시 위에 명시된 [핵심 화풍]과 [메인 조명]에 어울리는 분위기로 캐릭터의 의상, 색감, 인상을 설계하세요. 예를 들어 사이버펑크 화풍이면 미래적인 의상, 지브리 스타일이면 따뜻한 톤의 캐주얼 의상 등.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const characterSheet = response.text || "캐릭터 시트 생성에 실패했습니다.";

        return NextResponse.json({ characterSheet }, { status: 200 });
    } catch (error: any) {
        console.error('Error generating character sheet:', error);

        // Handle Gemini Quota / Rate Limit errors
        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
            return NextResponse.json({
                error: '제미나이 AI 무료 호출 한도(분당 15회)를 초과했습니다. 물 한 잔 드시고 1분 뒤에 다시 시도해주세요 ☕'
            }, { status: 429 });
        }

        return NextResponse.json({ error: '캐릭터 시트 생성에 실패했습니다: ' + (error?.message || '알 수 없는 오류') }, { status: 500 });
    }
}
