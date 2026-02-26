"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Image as ImageIcon, Sparkles, Volume2, Wand2, Type, LayoutTemplate, Loader2, RefreshCw } from "lucide-react";
import { useStoryStore } from '@/store/useStoryStore';
import { StoryContextPanel } from '@/components/StoryContextPanel';
import Image from "next/image";

interface Scene {
    sceneNumber: number;
    sceneDescription: string;
    imagePrompt: string;
}

export default function VideoCreationPage() {
    const { script, characterSheet, setScenePrompts, sceneImages, updateSceneImage, sceneAudios, updateSceneAudio } = useStoryStore();

    // Scene Generation Options
    const [visualStyle, setVisualStyle] = useState("cinematic");
    const [promptDensity, setPromptDensity] = useState("detailed");

    // State
    const [isGenerating, setIsGenerating] = useState(false);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
    const [generatingAudioIndex, setGeneratingAudioIndex] = useState<number | null>(null);
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);

    const handleGenerateImage = async (index: number, prompt: string): Promise<boolean> => {
        setGeneratingImageIndex(index);
        setErrorMsg("");
        try {
            const res = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            if (data.error) {
                setErrorMsg(data.error);
                return false;
            }
            if (data.imageUrl) {
                updateSceneImage(index, data.imageUrl);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            setErrorMsg("이미지 생성 중 오류가 발생했습니다.");
            return false;
        } finally {
            setGeneratingImageIndex(null);
        }
    };

    const handleGenerateAudio = async (index: number, text: string): Promise<boolean> => {
        setGeneratingAudioIndex(index);
        setErrorMsg("");
        try {
            const res = await fetch('/api/generate-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();

            if (data.error) {
                setErrorMsg(data.error);
                return false;
            }
            if (data.audioUrl) {
                updateSceneAudio(index, data.audioUrl);
                return true;
            }
            return false;
        } catch (error) {
            console.error(error);
            setErrorMsg("오디오 생성 중 오류가 발생했습니다.");
            return false;
        } finally {
            setGeneratingAudioIndex(null);
        }
    };

    const handleGenerateAll = async () => {
        setIsBatchGenerating(true);
        setErrorMsg("");
        try {
            for (let i = 0; i < scenes.length; i++) {
                if (!sceneImages[i]) {
                    const imgSuccess = await handleGenerateImage(i, scenes[i].imagePrompt);
                    if (!imgSuccess) break; // 오류 발생 시 중단
                }
                if (!sceneAudios[i]) {
                    const audioSuccess = await handleGenerateAudio(i, scenes[i].sceneDescription);
                    if (!audioSuccess) break; // 오류 발생 시 중단
                }
            }
        } finally {
            setIsBatchGenerating(false);
        }
    };

    const handleSplitScenes = async () => {
        if (!script || !characterSheet) {
            setErrorMsg("대본과 캐릭터 시트가 필요합니다. 기획 단계를 먼저 완료해주세요.");
            return;
        }

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
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "서버 응답 오류");
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setScenes(data.scenes || []);
            if (data.scenes) {
                setScenePrompts(data.scenes.map((s: Scene) => s.imagePrompt));
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "컷씬 분석 및 분할 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-full w-full flex-col bg-slate-50 overflow-y-auto">
            <StoryContextPanel />
            <div className="w-full max-w-6xl mx-auto p-8 mt-4">

                {/* 헤더 */}
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                            <LayoutTemplate className="w-6 h-6 text-indigo-600" />
                            영상 스튜디오 (씬 블록 에디터)
                        </h2>
                        <p className="text-slate-500 font-medium tracking-tight">전체 대본을 컷씬 단위로 분할하고 이미지/영상을 생성하여 각 장면을 완성하세요.</p>
                    </div>
                    <Button variant="outline" className="border-indigo-200 text-indigo-700 font-bold bg-white hover:bg-indigo-50">
                        전체 영상 렌더링 내보내기
                    </Button>
                </div>

                {/* 1. 기획 연동 및 씬 분할 패널 */}
                <Card className="border-none shadow-sm bg-white rounded-2xl mb-8 overflow-hidden">
                    <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Film className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-white font-bold">1단계: 대본 불러오기 및 컷씬 분할</h3>
                        </div>
                        {(!script || !characterSheet) && (
                            <span className="bg-red-500/20 text-red-200 text-xs px-2 py-1 rounded font-bold border border-red-500/30">
                                ⚠️ 기획 데이터 누락
                            </span>
                        )}
                    </div>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-slate-700">시놉시스 및 최종 대본 (불러옴)</Label>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-[120px] overflow-y-auto text-sm font-mono text-slate-600 leading-relaxed shadow-inner">
                                    {script || "저장된 대본이 없습니다. '기획 및 줄거리' 메뉴에서 대본을 먼저 생성하세요."}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-slate-700">비주얼 스타일 일관성 지정</Label>
                                    <Select value={visualStyle} onValueChange={setVisualStyle}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="스타일 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cinematic">Cinematic (실사 영화풍)</SelectItem>
                                            <SelectItem value="anime">Anime (정교한 2D 애니메이션)</SelectItem>
                                            <SelectItem value="pixar">3D Pixar (귀여운 3D 렌더링)</SelectItem>
                                            <SelectItem value="comic">Comic Book (미국 코믹스풍)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleSplitScenes}
                                    disabled={isGenerating || !script}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                                >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    {isGenerating ? '장면 분석 및 분할 중...' : '🔥 AI 컷씬 자동 분할 (Timeline 생성)'}
                                </Button>
                            </div>
                        </div>
                        {errorMsg && <p className="text-sm font-bold text-red-500 mt-2">{errorMsg}</p>}
                    </CardContent>
                </Card>

                {/* 2. 타임라인 / 씬 블록 에디터 영역 */}
                {scenes.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                    <Film className="w-5 h-5 text-indigo-600" />
                                    컷씬 블록 에디터 (총 {scenes.length} 컷)
                                </h3>
                                <p className="text-sm font-semibold text-slate-500">순서대로 각 블록의 이미지와 음성을 채워주세요.</p>
                            </div>
                            <Button
                                onClick={handleGenerateAll}
                                disabled={isBatchGenerating}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                            >
                                {isBatchGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                전체 씬 자동 완성 (이미지+음성)
                            </Button>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 font-bold p-4 rounded-lg border border-red-200 shadow-sm mb-4">
                                {errorMsg}
                            </div>
                        )}

                        {scenes.map((scene, idx) => (
                            <Card key={idx} className="border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col md:flex-row hover:border-indigo-300 transition-colors">

                                {/* 좌측 (시각/청각 미디어 슬롯) */}
                                <div className="w-full md:w-1/3 bg-slate-100 p-4 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col gap-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="bg-slate-800 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                                            SCENE {scene.sceneNumber}
                                        </span>
                                    </div>

                                    {/* 이미지 생성 슬롯 뷰어 영역 */}
                                    <div className="aspect-video bg-slate-200 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 group relative overflow-hidden h-40">
                                        {sceneImages[idx] ? (
                                            <>
                                                <Image src={sceneImages[idx]} alt={`Scene ${idx + 1}`} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGenerateImage(idx, scene.imagePrompt)}
                                                        disabled={generatingImageIndex === idx}
                                                        className="bg-white/90 hover:bg-white text-indigo-700 font-bold shadow-lg"
                                                    >
                                                        {generatingImageIndex === idx ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />} 다시 그리기
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {generatingImageIndex === idx ? (
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Loader2 className="w-8 h-8 mb-2 text-indigo-500 animate-spin" />
                                                        <span className="text-xs font-bold font-sans text-indigo-600">진짜 그림을 그리는 중...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                                        <span className="text-xs font-bold font-sans">비어있음 (이미지 생성 대기)</span>
                                                        <div className="absolute inset-0 bg-indigo-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleGenerateImage(idx, scene.imagePrompt)}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg"
                                                            >
                                                                <Sparkles className="w-3 h-3 mr-1" /> 이미지 그리기
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* 오디오 생성 슬롯 */}
                                    <div className="bg-white border border-slate-200 rounded-lg flex flex-col p-3 shadow-sm min-h-[48px] justify-center">
                                        {sceneAudios[idx] ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-indigo-600 mb-1">
                                                    <div className="flex items-center gap-1">
                                                        <Volume2 className="w-4 h-4" />
                                                        <span className="text-xs font-bold">오디오 생성 완료</span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleGenerateAudio(idx, scene.sceneDescription)}
                                                        disabled={generatingAudioIndex === idx}
                                                        className="h-6 px-2 text-[10px] text-slate-500 hover:text-indigo-600"
                                                    >
                                                        {generatingAudioIndex === idx ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />} 다시 생성
                                                    </Button>
                                                </div>
                                                <audio controls src={sceneAudios[idx]} className="w-full h-8" />
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Volume2 className="w-4 h-4" />
                                                    <span className="text-xs font-bold font-sans">오디오 미생성</span>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleGenerateAudio(idx, scene.sceneDescription)}
                                                    disabled={generatingAudioIndex === idx}
                                                    className="h-7 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200"
                                                >
                                                    {generatingAudioIndex === idx ? (
                                                        <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> 생성 중...</>
                                                    ) : (
                                                        <><Sparkles className="w-3 h-3 mr-1" /> 생성</>
                                                    )}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 우측 (텍스트/자막 및 메타데이터 영역) */}
                                <div className="flex-1 p-6 flex flex-col gap-5">
                                    {/* 1. 씬 요약 */}
                                    <div>
                                        <Label className="text-xs font-black text-indigo-500 tracking-wider uppercase mb-1 flex items-center gap-1">
                                            <Type className="w-3 h-3" /> Scene Action
                                        </Label>
                                        <p className="text-sm font-bold text-slate-800 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                            {scene.sceneDescription}
                                        </p>
                                    </div>

                                    {/* 2. 자막/대사 커스텀 영역 */}
                                    <div>
                                        <Label className="text-xs font-black text-slate-500 tracking-wider uppercase mb-1">
                                            Subtitles / Dialog
                                        </Label>
                                        <Textarea
                                            defaultValue={scene.sceneDescription}
                                            className="min-h-[80px] bg-white border-slate-200 text-sm font-medium text-slate-900 shadow-inner resize-y focus-visible:ring-indigo-500"
                                        />
                                        <p className="text-[11px] font-medium text-slate-400 mt-1.5 ml-1">* 이 텍스트로 영상 화면에 구워질 자막과 목소리(TTS)가 생성됩니다.</p>
                                    </div>

                                    {/* 3. 프롬프트 확인 및 수정 영역 */}
                                    <div>
                                        <Label className="text-xs font-black text-slate-500 tracking-wider uppercase mb-1 flex justify-between items-center">
                                            <span>Image Generation Prompt</span>
                                        </Label>
                                        <Textarea
                                            readOnly
                                            value={scene.imagePrompt}
                                            className="min-h-[60px] bg-slate-50 border-slate-200 text-[11px] font-mono text-slate-500 shadow-inner"
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
