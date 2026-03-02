import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

    const styleMap: Record<string, string> = {
        cinematic: 'cinematic live-action movie still, realistic human actors, real-world photography, 35mm film, shallow depth of field, anamorphic lens flare, color graded like a Hollywood blockbuster, NOT anime NOT cartoon NOT illustration NOT painting',
        photorealistic: 'photorealistic DSLR photograph, ultra realistic, real human faces, real skin texture, Canon EOS R5, 85mm lens, documentary photography style, NOT anime NOT cartoon NOT illustration NOT painting',
        ghibli: 'Studio Ghibli hand-drawn anime style, 2D cel animation, soft pastel watercolor backgrounds, whimsical anime characters, Hayao Miyazaki art direction, NOT photorealistic NOT live-action NOT 3D render',
        pixar: 'Pixar Disney 3D CGI animation style, smooth 3D rendered characters, vibrant saturated colors, cute rounded proportions, subsurface scattering on skin, Pixar movie screenshot, NOT photorealistic NOT live-action NOT 2D anime',
        webtoon: 'Korean manhwa webtoon digital illustration style, clean sharp lineart, cel-shaded coloring, detailed manga-style characters, webtoon panel composition, NOT photorealistic NOT live-action NOT 3D',
        watercolor: 'traditional watercolor painting illustration, visible brush strokes, soft color bleeding and blending, storybook art style, hand-painted aesthetic, NOT photorealistic NOT live-action NOT anime',
        cyberpunk: 'cyberpunk neon noir style, futuristic cityscape, glowing neon lights, rain-soaked reflections, Blade Runner aesthetic, dark atmosphere with vibrant neon accents, cinematic cyberpunk',
        vintage: 'vintage 1970s analog film photography, Kodak Portra 400 film grain, warm amber tones, faded retro color palette, soft vignette, 70s fashion and decor aesthetic, retro film camera look',
    };
    const cameraMap: Record<string, string> = {
        dynamic: 'dynamic camera angle, dramatic perspective, tilted composition',
        wide: 'ultra wide establishing shot, panoramic view, full scene visible',
        closeup: 'intimate close-up shot, detailed facial features, shallow depth of field',
        drone: 'aerial drone shot, overhead birds-eye view, cinematic flyover',
        handheld: 'handheld camera POV, natural slight motion blur, vlog style',
        lowangle: 'dramatic low angle shot, looking upward, heroic imposing perspective',
    };
    const lightMap: Record<string, string> = {
        dramatic: 'dramatic chiaroscuro lighting, high contrast shadows, volumetric light rays',
        natural: 'natural outdoor sunlight, warm daylight, soft ambient illumination',
        neon: 'neon glow lighting, colorful neon signs reflecting, electric atmosphere',
        moody: 'moody low-key lighting, dark shadows, atmospheric tension, noir',
        soft: 'soft diffused studio lighting, dreamy warm glow, even illumination',
        golden_hour: 'golden hour sunset lighting, warm orange-pink glow, long shadows, magic hour',
    };

    try {
        const body = await req.json();
        const { sceneTitle, sceneDescription, visualStyle, cameraAngle, lighting, characterSheet, customPrompt } = body;

        // 커스텀 프롬프트가 있으면 그대로 사용, 없으면 AI가 생성
        let imagePrompt = customPrompt;
        const styleDesc = styleMap[visualStyle] || styleMap['cinematic'];
        const cameraDesc = cameraMap[cameraAngle] || cameraMap['dynamic'];
        const lightDesc = lightMap[lighting] || lightMap['dramatic'];

        if (!imagePrompt) {

            // Gemini로 이미지 프롬프트 생성
            const promptGeneration = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are an expert visual prompt engineer. You MUST generate an image prompt that strictly follows ONE specific visual style. Mixing styles is absolutely forbidden.

=== ABSOLUTE STYLE RULE (NEVER VIOLATE) ===
The ENTIRE image MUST be rendered in this EXACT style: ${styleDesc}
Camera: ${cameraDesc}
Lighting: ${lightDesc}

Every element in the image — characters, backgrounds, objects, textures — MUST match this style. 
If the style is "cinematic live-action", everything must look like a real movie screenshot with real actors.
If the style is "anime", everything must look hand-drawn animated.
NEVER mix styles. NEVER make some parts realistic and other parts cartoon.

=== SCENE DETAILS ===
- Title: ${sceneTitle}
- Description: ${sceneDescription}
${characterSheet ? `- Characters: ${characterSheet}` : ''}

=== OUTPUT RULES ===
Generate a SINGLE English image prompt that:
1. STARTS with the exact style keywords: "${styleDesc}"
2. Describes the scene content (setting, characters, mood, action)
3. ENDS with "masterpiece, best quality, 8k, highly detailed"
4. Output ONLY the prompt text. No quotes, no markdown, no explanation.`,
            });

            imagePrompt = promptGeneration.text?.trim() || `${styleDesc}, ${cameraDesc}, ${lightDesc}, ${sceneTitle}, masterpiece, best quality, 8k resolution`;
        }

        // 스타일 일관성을 위한 접두사 강제 삽입
        const stylePrefix = `${styleDesc}, ${cameraDesc}, ${lightDesc}`;

        // 프롬프트에 스타일 접두사가 없으면 추가
        const finalPrompt = imagePrompt.toLowerCase().includes(styleDesc.split(',')[0].toLowerCase())
            ? imagePrompt
            : `${stylePrefix}, ${imagePrompt}`;

        // Gemini 모델로 이미지 생성 — aspectRatio를 API config로 강제 지정
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: `${styleDesc}. Generate this image strictly in the described visual style. Do not include any text or letters in the image:\n\n${finalPrompt}`,
            config: {
                responseModalities: ['image', 'text'],
                imageConfig: {
                    aspectRatio: '16:9',
                },
            },
        });

        // 응답에서 이미지 파트 찾기
        const parts = imageResponse.candidates?.[0]?.content?.parts || [];
        let imageUrl = '';

        for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith('image/')) {
                const base64 = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                imageUrl = `data:${mimeType};base64,${base64}`;
                break;
            }
        }

        if (!imageUrl) {
            throw new Error("AI가 이미지를 생성하지 못했습니다.");
        }

        return NextResponse.json({ imageUrl, imagePrompt });

    } catch (error: any) {
        console.error('씬 이미지 생성 에러:', error);

        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429') || error?.message?.includes('rate')) {
            return NextResponse.json({
                error: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요 ☕'
            }, { status: 429 });
        }

        return NextResponse.json({
            error: '씬 이미지 생성에 실패했습니다: ' + (error?.message || '알 수 없는 오류')
        }, { status: 500 });
    }
}
