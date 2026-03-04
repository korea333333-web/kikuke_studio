import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    try {
        const body = await req.json();
        const { sceneTitle, sceneDescription, scriptExcerpt, characterSheet, visualStyle, cameraAngle, lighting } = body;

        const styleMap: Record<string, string> = {
            cinematic: 'cinematic movie style, film grain, dramatic composition',
            photorealistic: 'photorealistic, documentary style, ultra realistic, DSLR photo',
            ghibli: 'Studio Ghibli anime style, hand-painted, soft pastel colors, whimsical',
            pixar: 'Pixar 3D animation style, vibrant colors, smooth render, cute proportions',
            webtoon: 'Korean high-quality webtoon style, manhwa illustration, detailed linework',
            watercolor: 'watercolor painting style, storybook illustration, soft blending',
            cyberpunk: 'cyberpunk neon style, futuristic, glowing neon lights, dark atmosphere',
            vintage: 'vintage retro film camera style, analog film grain, warm tones, 70s aesthetic',
        };

        const cameraMap: Record<string, string> = {
            dynamic: 'dynamic angle, dramatic perspective, action shot',
            wide: 'ultra wide shot, establishing shot, panoramic view',
            closeup: 'extreme close-up, detailed facial expression, macro lens',
            drone: 'aerial drone shot, birds-eye view, top-down perspective',
            handheld: 'handheld camera, vlog style, POV shot, shaky cam',
            lowangle: 'low angle shot, heroic perspective, looking up',
        };

        const lightMap: Record<string, string> = {
            dramatic: 'dramatic lighting, high contrast, chiaroscuro, strong shadows',
            natural: 'natural sunlight, warm daylight, realistic outdoor lighting',
            neon: 'neon glow lighting, colorful neon signs, cyberpunk lights',
            moody: 'moody low-key lighting, dark atmosphere, film noir',
            soft: 'soft diffused lighting, dreamy glow, ethereal atmosphere',
            golden_hour: 'golden hour lighting, warm sunset glow, long shadows',
        };

        const styleDesc = styleMap[visualStyle] || 'cinematic style';
        const cameraDesc = cameraMap[cameraAngle] || 'dynamic angle';
        const lightDesc = lightMap[lighting] || 'dramatic lighting';

        const prompt = `
당신은 현직 최고의 스토리보드 아티스트이자 영상 연출 감독입니다.
다음 씬(Scene) 정보를 바탕으로, 이 씬을 영상에 쓸 세부 **컷(Cut)**으로 분할하고, 각 컷마다 AI 이미지 생성용 영어 프롬프트를 작성하세요.

[씬 정보]
- 씬 제목: ${sceneTitle}
- 씬 설명: ${sceneDescription}

[해당 씬의 대본 발췌]
${scriptExcerpt || '(대본 발췌 없음)'}

${characterSheet ? `[캐릭터 시트(외형 DNA)]\n${characterSheet}` : ''}

[글로벌 비주얼 설정 (모든 컷에 반드시 적용)]
- 화풍: ${styleDesc}
- 카메라: ${cameraDesc}
- 조명: ${lightDesc}

[요구사항]
1. 이 씬을 3~8개의 세부 컷으로 나누세요.
2. 각 컷의 한국어 설명과 예상 길이(초)를 작성하세요.
3. 각 컷의 imagePrompt는 반드시 영어로 작성하고, 아래 규칙을 따르세요:
   - ★★★ 가장 중요 ★★★: 이 씬의 장소/배경/시간대/분위기를 모든 컷의 프롬프트에 반드시 공통으로 포함하세요! 예를 들어 씬이 "노인정 카페테리아"에서 진행된다면, 모든 컷의 프롬프트에 "in a senior center cafeteria" 배경 묘사가 들어가야 합니다. 클로즈업이라도 배경이 blurred로 보여야 합니다. 절대로 씬의 장소와 다른 배경이 나오면 안 됩니다.
   - 장면 묘사를 구체적으로 (인물, 동작, 배경, 소품 등)
   - 캐릭터가 등장하면 캐릭터 시트의 외형 묘사를 100% 반영
   - 한국 배경이면 "Korean" 키워드 포함
   - 프롬프트 끝에 반드시 다음 품질 키워드 추가: ", ${styleDesc}, ${cameraDesc}, ${lightDesc}, consistent character design, exquisite details, masterpiece, best quality, 8k resolution"
4. 각 컷의 imagePromptKr은 imagePrompt를 한국어로 완전히 번역한 것입니다. 영어 프롬프트의 모든 내용을 빠짐없이 한국어로 번역해주세요.
5. 반드시 다음 JSON 형식의 배열로만 응답하세요 (마크다운 백틱 없이, 순수 JSON만):

[
  {
    "cutNumber": 1,
    "description": "컷 설명 (한국어로, 예: 서울 야경을 배경으로 한 드론샷)",
    "duration": "3초",
    "imagePrompt": "A breathtaking aerial drone shot of Seoul city at night... ${styleDesc}, ${cameraDesc}, ${lightDesc}, consistent character design, exquisite details, masterpiece, best quality, 8k resolution",
    "imagePromptKr": "서울 야경의 숨막히는 항공 드론 촬영... (imagePrompt의 완전한 한국어 번역)"
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
            return NextResponse.json({ cuts: parsed }, { status: 200 });
        } catch (parseError) {
            console.error('Failed to parse Gemini JSON for cuts:', cleanedText);
            return NextResponse.json({ error: 'AI 응답을 파싱하지 못했습니다. 다시 시도해주세요.' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Error generating cuts:', error);

        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
            return NextResponse.json({
                error: '제미나이 AI 무료 호출 한도(분당 15회)를 초과했습니다. 1분 뒤에 다시 시도해주세요 ☕'
            }, { status: 429 });
        }

        return NextResponse.json({ error: '컷 생성에 실패했습니다: ' + (error?.message || '알 수 없는 오류') }, { status: 500 });
    }
}
