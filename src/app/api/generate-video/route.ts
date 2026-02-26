import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import os from 'os';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req: Request) {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "Gemini API 키가 설정되지 않았습니다." },
            { status: 500 }
        );
    }

    try {
        const { imageBase64, prompt, duration, aspectRatio } = await req.json();

        if (!imageBase64) {
            return NextResponse.json({ error: "이미지 데이터가 필요합니다." }, { status: 400 });
        }

        // base64에서 데이터 부분만 추출
        const base64Data = imageBase64.includes(',')
            ? imageBase64.split(',')[1]
            : imageBase64;

        const mimeMatch = imageBase64.match(/data:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

        // Veo 2로 영상 생성 시작 (비동기)
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt || 'Smooth cinematic camera movement, subtle animation',
            image: {
                imageBytes: base64Data,
                mimeType: mimeType,
            },
            config: {
                aspectRatio: aspectRatio || '16:9',
                durationSeconds: duration || 4,
                personGeneration: 'allow_all',
            },
        });

        // 폴링: 영상 생성 완료까지 대기 (최대 5분)
        const maxWait = 300000; // 5분
        const pollInterval = 10000; // 10초
        let elapsed = 0;

        while (!operation.done && elapsed < maxWait) {
            await new Promise(r => setTimeout(r, pollInterval));
            elapsed += pollInterval;

            operation = await ai.operations.getVideosOperation({
                operation: operation,
            });
        }

        if (!operation.done) {
            return NextResponse.json(
                { error: "영상 생성 시간이 초과되었습니다. 다시 시도해주세요." },
                { status: 408 }
            );
        }

        // 결과 영상 가져오기
        const generatedVideos = operation.response?.generatedVideos;
        if (!generatedVideos || generatedVideos.length === 0) {
            return NextResponse.json(
                { error: "영상이 생성되지 않았습니다." },
                { status: 500 }
            );
        }

        const video = generatedVideos[0].video;

        if (!video) {
            return NextResponse.json(
                { error: "영상 파일을 가져올 수 없습니다." },
                { status: 500 }
            );
        }

        // 임시 파일로 다운로드
        const tmpDir = os.tmpdir();
        const tmpFile = path.join(tmpDir, `veo_video_${Date.now()}.mp4`);

        await ai.files.download({ file: video, downloadPath: tmpFile });

        // 파일을 읽어서 base64로 변환
        const videoBuffer = fs.readFileSync(tmpFile);
        const videoBase64 = videoBuffer.toString('base64');
        const videoDataUrl = `data:video/mp4;base64,${videoBase64}`;

        // 임시 파일 삭제
        try { fs.unlinkSync(tmpFile); } catch { }

        return NextResponse.json({
            videoUrl: videoDataUrl,
            duration: duration || 4,
        });

    } catch (error: any) {
        console.error("영상 생성 에러:", error);

        if (error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('429')) {
            return NextResponse.json(
                { error: "API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요 ☕" },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: error.message || "영상 생성에 실패했습니다." },
            { status: 500 }
        );
    }
}
