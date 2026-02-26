import { NextResponse } from 'next/server';
import { ElevenLabsClient } from 'elevenlabs';

// 환경변수에 ELEVENLABS_API_KEY 가 설정되어 있어야 합니다.
const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY || '',
});

export async function POST(req: Request) {
    if (!process.env.ELEVENLABS_API_KEY) {
        return NextResponse.json(
            { error: "ElevenLabs API 키가 설정되지 않았습니다. .env.local 파일에 ELEVENLABS_API_KEY를 추가해주세요." },
            { status: 500 }
        );
    }

    try {
        const { text, voiceId = "JBFqnCBcs6BaNtIGwgZ1" } = await req.json(); // Default Voice: George (or choose another)

        if (!text) {
            return NextResponse.json({ error: "음성으로 변환할 텍스트가 필요합니다." }, { status: 400 });
        }

        // ElevenLabs API 호출하여 오디오 스트림(MP3) 생성
        const audioStream = await elevenlabs.generate({
            voice: voiceId,
            text: text,
            model_id: "eleven_multilingual_v2", // 한국어 등 다국어 지원 모델
        });

        // 스트림을 버퍼(바이너리)로 변환
        const chunks: Buffer[] = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        // 클라이언트(브라우저)에서 즉시 <audio src="..."> 에 넣을 수 있도록 Base64 Data URL 형태로 인코딩
        const base64Audio = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

        return NextResponse.json({ audioUrl: base64Audio });

    } catch (error: any) {
        console.error("오디오(TTS) 생성 에러:", error);
        return NextResponse.json(
            { error: error.message || "오디오 생성에 실패했습니다." },
            { status: 500 }
        );
    }
}
