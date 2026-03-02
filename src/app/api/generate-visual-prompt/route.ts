import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    try {
        const body = await req.json();
        const { tone, synopsis, characterSheet, visualStyle, lighting, cameraAngle } = body;

        const prompt = `
You are a world-class AI image prompt engineer specializing in creating prompts that are safe and compliant with AI image generation policies.

Based on the [Synopsis] and [Character Sheet] provided, create a set of English keyword prompts for AI image generators (Midjourney, Stable Diffusion, Gemini Imagen, etc.).

Prompts should include: 1 "Main Opening Scene" (overall atmosphere/poster) + individual "Solo Shot" prompts for EVERY character in the character sheet.

[Project Info]
- Visual Style: ${visualStyle}
- Tone & Mood: ${tone}
${lighting ? `- Lighting: ${lighting}` : ''}
${cameraAngle ? `- Camera: ${cameraAngle}` : ''}

[Synopsis]
${synopsis}

[Character Sheet]
${characterSheet}

=== CRITICAL SAFETY RULES (MUST FOLLOW) ===
AI 이미지 생성 서비스들의 안전 정책에 걸리지 않도록 반드시 아래 규칙을 지켜야 합니다:

**절대 사용 금지 키워드** (이 단어들이 프롬프트에 포함되면 이미지 생성이 거부됩니다):
- ❌ 구체적 나이 숫자: "73 years old", "25 years old" 등 → 대신 "mature", "youthful", "seasoned" 같은 형용사 사용
- ❌ 특정 인종/민족: "Korean", "Asian", "Japanese", "Chinese" 등 → 절대 국적이나 인종을 명시하지 마세요
- ❌ "elderly", "old man", "old woman" → 대신 "silver-haired", "wise-looking", "dignified figure" 사용
- ❌ "closeup" 단독 사용 → "character portrait, upper body shot" 또는 "medium shot" 사용
- ❌ 실제 사람 이름 (Park Seon-yeong 등) → 프롬프트에 캐릭터 이름을 넣지 마세요
- ❌ "realistic", "real person", "photograph" (실사 스타일이 아닌 경우)
- ❌ 피부색 구체 묘사: "fair skin", "dark skin" 등

**반드시 사용해야 하는 안전한 대체 표현**:
- ✅ 나이 대신 → 분위기로 표현: "character with silver streaked hair and gentle smile lines", "youthful energetic character"
- ✅ 민족 대신 → 스타일로 표현: 의상, 헤어스타일, 액세서리, 분위기로만 표현
- ✅ 인물 묘사 → "illustrated character", "stylized portrait", "character design" 접두어 사용
- ✅ 모든 캐릭터 프롬프트는 "character design, stylized illustration," 또는 해당 visual style 키워드로 시작
- ✅ 캐릭터 이름 대신 → "target" 필드에만 이름 사용, prompt에는 절대 넣지 말 것

[Output Rules]
1. All prompts MUST be in **English only**.
2. **koreanDescription**: Explain each prompt in Korean (2-3 sentences) for non-experts to understand.
3. Prompts should be comma-separated keywords/short phrases, NOT full sentences.
4. Include visual quality keywords: 8k, masterpiece, highly detailed, best quality
5. Include style-specific keywords matching the selected visual style
6. Output ONLY the JSON array below. No greetings, no markdown code blocks.

[Response Format (output ONLY this JSON Array)]
[
  {
    "target": "메인 오프닝 씬 (전체 배경 또는 포스터)",
    "prompt": "english keywords here...",
    "koreanDescription": "이 프롬프트에 대한 한글 해석."
  },
  {
    "target": "캐릭터명 (주인공, 단독 샷)",
    "prompt": "character design, stylized illustration, english keywords here...",
    "koreanDescription": "이 캐릭터의 외형과 분위기를 한글로 설명."
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
