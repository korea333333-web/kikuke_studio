import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    try {
        const body = await req.json();
        const { tone, synopsis, characterSheet, visualStyle, lighting, cameraAngle } = body;

        // 스타일별 프롬프트 접두어 결정
        const isRealisticStyle = ['cinematic', 'photorealistic', 'cyberpunk', 'vintage'].includes(visualStyle);

        const styleGuide = isRealisticStyle
            ? `이 프로젝트의 비주얼 스타일은 "${visualStyle}" (실사/영화적) 입니다.
모든 캐릭터 프롬프트는 반드시 "cinematic movie still, dramatic lighting, film photography," 같은 실사 영화 키워드로 시작하세요.
"illustration", "anime", "cartoon", "character design", "stylized", "painting" 같은 비실사 키워드는 절대 사용하지 마세요.
인물은 실제 영화 배우처럼 사실적으로 묘사해야 합니다.`
            : `이 프로젝트의 비주얼 스타일은 "${visualStyle}" (일러스트레이션) 입니다.
모든 캐릭터 프롬프트는 해당 스타일에 맞는 키워드 (예: "anime illustration,", "3D Pixar style,", "webtoon art," 등)로 시작하세요.`;

        const prompt = `
You are a world-class AI image prompt engineer.

Based on the [Synopsis] and [Character Sheet], create English keyword prompts for AI image generators.

Create: 1 "Main Opening Scene" (atmosphere/poster) + individual "Solo Shot" for EVERY character.

[Project Info]
- Visual Style: ${visualStyle}
- Tone & Mood: ${tone}
${lighting ? `- Lighting: ${lighting}` : ''}
${cameraAngle ? `- Camera: ${cameraAngle}` : ''}

[Synopsis]
${synopsis}

[Character Sheet]
${characterSheet}

=== STYLE DIRECTION ===
${styleGuide}

=== SAFETY RULES (반드시 지켜야 합니다 - 안 지키면 이미지 생성이 차단됩니다) ===

**절대 금지 (이 단어가 있으면 100% 차단됩니다)**:
1. ❌ 구체적 나이 숫자 금지: "73 years old", "25 years old" → 대신 외모 특징으로 표현
2. ❌ 국적/인종/민족 라벨 금지: "Korean", "Asian", "Japanese", "Chinese", "East Asian" → 이 단어들은 절대 쓰지 마세요
3. ❌ "elderly", "old man", "old woman" 금지 → "graceful mature figure", "silver-haired dignified person" 등으로 대체
4. ❌ 캐릭터 이름 금지: prompt 안에 이름 넣지 말 것 (target에만 사용)
5. ❌ "closeup" 단독 금지 → "medium shot", "portrait composition", "bust shot"

=== 캐릭터 외형 유도 (매우 중요!!!) ===
"Korean"이라는 단어는 금지되지만, 한국인처럼 보이는 외형을 **구체적인 신체 특징 키워드들**로 반드시 표현해야 합니다.
모든 캐릭터 프롬프트에 아래 특징들을 적절히 섞어서 필수로 포함하세요:

**얼굴/외형 특징 키워드 (반드시 사용)**:
- "straight black hair" 또는 "dark brown hair" (한국인 헤어)
- "dark brown eyes" 또는 "warm dark eyes" (한국인 눈 색)
- "soft rounded facial features" 또는 "gentle facial structure" (한국인 얼굴형)
- "warm ivory skin tone" 또는 "warm undertone complexion" (한국인 피부톤)
- 나이가 든 캐릭터: "silver-streaked black hair", "graceful laugh lines around warm dark eyes"
- 젊은 캐릭터: "youthful with straight dark hair", "bright dark eyes"

**영화 스타일 키워드 (실사일 때 반드시 사용)**:
- "K-drama cinematography" — 이건 영화 촬영 스타일을 뜻하므로 안전합니다
- "Seoul street backdrop" 또는 "traditional tile-roofed architecture" (한국 배경)
- "warm ondol-heated room", "traditional wooden floor", "paper sliding doors" (한국 실내)

**의상/소품 키워드**:
- "neat casual fashion", "modest modern outfit" (한국식 캐주얼)
- "silk hanbok-inspired blouse", "traditional jade accessories" (한복 모티프)
- 노인 캐릭터: "comfortable warm knit vest", "reading glasses on chain"
- "ceramic tea cup", "banchan on wooden table" (한국 소품)

[Output Rules]
1. All prompts MUST be in **English only**.
2. **koreanDescription**: 각 프롬프트의 한글 설명 (2-3문장, 비전문가도 이해 가능하게)
3. Comma-separated keywords/phrases (NOT full sentences)
4. Must include quality keywords: 8k, masterpiece, highly detailed
5. Output ONLY the JSON array. No markdown code blocks.

[Response Format]
[
  {
    "target": "메인 오프닝 씬 (전체 배경 또는 포스터)",
    "prompt": "english keywords...",
    "koreanDescription": "한글 해석"
  },
  {
    "target": "캐릭터명 (역할, 단독 샷)",
    "prompt": "cinematic movie still, ... (실사) 또는 anime illustration, ... (애니)",
    "koreanDescription": "한글 해석"
  }
]
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Parse JSON response
        const text = response.text || "[]";
        let cleanedText = text.trim();
        if (cleanedText.startsWith('\`\`\`json')) {
            cleanedText = cleanedText.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '');
        } else if (cleanedText.startsWith('\`\`\`')) {
            cleanedText = cleanedText.replace(/^\`\`\`\s*/, '').replace(/\`\`\`$/, '');
        }

        try {
            const visualPrompts = JSON.parse(cleanedText);
            return NextResponse.json({ visualPrompts }, { status: 200 });
        } catch (parseError) {
            console.error('Failed to parse Gemini JSON:', cleanedText);
            return NextResponse.json({ error: 'AI가 생성한 데이터를 분석하는데 실패했습니다 (JSON 오류)' }, { status: 500 });
        }

    } catch (error: any) {
        console.error('Error generating visual prompt:', error);

        // Handle Gemini Quota / Rate Limit errors
        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
            return NextResponse.json({
                error: '제미나이 AI 무료 호출 한도(분당 15회)를 초과했습니다. 물 한 잔 드시고 1분 뒤에 다시 시도해주세요 ☕'
            }, { status: 429 });
        }

        return NextResponse.json({ error: '비주얼 프롬프트 생성에 실패했습니다: ' + (error?.message || '알 수 없는 오류') }, { status: 500 });
    }
}
