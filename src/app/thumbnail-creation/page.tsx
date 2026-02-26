"use client";

import React, { useState } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ImageIcon, Copy, Film, BookOpen, X } from "lucide-react";

interface Scene {
    sceneNumber: number;
    sceneDescription: string;
    imagePrompt: string;
}

export default function CutsceneAutomationPage() {
    const { topic, characterSheet, script, scenePrompts, setScenePrompts } = useStoryStore();

    // Request Options
    const [visualStyle, setVisualStyle] = useState("cinematic");
    const [promptDensity, setPromptDensity] = useState("detailed");

    // Response State
    const [isGenerating, setIsGenerating] = useState(false);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setErrorMsg("");

        try {
            const res = await fetch('/api/generate-scenes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script,
                    characterSheet,
                    visualStyle,
                    promptDensity
                })
            });

            if (!res.ok) {
                throw new Error("서버 응답 오류");
            }

            const data = await res.json();

            if (data.error) throw new Error(data.error);

            setScenes(data.scenes || []);

            // Save to Global Store (just storing prompts as string array for generic use)
            if (data.scenes) {
                setScenePrompts(data.scenes.map((s: Scene) => s.imagePrompt));
            }

        } catch (err) {
            console.error(err);
            setErrorMsg("컷씬 분석 및 프롬프트 생성 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyPrompt = (prompt: string) => {
        navigator.clipboard.writeText(prompt);
        // Optional: toast notification
    };

    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-5xl p-8 mt-12">
                {/* 헤더 영역 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">컷씬 이미지 자동화 (스토리보드)</h2>
                    <p className="text-gray-500">생성된 스토리 대본과 캐릭터 시트를 바탕으로 주요 컷씬을 나누고, 이미지 생성용 AI 영문 프롬프트를 추출합니다.</p>
                </div>

                {/* 생성 조건 컨트롤 패널 */}
                <Card className="border shadow-sm bg-white rounded-xl mb-8">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 antialiased">프롬프트 추출 설정</h3>
                            <div className="flex items-center gap-4">
                                {/* Pre-flight check */}
                                {(!script || !characterSheet) && (
                                    <span className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1 border border-red-200 rounded">
                                        대본/캐릭터 데이터 없음!
                                    </span>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(true)}
                                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    대본 및 룩북 기획안 보기
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                            {/* 비주얼 스타일 */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">비주얼 스타일 지정</Label>
                                <Select value={visualStyle} onValueChange={setVisualStyle}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="스타일 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cinematic">Cinematic (영화 같은 실사 룩)</SelectItem>
                                        <SelectItem value="anime">Anime (정교한 2D 애니메이션)</SelectItem>
                                        <SelectItem value="webtoon">Webtoon (한국식 다이나믹 액션 웹툰)</SelectItem>
                                        <SelectItem value="pixar">3D Animation (디즈니/픽사 스타일)</SelectItem>
                                        <SelectItem value="cyberpunk">Cyberpunk (사이버펑크 네온)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 프롬프트 밀도 */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">프롬프트 상세 레벨</Label>
                                <Select value={promptDensity} onValueChange={setPromptDensity}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="상세 레벨 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="detailed">매우 상세함 (구도, 조명, 표정 정밀 묘사)</SelectItem>
                                        <SelectItem value="standard">표준 (기본적인 인물, 배경 묘사)</SelectItem>
                                        <SelectItem value="conceptual">심볼릭 (분위기, 아트 느낌 위주)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="text-red-500 text-sm font-medium mb-4">{errorMsg}</div>
                        )}

                        <div className="flex justify-end pt-4 border-t">
                            <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !script || !characterSheet}
                                className="w-[300px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg rounded-lg shadow-sm"
                            >
                                <Film className="w-5 h-5 mr-3" />
                                {isGenerating ? '장면 분할 및 프롬프트 추출 중...' : '대본 분석 및 컷씬 프롬프트 생성'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 결과 화면 패널 */}
                {scenes.length > 0 && (
                    <Card className="border shadow-sm bg-white rounded-xl">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-lg font-bold text-gray-900 antialiased">추출된 장면 및 이미지 프롬프트 (총 {scenes.length}컷)</h3>
                                </div>
                                <Button variant="outline" className="text-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                    프롬프트 일괄 복사
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {scenes.map((scene) => (
                                    <div key={scene.sceneNumber} className="border border-indigo-100 rounded-xl p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">

                                        {/* Scene 헤더 */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="bg-indigo-600 text-white text-xs font-black px-2 py-1 rounded">
                                                CUT {scene.sceneNumber}
                                            </span>
                                            <h4 className="font-bold text-gray-800 text-base">
                                                {scene.sceneDescription}
                                            </h4>
                                        </div>

                                        {/* Prompt 박스 */}
                                        <div className="mt-4 relative group">
                                            <Textarea
                                                readOnly
                                                value={scene.imagePrompt}
                                                className="min-h-[100px] bg-slate-100/70 border-gray-200 text-sm text-gray-700 leading-relaxed font-mono shadow-inner pr-12 focus-visible:ring-indigo-500"
                                            />
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => handleCopyPrompt(scene.imagePrompt)}
                                                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-indigo-50 border shadow-sm"
                                            >
                                                <Copy className="w-4 h-4 text-indigo-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* 대본 및 룩북 모달 (간단한 Overlay 방식) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* 모달 헤더 */}
                        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-900">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                                스토리보드 기획안 (대본 및 캐릭터)
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-slate-200">
                                <X className="w-5 h-5 text-gray-500" />
                            </Button>
                        </div>

                        {/* 모달 본문 (스크롤) */}
                        <div className="p-8 overflow-y-auto space-y-8 bg-gray-50/50">

                            {/* 캐릭터 시트 영역 */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 border-indigo-100 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-500" />
                                    확정된 캐릭터 시트 (외형 묘사)
                                </h3>
                                <div className="bg-white border rounded-xl p-5 text-sm text-gray-700 font-mono whitespace-pre-wrap shadow-sm leading-relaxed">
                                    {characterSheet || "저장된 캐릭터 시트가 없습니다."}
                                </div>
                            </section>

                            {/* 대본 본문 영역 */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 border-indigo-100 flex items-center gap-2">
                                    <Film className="w-5 h-5 text-indigo-500" />
                                    전체 스토리 대본
                                </h3>
                                <div className="bg-white border border-indigo-200/50 rounded-xl p-6 text-sm text-gray-800 font-mono whitespace-pre-wrap shadow-inner leading-relaxed min-h-[300px]">
                                    {script || "저장된 대본이 없습니다."}
                                </div>
                            </section>

                        </div>

                        {/* 모달 푸터 */}
                        <div className="p-4 border-t bg-white flex justify-end">
                            <Button onClick={() => setIsModalOpen(false)} className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                닫기
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
