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
1. ❌ 구체적 나이 숫자 금지: "73 years old", "25 years old" → 대신 외모 특징으로: "with silver-streaked hair and gentle laugh lines", "youthful vibrant look"
2. ❌ 국적/인종/민족 금지: "Korean", "Asian", "Japanese", "Chinese", "East Asian" → 완전히 삭제, 대신 의상/헤어/분위기로 간접 표현
3. ❌ "elderly", "old man", "old woman" 금지 → "graceful mature figure", "silver-haired dignified person"
4. ❌ 캐릭터 이름 금지: "Park Seon-yeong" → prompt에 이름 넣지 말 것 (target에만 사용)
5. ❌ "closeup" 단독 금지 → "medium shot, upper body framing" 또는 "portrait composition"

**✅ 안전한 표현 방법**:
- 나이 → 외모 특징으로 대체: hair color (silver, dark, auburn), facial features (laugh lines, bright eyes), overall demeanor
- 민족성 → 환경과 소품으로 암시: 한옥 배경, 전통 차(tea), 골목길, 시장, 벚꽃 등 배경과 소품을 활용
- 실사 스타일에서는 "cinematic", "movie still", "35mm film", "shallow depth of field" 같은 영화적 키워드를 적극 사용
- "closeup" 대신 → "portrait composition", "medium close-up", "bust shot"

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
