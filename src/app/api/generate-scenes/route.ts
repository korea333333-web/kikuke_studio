import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { script, characterSheet } = body;

        if (!script || script.trim().length < 50) {
            return NextResponse.json({ error: '대본이 너무 짧습니다. 대본 생성 단계에서 먼저 대본을 완성해주세요.' }, { status: 400 });
        }

        const prompt = `
당신은 현직 최고의 스토리보드 아티스트이자 영상 연출 감독입니다.
다음 [유튜브 대본]을 분석하여, 장소/시간/분위기가 바뀌는 큼직한 **씬(Scene)** 단위로 구조화해 주세요.
기승전결이 드러나도록 대본을 충실히 읽고 씬을 분할하세요.

[유튜브 대본]
${script}

${characterSheet ? `[캐릭터 시트]\n${characterSheet}` : ''}

[요구사항]
1. 대본 전체를 처음부터 끝까지 빠짐없이 커버하도록 씬을 나누세요.
2. 하나의 씬은 "같은 장소 + 같은 시간대 + 같은 분위기"를 기준으로 나누세요.
3. 최소 5개, 최대 25개 사이의 씬으로 분할하세요.
4. 각 씬에 대해 한국어로 제목과 설명, 장소 정보를 작성하세요.
5. 반드시 다음 JSON 형식의 배열로만 응답하세요 (마크다운 백틱 없이, 순수 JSON만):

[
  {
    "sceneNumber": 1,
    "title": "씬 제목 (예: 오프닝 - 서울 야경)",
    "description": "이 씬에서 일어나는 일을 2~3문장으로 요약",
    "timeRange": "대본에서의 대략적 위치 (예: 도입부, 전개부 등)",
    "location": "촬영 장소 (예: 서울 강남 사무실)"
  }
]
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text || "[]";
        let cleanedText = text.trim();
        if (cleanedText.startsWith('\`\`\`json')) {
            cleanedText = cleanedText.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '');
        } else if (cleanedText.startsWith('\`\`\`')) {
            cleanedText = cleanedText.replace(/^\`\`\`\s*/, '').replace(/\`\`\`$/, '');
        }

        try {
            const parsed = JSON.parse(cleanedText);
            // cuts 빈 배열 추가
            const scenesWithCuts = parsed.map((s: any) => ({
                ...s,
                cuts: [],
            }));
            return NextResponse.json({ scenes: scenesWithCuts }, { status: 200 });
        } catch (parseError) {
            console.error('Failed to parse Gemini JSON for scenes:', cleanedText);
            return NextResponse.json({ error: 'AI 응답을 파싱하지 못했습니다. 다시 시도해주세요.' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error generating scenes:', error);

        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
            return NextResponse.json({
                error: '제미나이 AI 무료 호출 한도(분당 15회)를 초과했습니다. 1분 뒤에 다시 시도해주세요 ☕'
            }, { status: 429 });
        }

        return NextResponse.json({ error: '씬 분석에 실패했습니다: ' + (error?.message || '알 수 없는 오류') }, { status: 500 });
    }
}
