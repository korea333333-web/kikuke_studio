"use client";

import React, { useState } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, BrainCircuit, TextSelect, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import { StoryContextPanel } from '@/components/StoryContextPanel';

export default function SynopsisPlanningPage() {
    const { videoFormat, topic, targetAudience, tone, setSynopsis, setTitle, title: storedTitle, synopsis: storedSynopsis } = useStoryStore();
    const router = useRouter();

    const [isGenerating, setIsGenerating] = useState(false);
    const [recommendedOptions, setRecommendedOptions] = useState<{ title: string, synopsis: string }[]>([]);
    const [localSynopsis, setLocalSynopsis] = useState(storedSynopsis || "");
    const [selectedTitle, setSelectedTitle] = useState(storedTitle || "");
    const [errorMsg, setErrorMsg] = useState("");

    const handleGenerate = async () => {
        setIsGenerating(true);
        setErrorMsg("");

        try {
            const res = await fetch('/api/generate-synopsis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoFormat, topic, targetAudience, tone })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "서버 응답 오류");
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setRecommendedOptions(data.options || []);

            if (data.options && data.options.length > 0) {
                setSelectedTitle(data.options[0].title);
                setLocalSynopsis(data.options[0].synopsis);
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "기획안을 생성하는 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNextStep = () => {
        // Save to global store
        setSynopsis(localSynopsis);
        setTitle(selectedTitle);
        // Move to next page based on format
        if (videoFormat === 'narration') {
            router.push('/title-content'); // Skip character planning
        } else {
            router.push('/story-script');
        }
    };

    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <StoryContextPanel />
            <div className="w-full max-w-5xl p-8 mt-12 mb-12">
                {/* 헤더 영역 */}
                <div className="mb-8 border-b pb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6 text-indigo-600" />
                        기획안 및 줄거리 요약
                    </h2>
                    <p className="text-gray-500">
                        기본 설정을 바탕으로 영상의 전체적인 흐름(시놉시스)과 시선을 끄는 제목을 미리 구성합니다.<br />
                        {videoFormat === 'narration' ? <strong className="text-blue-600">이 줄거리를 바탕으로 곧바로 대본 및 메타데이터 작성을 진행합니다.</strong> : <span>이 줄거리가 다음 단계인 <strong>'캐릭터 및 룩북 기획'</strong>의 바탕이 됩니다.</span>}
                    </p>
                </div>

                <Card className="border shadow-sm bg-white rounded-xl mb-8">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 antialiased">초안 기획 자동화</h3>
                        </div>

                        {/* 현재 설정 요약 */}
                        <div className="bg-slate-50 border rounded-lg p-5 mb-6 flex flex-wrap gap-8 text-sm text-gray-700">
                            <div>
                                <span className="font-bold text-gray-900 block mb-1">영상 구조</span>
                                {videoFormat === 'narration' ? '🎙️ 정보/내레이션' : '📝 이야기'}
                            </div>
                            <div>
                                <span className="font-bold text-gray-900 block mb-1">입력된 주제/키워드</span>
                                {topic || <span className="text-red-500 italic">기본 설정에서 주제를 입력해주세요.</span>}
                            </div>
                            <div>
                                <span className="font-bold text-gray-900 block mb-1">타겟 시청자</span>
                                {targetAudience || "-"}
                            </div>
                            <div>
                                <span className="font-bold text-gray-900 block mb-1">영상 톤앤매너</span>
                                {tone || "-"}
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="text-red-500 text-sm font-medium mb-4">{errorMsg}</div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-lg rounded-lg shadow-sm mb-2"
                        >
                            <BrainCircuit className="w-5 h-5 mr-3" />
                            {isGenerating ? 'AI가 기원안을 구상 중입니다...' : '요약 줄거리 및 추천 제목 생성하기'}
                        </Button>
                    </CardContent>
                </Card>

                {/* 결과 화면 패널 */}
                {(localSynopsis || recommendedOptions.length > 0) && (
                    <Card className="border shadow-sm bg-white rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardContent className="p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 antialiased">AI 기획 제안 결과</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* 좌측: 추천 기획안 선택 */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <TextSelect className="w-5 h-5 text-rose-500" />
                                        <h4 className="font-bold text-gray-900 text-[15px]">추천 기획안 옵션</h4>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">마음에 드는 기획안을 클릭해서 선택해 주세요. (우측에서 내용을 바로 수정할 수 있습니다)</p>

                                    <div className="space-y-3">
                                        {recommendedOptions.map((opt, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedTitle(opt.title);
                                                    setLocalSynopsis(opt.synopsis);
                                                }}
                                                className={`flex flex-col gap-2 p-4 border rounded-xl cursor-pointer transition-all ${selectedTitle === opt.title ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500 shadow-sm' : 'border-gray-200 bg-white hover:border-rose-300 hover:bg-gray-50'}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${selectedTitle === opt.title ? 'border-rose-500 bg-rose-500' : 'border-gray-300'}`}>
                                                        {selectedTitle === opt.title && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-sm font-bold text-gray-800 leading-tight block mb-1">{opt.title}</span>
                                                        <span className="text-xs text-gray-600 line-clamp-2">{opt.synopsis}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 현재 선택된 제목 강제 입력/수정 */}
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <label className="text-xs font-bold text-gray-700 block mb-2">선택된 제목 수정 (최종 반영 제목)</label>
                                        <input
                                            type="text"
                                            value={selectedTitle}
                                            onChange={(e) => setSelectedTitle(e.target.value)}
                                            className="w-full text-sm font-semibold p-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-rose-500 outline-none transition-shadow"
                                            placeholder="원하는 제목을 직접 입력해도 됩니다."
                                        />
                                    </div>
                                </div>

                                {/* 우측: 시놉시스 (줄거리) */}
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-indigo-500" />
                                            <h4 className="font-bold text-gray-900 text-[15px]">시놉시스 (전체 줄거리 요약)</h4>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">AI가 제안한 전체 흐름입니다. 다음 단계에서 캐릭터가 이 줄거리에 맞게 생성됩니다. 원하시면 내용을 수정하세요.</p>

                                    <Textarea
                                        value={localSynopsis}
                                        onChange={(e) => setLocalSynopsis(e.target.value)}
                                        className="flex-1 min-h-[300px] h-full bg-slate-50/70 border-gray-200 text-sm text-gray-700 leading-relaxed font-mono resize-none focus-visible:ring-indigo-500 p-5 shadow-inner rounded-xl"
                                        placeholder="줄거리 내용이 여기에 생성됩니다."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-10 border-t pt-8">
                                <Button
                                    onClick={handleNextStep}
                                    className="bg-gray-900 hover:bg-black text-white px-8 py-6 rounded-xl text-md font-bold shadow-md flex items-center gap-2"
                                >
                                    이 설정으로 캐릭터 기획하기 <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
                }
            </div >
        </div >
    );
}
