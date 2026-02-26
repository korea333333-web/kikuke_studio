"use client";

import React, { useState, useEffect } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StoryContextPanel } from '@/components/StoryContextPanel';

export default function CharacterPlanningPage() {
    const {
        videoFormat,
        topic,
        targetAudience,
        tone,
        synopsis,
        title,
        characterSheet,
        setCharacterSheet,
        scenePrompts,
        setScenePrompts,
        visualStyle: storeVisualStyle,
        cameraAngle: storeCameraAngle,
        lighting: storeLighting,
    } = useStoryStore();
    const [step, setStep] = useState(1);

    const [localTopic, setLocalTopic] = useState(topic);
    const [localTarget, setLocalTarget] = useState(targetAudience);
    const [localTone, setLocalTone] = useState(tone);
    const [localSynopsis, setLocalSynopsis] = useState(synopsis);

    // [Step 1] Option States (Moved from script studio)
    const [length, setLength] = useState("10000");
    const [endingStyle, setEndingStyle] = useState("complete");
    const [episodeCount, setEpisodeCount] = useState("3");

    // Character Generation States
    const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [visualStyle, setVisualStyle] = useState(storeVisualStyle || "cinematic");
    const [errorMsg, setErrorMsg] = useState("");

    const handleNext = () => setStep(step < 2 ? step + 1 : 2);
    const handlePrev = () => setStep(step > 1 ? step - 1 : 1);

    const handleGenerateCharacter = async () => {
        setIsGeneratingCharacter(true);
        setErrorMsg("");
        try {
            const res = await fetch('/api/generate-character', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoFormat,
                    topic: localTopic,
                    targetAudience: localTarget,
                    tone: localTone,
                    synopsis: localSynopsis,
                    title: title,
                    length,
                    episodeCount: endingStyle === 'cliffhanger' ? episodeCount : '1',
                    endingStyle,
                    visualStyle: storeVisualStyle,
                    lighting: storeLighting,
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "서버 응답 오류");
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setCharacterSheet(data.characterSheet || '생성 실패');
        } catch (err: any) {
            setErrorMsg(err.message || "캐릭터 시트 생성 중 오류가 발생했습니다.");
            setCharacterSheet('오류 발생: ' + (err.message || '알 수 없는 오류'));
        } finally {
            setIsGeneratingCharacter(false);
        }
    };

    const handleGeneratePrompt = async () => {
        setIsGeneratingPrompt(true);
        setErrorMsg("");
        try {
            const res = await fetch('/api/generate-visual-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tone: localTone,
                    synopsis: localSynopsis,
                    characterSheet: characterSheet,
                    visualStyle: storeVisualStyle || visualStyle,
                    lighting: storeLighting,
                    cameraAngle: storeCameraAngle,
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "서버 응답 오류");
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.visualPrompts) {
                // 이전에는 단일 문자열이었지만, 이제는 객체 배열의 JSON 문자열 형태로 저장
                setScenePrompts([JSON.stringify(data.visualPrompts)]);
            }
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "프롬프트 렌더링 중 오류가 발생했습니다.");
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <StoryContextPanel />
            <div className="w-full max-w-5xl p-8 mt-12">
                {/* 헤더 영역 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">캐릭터 및 룩북 기획</h2>
                    <p className="text-gray-500">기본 설정을 바탕으로 영상에 등장할 캐릭터와 시각적 스타일을 기획합니다.</p>
                </div>

                {/* 상단 스텝 버튼 (알약 형태) */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => setStep(1)}
                        className={`px-5 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${step === 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        1. 캐릭터 기획
                    </button>
                    <button
                        onClick={() => setStep(2)}
                        className={`px-5 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${step === 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        2. 룩북 프롬프트
                    </button>
                </div>

                {step === 1 && (
                    <Card className="border shadow-sm bg-white rounded-xl">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 antialiased">Step 1. 생성 옵션 및 메인 캐릭터 기획</h3>

                            {/* --- 스케일/옵션 설정 영역 --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-100">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-900">목표 영상 길이(대본 분량)</Label>
                                    <Select value={length} onValueChange={setLength}>
                                        <SelectTrigger className="w-full bg-white h-11 border-slate-200">
                                            <SelectValue placeholder="분량 선택" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1000">1분 쇼츠/영상 (약 1,000자)</SelectItem>
                                            <SelectItem value="3000">3분 영상 (약 3,000자)</SelectItem>
                                            <SelectItem value="5000">5분 영상 (약 5,000자)</SelectItem>
                                            <SelectItem value="10000">10분 영상 (약 10,000자)</SelectItem>
                                            <SelectItem value="15000">15분 영상 (약 15,000자)</SelectItem>
                                            <SelectItem value="30000">30분 영상 (약 30,000자)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11.5px] text-gray-500 leading-snug">
                                        * 길이에 비례해 AI가 극을 이끌어갈 등장인물의 수(스케일)를 유동적으로 판단합니다.
                                    </p>
                                </div>

                                {videoFormat === 'drama' && (
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold text-gray-900">대본 엔딩 구조 (결말)</Label>
                                            <Select value={endingStyle} onValueChange={setEndingStyle}>
                                                <SelectTrigger className="w-full bg-indigo-50 border-indigo-200 text-indigo-900 font-medium h-11">
                                                    <SelectValue placeholder="엔딩 구조 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="complete">단편 완결형 (한 편으로 깔끔하게 해소)</SelectItem>
                                                    <SelectItem value="cliffhanger">장편 시리즈물 (다음 화가 엄청 궁금하게 끝남 ✨)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {endingStyle === "cliffhanger" && (
                                            <div className="space-y-3 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                                <Label className="text-sm font-semibold text-indigo-900">제작 세부 설정 (몇 편으로 끝낼까요?)</Label>
                                                <Select value={episodeCount} onValueChange={setEpisodeCount}>
                                                    <SelectTrigger className="w-full bg-white h-10 text-sm border-indigo-100">
                                                        <SelectValue placeholder="제작 편수 선택" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="2">2 부작 (상/하편)</SelectItem>
                                                        <SelectItem value="3">3 부작</SelectItem>
                                                        <SelectItem value="5">5 부작</SelectItem>
                                                        <SelectItem value="10">10 부작</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[11px] text-indigo-600 leading-snug">
                                                    * 제미나이 2.5 Pro의 방대한 컨텍스트(200만 토큰) 성능을 활용해 {episodeCount}편 분량의 대본을 한 번에 통합 연결하여 작성해줍니다.<br />
                                                    * 1편부터 {parseInt(episodeCount) - 1}편까지는 기막힌 반전 요소로 궁금증을 유발하며 끝나고, 마지막 {episodeCount}편에서만 완벽히 매듭짓는 결말이 완성됩니다.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 mb-6 font-medium">입력하신 위 설정과 기획안 바탕으로 영상에 등장할 매력적인 인물들을 AI가 스케일링하여 창조합니다.</p>

                            <div className="bg-slate-50 border rounded-lg p-5 mb-6 text-sm text-gray-700">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label className="text-xs font-bold text-gray-900 mb-1 block">주제 / 키워드</Label>
                                        <div className="bg-white p-2 border rounded text-xs">{localTopic || "N/A"}</div>
                                    </div>
                                    <div>
                                        <Label className="text-xs font-bold text-gray-900 mb-1 block">톤앤매너</Label>
                                        <div className="bg-white p-2 border rounded text-xs">{localTone || "N/A"}</div>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs font-bold text-gray-900 mb-1 block">요약 줄거리 (시놉시스)</Label>
                                    <Textarea
                                        value={localSynopsis}
                                        onChange={(e) => setLocalSynopsis(e.target.value)}
                                        className="bg-white border-gray-200 text-xs min-h-[80px] focus-visible:ring-indigo-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1">* 텍스트를 수정하면 변경된 내용으로 캐릭터가 생성됩니다.</p>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 text-sm font-medium mb-4">{errorMsg}</div>
                            )}

                            <div className="flex items-center gap-2 mb-6">
                                <Button
                                    onClick={handleGenerateCharacter}
                                    disabled={isGeneratingCharacter || !topic}
                                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-6 text-lg font-semibold"
                                >
                                    {isGeneratingCharacter ? '핵심 인물 설정 및 외형 기획 중...' : (characterSheet ? '캐릭터 시트 다시 기획하기' : 'AI 캐릭터 시트 기획하기')}
                                </Button>
                            </div>

                            <div className="border rounded-xl p-6 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-900 text-sm">기획된 캐릭터 시트</h4>
                                </div>

                                <div className="space-y-2 mb-4">
                                    {isGeneratingCharacter && (
                                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50/50 p-3 rounded-md border border-blue-100 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                            제미나이가 인물 정보를 세밀하게 기획하고 있습니다...
                                        </div>
                                    )}
                                    <Textarea
                                        className="min-h-[400px] w-full bg-slate-100/50 border border-gray-200 rounded-md p-6 text-sm text-gray-800 font-mono shadow-inner resize-y"
                                        value={characterSheet}
                                        onChange={(e) => setCharacterSheet(e.target.value)}
                                        placeholder="상단의 '기획하기' 버튼을 눌러주세요. 생성에 약 10~15초 정도 소요됩니다."
                                    />
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <Button onClick={handleNext} disabled={!characterSheet} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                                        다음: 룩북 프롬프트 생성 →
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border shadow-sm bg-white rounded-xl">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">Step 2. 룩북(스타일) 프롬프트 생성</h3>
                            <p className="text-sm text-gray-600 mb-8">확보된 캐릭터 시트를 바탕으로, 미드저니 등에서 일관성을 유지할 수 있는 기본 영문 프롬프트를 짭니다.</p>

                            <div className="space-y-6 mb-8">
                                {/* 시각화 스타일 */}
                                <div className="space-y-2">
                                    <Label htmlFor="tone" className="text-sm font-semibold text-gray-900">전반적인 톤앤매너</Label>
                                    <Textarea
                                        id="tone"
                                        value={localTone}
                                        onChange={(e) => setLocalTone(e.target.value)}
                                        placeholder="예: 진지하게, 코믹하게, 정보 전달 위주로..."
                                        className="bg-white border-gray-200 outline-none focus-visible:ring-indigo-500"
                                    />
                                </div>

                                {/* [NEW] 시놉시스 (줄거리) 컨텍스트 */}
                                <div className="space-y-2 md:col-span-2 mt-4">
                                    <div className="flex justify-between">
                                        <Label htmlFor="synopsis" className="text-sm font-semibold text-gray-900">사전 기획된 줄거리 요약 (시놉시스)</Label>
                                        <span className="text-xs text-indigo-500 font-medium">이 줄거리에 어울리는 인물들이 창조됩니다.</span>
                                    </div>
                                    <Textarea
                                        id="synopsis"
                                        value={localSynopsis}
                                        onChange={(e) => setLocalSynopsis(e.target.value)}
                                        placeholder="기획안 단계에서 생성된 줄거리가 여기에 표시됩니다. 없으면 직접 입력하셔도 됩니다."
                                        className="bg-indigo-50/30 border-indigo-100 min-h-[120px] outline-none focus-visible:ring-indigo-500 text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900">시각화 스타일</Label>
                                    <Select value={visualStyle} onValueChange={setVisualStyle}>
                                        <SelectTrigger className="w-full text-left font-normal bg-white">
                                            <SelectValue placeholder="스타일을 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cinematic">Cinematic (영화 같은 실사)</SelectItem>
                                            <SelectItem value="anime">Anime (일본 애니메이션 풍)</SelectItem>
                                            <SelectItem value="3d">3D Animation (디즈니/픽사 풍)</SelectItem>
                                            <SelectItem value="webtoon">Webtoon (한국 웹툰 풍)</SelectItem>
                                            <SelectItem value="watercolor">Watercolor (수채화 동화책 풍)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* 프롬프트 결과창 */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-900 text-sm">생성된 룩북 프롬프트 (Midjourney / AI Image Generator)</h4>
                                </div>
                                {isGeneratingPrompt && (
                                    <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium bg-indigo-50 p-3 rounded-md border border-indigo-100 mb-4">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                                        제미나이가 각 캐릭터별 고품질 영문 프롬프트를 작성 중입니다...
                                    </div>
                                )}

                                {scenePrompts[0] && (() => {
                                    try {
                                        const prompts = JSON.parse(scenePrompts[0]);
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {prompts.map((p: any, idx: number) => (
                                                    <div key={idx} className="border rounded-xl p-5 bg-slate-50 border-slate-200 shadow-sm flex flex-col">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <div className="font-bold text-sm text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full">{p.target}</div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    navigator.clipboard.writeText(p.prompt);
                                                                    const btn = e.currentTarget;
                                                                    const originalText = btn.innerHTML;
                                                                    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check mr-1.5"><path d="M20 6 9 17l-5-5"/></svg> 복사됨';
                                                                    btn.classList.add('text-emerald-600', 'border-emerald-200', 'bg-emerald-50');
                                                                    setTimeout(() => {
                                                                        btn.innerHTML = originalText;
                                                                        btn.classList.remove('text-emerald-600', 'border-emerald-200', 'bg-emerald-50');
                                                                    }, 2000);
                                                                }}
                                                                className="h-7 text-[11px] font-semibold text-slate-600 px-3"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                                                프롬프트 복사
                                                            </Button>
                                                        </div>
                                                        {/* 한글 해석 */}
                                                        {p.koreanDescription && (
                                                            <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                                                                <p className="text-xs text-blue-800 leading-relaxed">
                                                                    <span className="font-bold text-blue-600 mr-1">🇰🇷 한글 해석:</span>
                                                                    {p.koreanDescription}
                                                                </p>
                                                            </div>
                                                        )}
                                                        <Textarea
                                                            className="min-h-[120px] w-full bg-white border border-gray-200 rounded-md p-3 text-xs text-gray-800 font-mono shadow-inner resize-y mt-2 flex-grow"
                                                            value={p.prompt}
                                                            readOnly
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (e) {
                                        // 호환성 유지: 이전 방식(단일 문자열) 처리
                                        return (
                                            <div className="border rounded-xl p-6 bg-slate-50/50 mb-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-bold text-gray-900 text-sm">기본 룩북 프롬프트</h4>
                                                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(scenePrompts[0])}>단일 프롬프트 복사</Button>
                                                </div>
                                                <Textarea value={scenePrompts[0]} readOnly className="min-h-[150px] text-xs font-mono" />
                                            </div>
                                        );
                                    }
                                })()}

                                {!scenePrompts[0] && !isGeneratingPrompt && (
                                    <div className="border rounded-xl p-6 bg-slate-50/50 mb-6 text-center text-sm text-gray-500">
                                        상단의 &apos;스타일 프롬프트 추출&apos; 버튼을 누르면 캐릭터별 영문 키워드가 생성됩니다.
                                    </div>
                                )}
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 text-sm font-medium mb-4">{errorMsg}</div>
                            )}

                            {/* 하단 버튼 블록 */}
                            <div className="flex items-center gap-3">
                                <Button onClick={handlePrev} className="w-[100px] bg-gray-500 hover:bg-gray-600 text-white font-semibold py-6 rounded-lg shadow-sm">
                                    ← 이전
                                </Button>
                                <Button
                                    onClick={handleGeneratePrompt}
                                    disabled={!characterSheet || isGeneratingPrompt}
                                    className="flex-1 bg-[#0f52ba] hover:bg-blue-700 text-white font-semibold py-6 rounded-lg shadow-sm"
                                >
                                    {isGeneratingPrompt ? '프롬프트 생성 중...' : (scenePrompts[0] ? '프롬프트 다시 생성하기' : '스타일 프롬프트 추출')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
