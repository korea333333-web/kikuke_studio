import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
console.log("Gemini API Key Loaded:", !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { videoFormat, topic, targetAudience, tone } = body;

    const formatDesc = videoFormat === 'narration'
      ? "이 영상은 특정 캐릭터들의 대화기반 스토리가 아닌, 1명의 해설자(내레이터)가 지식/정보/상황을 설명하며 풍경이나 추상적 비주얼(B-roll)이 지나가는 '다큐멘터리/내레이션/정보전달' 형식입니다."
      : "이 영상은 여러 등장인물들이 등장하여 서로 대화하고 서사를 이끌어가는 '드라마/영화/스토리' 형식입니다.";

    const prompt = `
당신은 흥행하는 유튜브 영상과 웹소설/드라마를 기획하는 탑티어 기획자입니다.
다음 [기본 설정]을 바탕으로, 사람들의 호기심을 강하게 자극하는 영상 기획안을 제안해 주세요.

[영상 전개 형식]
${formatDesc}

[기본 설정]
- 주제/키워드: ${topic}
- 타겟 시청자: ${targetAudience}
- 전반적인 톤앤매너: ${tone}

[요구사항]
아래 JSON 형식에 정확히 맞춰서 차별화된 매력을 가진 3가지 기획안 옵션을 응답해 주세요.

{
  "options": [
    {
      "title": "추천 제목 옵션 1 (어그로/후킹 중심)",
      "synopsis": "이 영상이 어떤 내용으로 전개될지, 기승전결이 포함된 요약 줄거리 (300~500자 내외)."
    },
    {
      "title": "추천 제목 옵션 2 (서사/감성 또는 다른 접근법 중심)",
      "synopsis": "이 영상이 어떤 내용으로 전개될지, 기승전결이 포함된 요약 줄거리 (300~500자 내외)."
    },
    {
      "title": "추천 제목 옵션 3 (정보/직관성 또는 트렌드 중심)",
      "synopsis": "이 영상이 어떤 내용으로 전개될지, 기승전결이 포함된 요약 줄거리 (300~500자 내외)."
    }
  ]
}

반드시 순수 JSON 문자열만 출력해 주세요. 마크다운(\`\`\`json 등)은 제외합니다.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "{}";
    let cleanedText = text.trim();
    if (cleanedText.startsWith('\`\`\`json')) {
      cleanedText = cleanedText.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '');
    } else if (cleanedText.startsWith('\`\`\`')) {
      cleanedText = cleanedText.replace(/^\`\`\`\s*/, '').replace(/\`\`\`$/, '');
    }

    try {
      const parsed = JSON.parse(cleanedText);
      return NextResponse.json(parsed, { status: 200 });
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON for synopsis:', cleanedText);
      return NextResponse.json({ error: 'Failed to parse JSON for synopsis' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error generating synopsis:', error);

    // Handle Gemini Quota / Rate Limit errors
    if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
      return NextResponse.json({
        error: '제미나이 AI 무료 호출 한도(분당 15회)를 초과했습니다. 물 한 잔 드시고 1분 뒤에 다시 시도해주세요 ☕'
      }, { status: 429 });
    }

    return NextResponse.json({ error: '시놉시스 생성에 실패했습니다: ' + (error?.message || '알 수 없는 오류') }, { status: 500 });
  }
}
