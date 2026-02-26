"use client";

import React, { useState } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText } from "lucide-react";
import { StoryContextPanel } from '@/components/StoryContextPanel';
import { History, Trash2, ChevronRight, Save } from "lucide-react";
import { format } from "date-fns";

export default function TitleContentPage() {
    const { videoFormat, topic, targetAudience, tone, characterSheet, synopsis, title, setScript, setTitle, setDescription, scriptHistory, addScriptToHistory, deleteScriptFromHistory } = useStoryStore();

    // Local ui state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Request Options
    const [length, setLength] = useState("10000");
    const [endingStyle, setEndingStyle] = useState("complete"); // [NEW] 단편 완결형 vs 시리즈형 클리프행거 옵션
    const [episodeCount, setEpisodeCount] = useState("3"); // [NEW] 총 제작 편수

    // Response State
    const [isGenerating, setIsGenerating] = useState(false);
    const [localScript, setLocalScript] = useState("");
    const [titles, setTitles] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState("");

    const handleGenerate = async () => {
        setIsGenerating(true);
        setErrorMsg("");

        try {
            const res = await fetch('/api/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    videoFormat,
                    topic,
                    targetAudience,
                    tone,
                    characterSheet,
                    synopsis,
                    title
                })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "서버 응답 오류");
            }

            const data = await res.json();

            // Validate and Set State
            if (data.error) throw new Error(data.error);

            setTitles(data.titles || []);
            setLocalScript(data.script || "");

            // Save to Global Store
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
                episodeCount
            });

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || "대본 및 메타데이터 생성 중 오류가 발생했습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    // [Action] Load from History
    const loadHistory = (entry: any) => {
        setTitle(entry.title);
        setScript(entry.script);
        setLocalScript(entry.script);
        // Note: setting characterSheet might overlap with state, but okay for sync
        setIsSidebarOpen(false); // Close sidebar automatically
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">대본 생성 (집필)</h2>
                            <p className="text-gray-500">기획된 내용을 바탕으로 실제 유튜브 영상에 들어갈 전체 대본을 제미나이(Gemini 2.5)가 집필합니다.</p>
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

                    {/* 생성 확인 패널 */}
                    <Card className="border shadow-sm bg-white rounded-xl mb-8">
                        <CardContent className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 antialiased">최종 메인 대본 파싱</h3>
                                    <p className="text-sm text-gray-600 mt-1">이전 단계에서 확정된 스케일과 다수 인물 설정을 모두 결합하여 제미나이(Gemini 2.5)가 전체 대본 구조를 짭니다.</p>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="text-red-500 text-sm font-medium mb-4">{errorMsg}</div>
                            )}

                            <div className="flex justify-end pt-4 border-t">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !characterSheet}
                                    className="w-[300px] bg-[#6a35ff] hover:bg-[#5b2bd6] text-white font-semibold py-6 text-lg rounded-lg shadow-sm"
                                >
                                    <Sparkles className="w-5 h-5 mr-3" />
                                    {isGenerating ? '대본 작성 중...' : '맞춤형 스토리 대본 생성하기'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 결과 화면 패널 */}
                    {(localScript || titles.length > 0) && (
                        <Card className="border shadow-sm bg-white rounded-xl">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <h3 className="text-lg font-bold text-gray-900 antialiased">AI 대본 생성 결과</h3>
                                    <Button className="bg-[#0f52ba] hover:bg-blue-700 text-white font-semibold shadow-sm text-xs h-8">
                                        텍스트 본문 복사
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                    {/* 0. 메인 스토리 대본 */}
                                    <div className="border rounded-xl p-6 bg-slate-50/50 border-blue-200">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-bold text-blue-900 text-base">유튜브 스토리 대본 본문</h4>
                                        </div>
                                        <Textarea
                                            value={localScript}
                                            onChange={(e) => {
                                                setLocalScript(e.target.value);
                                                setScript(e.target.value); // Sync to store
                                            }}
                                            className="min-h-[600px] bg-white border-gray-200 text-sm text-gray-800 focus-visible:ring-1 focus-visible:ring-blue-500 leading-relaxed font-mono whitespace-pre-wrap shadow-inner"
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
                            대본을 뽑을 때마다 자동으로 이곳에 저장됩니다. (새로고침해도 날아가지 않습니다)
                        </div>
                    ) : (
                        scriptHistory.map((history, idx) => (
                            <div key={history.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:border-indigo-300 hover:shadow-md transition-all group cursor-pointer" onClick={() => loadHistory(history)}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">통합기획 {scriptHistory.length - idx}안</span>
                                    <span className="text-[10px] text-gray-400">{(() => { try { const d = new Date(history.timestamp); return isNaN(d.getTime()) ? history.timestamp : format(d, "MM/dd HH:mm"); } catch { return history.timestamp || '날짜 없음'; } })()}</span>
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
