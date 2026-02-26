import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tone, synopsis, characterSheet, visualStyle, lighting, cameraAngle } = body;

        const prompt = `
당신은 최고의 AI 이미지 생성 프롬프트 엔지니어입니다.
제공된 [시놉시스]와 [캐릭터 시트]를 바탕으로, 미드저니(Midjourney)나 스테이블 디퓨전(Stable Diffusion) 같은 AI 이미지 생성기에 똑같이 복사해서 넣을 수 있는 '영문 키워드 프롬프트'들을 여러 개 작성해 주세요.

이 프롬프트들은 전체 분위기를 보여주는 '메인 배경/오프닝 씬' 1장과, 각 캐릭터별 '개별 단독 샷' 프롬프트들로 구성되어야 합니다.
**캐릭터 시트에 등장하는 모든 인물에 대해 빠짐없이 개별 프롬프트를 작성하세요.**

[기획 정보]
- 시각화 스타일: ${visualStyle}
- 톤앤매너: ${tone}
${lighting ? `- 메인 조명: ${lighting}` : ''}
${cameraAngle ? `- 기본 카메라 무빙: ${cameraAngle}` : ''}

[줄거리 (시놉시스)]
${synopsis}

[캐릭터 시트]
${characterSheet}

[요구사항]
1. 반드시 프롬프트(prompt) 내용은 모두 **영어(English)**로만 작성하세요. 
2. **한글 해석(koreanDescription)**: 각 영문 프롬프트가 어떤 장면/인물을 묘사하는지 한국어로 2~3문장 정도 설명해주세요. 비전문가도 쉽게 이해할 수 있어야 합니다.
3. 프롬프트는 완전한 문장이 아니라, 쉼표(,)로 구분된 단어나 짧은 구(phrase)의 조합으로 작성해 주세요.
4. 카메라 앵글, 조명, 렌즈 느낌, 배경 분위기, 화질(ex. 8k, masterpiece, highly detailed) 등의 시각적 퀄리티업 키워드를 필수로 포함하세요.
5. 캐릭터 개별 프롬프트의 경우, 각 인물의 외모(머리 색, 헤어스타일, 옷 스타일, 표정)를 구체적으로 요약해서 키워드로 넣으세요.
6. 오직 아래 JSON 배열 포맷에 맞춘 결과물만 출력하세요. 다른 인사말이나 설명, 마크다운 코드블록(\`\`\`)은 절대 금지합니다.

[응답 포맷 (반드시 JSON Array 본문만 출력)]
[
  {
    "target": "메인 오프닝 씬 (전체 배경 또는 포스터)",
    "prompt": "english keywords here...",
    "koreanDescription": "이 프롬프트에 대한 한글 해석. 어떤 장면인지 쉽게 설명."
  },
  {
    "target": "캐릭터명1 (단독 샷)",
    "prompt": "english keywords here...",
    "koreanDescription": "이 캐릭터의 외형과 분위기를 한글로 풀어 설명."
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
