"use client";

import React, { useState, useEffect } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StoryContextPanel } from '@/components/StoryContextPanel';
import { Sparkles, FileText, History, Trash2, ChevronRight, Save } from "lucide-react";
import { format } from "date-fns";

export default function ScriptStudioPage() {
  // ---- GLOBAL STORE ----
  const {
    videoFormat, topic, targetAudience, tone, synopsis, title,
    characterSheet, setCharacterSheet,
    scenePrompts, setScenePrompts,
    script, setScript, setTitle,
    scriptHistory, addScriptToHistory, deleteScriptFromHistory
  } = useStoryStore();

  // ---- LOCAL UI STATE ----
  const [step, setStep] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // [Step 1] Option States
  const [length, setLength] = useState("10000");
  const [endingStyle, setEndingStyle] = useState("complete");
  const [episodeCount, setEpisodeCount] = useState("3");

  // [Step 2] Character States
  const [localSynopsis, setLocalSynopsis] = useState("");
  const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);

  // [Step 3] Prompt States
  const [visualStyle, setVisualStyle] = useState("cinematic");
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // [Step 4] Script States
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync initial synopsis from store
  useEffect(() => {
    if (!localSynopsis && synopsis) {
      setLocalSynopsis(synopsis);
    }
  }, [synopsis]);

  // ---- HANDLERS ----
  const handleNext = () => setStep(step < 4 ? step + 1 : 4);
  const handlePrev = () => setStep(step > 1 ? step - 1 : 1);

  // [Action] Generate Characters
  const handleGenerateCharacter = async () => {
    setIsGeneratingCharacter(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/generate-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoFormat, topic, targetAudience, tone, synopsis: localSynopsis, title })
      });
      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCharacterSheet(data.characterSheet);
      handleNext();
    } catch (err: any) {
      setErrorMsg(err.message || "캐릭터 시트 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingCharacter(false);
    }
  };

  // [Action] Generate Lookbook Prompts
  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/generate-visual-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, synopsis: localSynopsis, characterSheet, visualStyle })
      });
      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setScenePrompts([JSON.stringify(data.visualPrompts)]);
    } catch (err: any) {
      setErrorMsg(err.message || "프롬프트 렌더링 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // [Action] Generate Main Script
  const handleGenerateScript = async () => {
    setIsGeneratingScript(true);
    setErrorMsg("");
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoFormat, topic, targetAudience, tone, length,
          characterSheet, endingStyle, episodeCount,
          synopsis: localSynopsis, title
        })
      });
      if (!res.ok) throw new Error("서버 응답 오류");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newScript = data.script || "";
      const newTitle = data.titles?.[0] || title;
      setScript(newScript);
      setTitle(newTitle);

      // AUTO SAVE TO HISTORY
      addScriptToHistory({
        title: newTitle,
        script: newScript,
        characterSheet,
        endingStyle,
        episodeCount: endingStyle === 'cliffhanger' ? episodeCount : undefined
      });

    } catch (err: any) {
      setErrorMsg(err.message || "대본 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // [Action] Load from History
  const loadHistory = (entry: any) => {
    setTitle(entry.title);
    setScript(entry.script);
    setCharacterSheet(entry.characterSheet);
    if (entry.endingStyle) setEndingStyle(entry.endingStyle);
    if (entry.episodeCount) setEpisodeCount(entry.episodeCount);
    setStep(4); // Move directly to script view
    setIsSidebarOpen(false); // Close sidebar automatically on mobile
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden relative">

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <StoryContextPanel />

        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 mt-12 pb-32">
          {/* Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">대본 기획 스튜디오</h2>
              <p className="text-gray-500 text-sm">영상 규모를 결정하고 캐릭터를 구체화하여 최종 대본을 생성합니다.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              <History size={16} />
              <span className="hidden sm:inline">저장된 기획안 보기</span>
              {scriptHistory.length > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {scriptHistory.length}
                </span>
              )}
            </Button>
          </div>

          {/* Stepper Navigation */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {[
              { num: 1, label: '스케일 설정' },
              { num: 2, label: '캐릭터 캐스팅' },
              { num: 3, label: '룩북 프롬프트' },
              { num: 4, label: '대본 & 메타데이터' }
            ].map((s) => (
              <React.Fragment key={s.num}>
                <button
                  onClick={() => setStep(s.num)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white text-gray-400 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {s.num}. {s.label}
                </button>
                {s.num < 4 && <ChevronRight className="text-gray-300 w-4 h-4 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium mb-6 border border-red-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {errorMsg}
            </div>
          )}

          {/* ----------------- STEP 1: OPTIONS & SCALE ----------------- */}
          {step === 1 && (
            <Card className="border shadow-sm bg-white rounded-xl mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 antialiased">Step 1. 대본 기획 스케일(규모) 설정</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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
                        <Label className="text-sm font-semibold text-gray-900">대본 전개 구조 (엔딩 방식)</Label>
                        <Select value={endingStyle} onValueChange={setEndingStyle}>
                          <SelectTrigger className="w-full bg-indigo-50 border-indigo-200 text-indigo-900 font-medium h-11">
                            <SelectValue placeholder="엔딩 구조 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="complete">단편 완결형 (한 편으로 깔끔하게 해소)</SelectItem>
                            <SelectItem value="cliffhanger">장편 시리즈물 (다음 화가 궁금하게 끝남 ✨)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {endingStyle === "cliffhanger" && (
                        <div className="space-y-3 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                          <Label className="text-sm font-semibold text-indigo-900">제작 세부 설정 (몇 부작?)</Label>
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
                            1편부터 {parseInt(episodeCount) - 1}편까지는 기막힌 반전(클리프행거)으로 궁금증을 유발하며 끝나고, 마지막 {episodeCount}편에서만 완벽히 매듭짓는 결론이 완성됩니다.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-8">다음: 캐릭터 캐스팅 →</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ----------------- STEP 2: CHARACTER GEN ----------------- */}
          {step === 2 && (
            <Card className="border shadow-sm bg-white rounded-xl mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">Step 2. AI 인물(캐릭터) 스케일링 캐스팅</h3>
                <p className="text-sm text-gray-600 mb-6">설정한 영상 규모({length}자{endingStyle === 'cliffhanger' ? `, ${episodeCount}부작` : ''})에 맞춰 조연/반동인물까지 넉넉하게 스케일을 기획해 줍니다.</p>

                <div className="bg-slate-50 border rounded-lg p-5 mb-6">
                  <Label className="text-xs font-bold text-gray-900 mb-1 block">요약 줄거리 (시놉시스 수정 가능)</Label>
                  <Textarea
                    value={localSynopsis}
                    onChange={(e) => setLocalSynopsis(e.target.value)}
                    className="bg-white border-gray-200 text-sm min-h-[100px] focus-visible:ring-indigo-500"
                    placeholder="이전 기획 단계에서 작성한 시놉시스가 없습니다. 자유롭게 줄거리를 적어주세요."
                  />
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Button onClick={handlePrev} variant="outline" className="w-[100px]">← 이전</Button>
                  <Button
                    onClick={handleGenerateCharacter}
                    disabled={isGeneratingCharacter || !topic}
                    className="flex-1 bg-slate-800 hover:bg-black text-white py-6 text-lg font-semibold shadow-md"
                  >
                    {isGeneratingCharacter ? '캐릭터 시트 분석 & 스케일링 기획 중...' : (characterSheet ? '스케일에 맞춰 재캐스팅 🔄' : 'AI 인물 캐스팅 시작하기')}
                  </Button>
                </div>

                {characterSheet && (
                  <div className="border rounded-xl p-6 bg-blue-50/30 border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-blue-900 text-sm">확정된 캐릭터 시트</h4>
                    </div>
                    <Textarea
                      className="min-h-[300px] w-full bg-white border border-gray-200 rounded-md p-6 text-sm text-gray-800 font-mono shadow-inner resize-y"
                      value={characterSheet}
                      onChange={(e) => setCharacterSheet(e.target.value)}
                    />
                    <div className="flex justify-end mt-4">
                      <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white px-8">다음: 프롬프트 기획 →</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ----------------- STEP 3: LOOKBOOK PROMPTS ----------------- */}
          {step === 3 && (
            <Card className="border shadow-sm bg-white rounded-xl mb-8">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">Step 3. 룩북 프롬프트 추출</h3>
                <p className="text-sm text-gray-600 mb-6">확정된 다수의 캐릭터를 미드저니 등에서 생성할 수 있게 영문 프롬프트 묶음으로 파싱합니다.</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">시각화 스타일 지정 옵션</Label>
                    <Select value={visualStyle} onValueChange={setVisualStyle}>
                      <SelectTrigger className="w-full bg-white h-11">
                        <SelectValue placeholder="스타일을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinematic">Cinematic (영화 실사풍)</SelectItem>
                        <SelectItem value="anime">Anime (초고퀄 애니메이션)</SelectItem>
                        <SelectItem value="webtoon">Webtoon (한국식 웹툰풍)</SelectItem>
                        <SelectItem value="3d">3D Animation (픽사풍 3D)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={!characterSheet || isGeneratingPrompt}
                    className="h-11 mt-6 px-6 bg-slate-800 hover:bg-black text-white font-semibold"
                  >
                    {isGeneratingPrompt ? '영문 추출 중...' : '프롬프트 추출하기'}
                  </Button>
                </div>

                {scenePrompts[0] && (
                  <div className="border rounded-xl p-6 bg-slate-50 border-slate-200 mb-6">
                    <Textarea value={scenePrompts[0]} readOnly className="min-h-[150px] text-xs font-mono mb-4 bg-white" />
                    <p className="text-xs text-gray-500 mb-4">* 위 프롬프트를 텍스트로 보조 보관합니다.</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button onClick={handlePrev} variant="outline" className="w-[100px]">← 이전</Button>
                  <Button onClick={handleNext} disabled={!characterSheet} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-md">
                    최종: 텍스트 대본 생성하기 →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ----------------- STEP 4: MAIN SCRIPT GEN ----------------- */}
          {step === 4 && (
            <Card className="border shadow-sm bg-white rounded-xl mb-8">
              <CardContent className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 antialiased">Step 4. 최종 메인 대본 파싱</h3>
                    <p className="text-sm text-gray-600 mt-1">스케일과 다수 인물 설정을 모두 결합하여 제미나이(Gemini 2.5)가 전체 대본 구조를 짭니다.</p>
                  </div>
                  <Button onClick={handlePrev} variant="outline" size="sm">← 설정 돌아가기</Button>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 mb-6 text-sm text-indigo-900 flex justify-between items-center">
                  <span><strong>[스케일 락온]</strong> {length}자 분량 / {endingStyle === 'cliffhanger' ? `시리즈형 ${episodeCount}부작` : '단편 완결형'}</span>
                  <Button
                    onClick={handleGenerateScript}
                    disabled={isGeneratingScript || !characterSheet}
                    className="bg-[#6a35ff] hover:bg-[#5b2bd6] text-white font-semibold flex items-center gap-2 shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingScript ? '집필 중...' : '최종 대본 큐(자동 저장됨)'}
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-bold text-gray-900 mb-2 block">유튜브 썸네일/영상 제목</Label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 font-bold bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="대본을 생성하면 AI가 임시 제목을 제안합니다."
                    />
                  </div>

                  <div className="border rounded-xl p-4 md:p-6 bg-slate-50/50 border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-blue-900 text-base">유튜브 스토리 대본 본문</h4>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(script)} className="h-8 text-xs font-semibold bg-white">전체 복사</Button>
                    </div>
                    <Textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="min-h-[500px] bg-white border-gray-200 text-[13px] md:text-sm text-gray-800 focus-visible:ring-1 focus-visible:ring-blue-500 leading-relaxed font-mono whitespace-pre-wrap shadow-inner"
                      placeholder="상단의 '최종 대본 큐' 버튼을 클릭하면 제미나이가 집필을 시작합니다..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ----------------- HISTORY RIGHT SIDEBAR ----------------- */}
      <div className={`w-[320px] bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out absolute top-0 right-0 bottom-0 z-20 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-indigo-600" />
            기획안 보관함
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {scriptHistory.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-gray-400">
              저장된 기획안이 없습니다.<br />
              Step 4에서 대본을 뽑을 때마다 자동으로 이곳에 저장됩니다. (새로고침해도 날아가지 않습니다)
            </div>
          ) : (
            scriptHistory.map((history, idx) => (
              <div key={history.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => loadHistory(history)}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">통합기획 {scriptHistory.length - idx}안</span>
                  <span className="text-[10px] text-gray-400">{history.timestamp ? format(new Date(history.timestamp), "MM/dd HH:mm") : '날짜 없음'}</span>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{history.title || "제목 없음"}</h4>
                <div className="flex gap-1 mb-3">
                  {history.endingStyle === 'cliffhanger' && (
                    <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">시리즈물({history.episodeCount}부작)</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                  {history.script?.slice(0, 80) || "대본 없음"}...
                </p>
                <div className="flex justify-end gap-2 border-t border-gray-50 pt-3">
                  <Button
                    variant="ghost" size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteScriptFromHistory(history.id);
                    }}
                    className="h-7 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    삭제
                  </Button>
                  <Button
                    variant="secondary" size="sm"
                    className="h-7 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3"
                    onClick={(e) => { e.stopPropagation(); loadHistory(history); }}
                  >
                    불러오기
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
