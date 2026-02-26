"use client";

import React, { useState, useEffect } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { StoryContextPanel } from '@/components/StoryContextPanel';
import { loadImage } from '@/lib/imageDB';
import { uploadImage } from '@/lib/supabaseStorage';
import {
    Film, Play, Loader2, Download, ChevronDown, ChevronUp,
    AlertCircle, CheckCircle2, Clock, Clapperboard, RefreshCw,
    Pause, Video
} from 'lucide-react';

// 비디오 데이터 타입
interface VideoData {
    sceneIdx: number;
    cutIdx: number;
    videoUrl: string;
    duration: number;
    status: 'idle' | 'generating' | 'done' | 'error';
    error?: string;
}

export default function VideoStudioPage() {
    const {
        scenes, selectedSceneIndex, setSelectedSceneIndex,
        visualStyle, script, isSceneAnalyzed,
    } = useStoryStore();

    const [videos, setVideos] = useState<Record<string, VideoData>>({});
    const [duration, setDuration] = useState<number>(4);
    const [isGeneratingAll, setIsGeneratingAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [playingVideo, setPlayingVideo] = useState<string | null>(null);
    const [expandedCuts, setExpandedCuts] = useState<Set<string>>(new Set());

    const selectedScene = scenes[selectedSceneIndex];

    // 컷 이미지를 IndexedDB에서 복원
    useEffect(() => {
        if (scenes.length === 0) return;
        const restoreImages = async () => {
            for (let i = 0; i < scenes.length; i++) {
                for (let j = 0; j < scenes[i].cuts.length; j++) {
                    if (!scenes[i].cuts[j].imageUrl) {
                        const cutImg = await loadImage(`cut-${i}-${j}`);
                        if (cutImg) {
                            // 이미지 복원은 읽기 전용으로만 사용
                            scenes[i].cuts[j].imageUrl = cutImg;
                        }
                    }
                }
            }
        };
        restoreImages();
    }, [scenes.length]);

    // ====== 개별 컷 영상 생성 ======
    const handleGenerateVideo = async (sceneIdx: number, cutIdx: number) => {
        const cut = scenes[sceneIdx]?.cuts[cutIdx];
        if (!cut?.imageUrl) {
            setError("이미지가 없는 컷은 영상으로 변환할 수 없어요.");
            return;
        }

        const key = `${sceneIdx}-${cutIdx}`;
        setVideos(prev => ({
            ...prev,
            [key]: { sceneIdx, cutIdx, videoUrl: '', duration, status: 'generating' },
        }));
        setError(null);

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: cut.imageUrl,
                    prompt: cut.imagePrompt || cut.description || 'Smooth cinematic camera movement',
                    duration,
                    aspectRatio: '16:9',
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setVideos(prev => ({
                ...prev,
                [key]: { sceneIdx, cutIdx, videoUrl: data.videoUrl, duration: data.duration, status: 'done' },
            }));
        } catch (err: any) {
            setVideos(prev => ({
                ...prev,
                [key]: { sceneIdx, cutIdx, videoUrl: '', duration, status: 'error', error: err.message },
            }));
            if (err.message?.includes('한도') || err.message?.includes('429')) {
                setError("API 한도 초과. 잠시 후 다시 시도해주세요 ☕");
            }
        }
    };

    // ====== 씬 전체 영상 생성 ======
    const handleGenerateAllVideos = async (sceneIdx: number) => {
        const scene = scenes[sceneIdx];
        if (!scene || scene.cuts.length === 0) return;

        setIsGeneratingAll(true);
        setError(null);

        for (let i = 0; i < scene.cuts.length; i++) {
            const cut = scene.cuts[i];
            const key = `${sceneIdx}-${i}`;

            // 이미 생성된 영상은 건너뛰기
            if (videos[key]?.status === 'done') continue;

            if (!cut.imageUrl) continue;

            await handleGenerateVideo(sceneIdx, i);

            // API 한도 관리: 15초 간격 (영상 생성은 무거움)
            if (i < scene.cuts.length - 1) {
                await new Promise(r => setTimeout(r, 15000));
            }
        }

        setIsGeneratingAll(false);
    };

    // ====== 영상 다운로드 ======
    const handleDownloadVideo = (videoUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = filename + '.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 진행 상태 계산
    const getSceneProgress = (sceneIdx: number) => {
        const scene = scenes[sceneIdx];
        if (!scene) return { done: 0, total: 0, generating: 0 };

        let done = 0, generating = 0;
        for (let i = 0; i < scene.cuts.length; i++) {
            const key = `${sceneIdx}-${i}`;
            if (videos[key]?.status === 'done') done++;
            if (videos[key]?.status === 'generating') generating++;
        }
        return { done, total: scene.cuts.length, generating };
    };

    const toggleCutExpand = (key: string) => {
        setExpandedCuts(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // ====== 대본이 없는 경우 ======
    if (!script || !isSceneAnalyzed || scenes.length === 0) {
        return (
            <div className="flex h-screen">
                <StoryContextPanel />
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md">
                        <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-700 mb-2">비디오 스튜디오</h2>
                        <p className="text-gray-500 text-sm">
                            먼저 <strong>비주얼 스튜디오</strong>에서 씬을 분석하고
                            컷 이미지를 생성해주세요. 이미지가 있어야 영상으로 변환할 수 있어요!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            <StoryContextPanel />

            <div className="flex-1 flex bg-gray-50 overflow-hidden">
                {/* ====== 왼쪽: 씬 목록 ====== */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Film className="w-5 h-5 text-indigo-500" />
                            비디오 스튜디오
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">컷 이미지를 영상으로 변환</p>
                    </div>

                    {/* 영상 길이 설정 */}
                    <div className="px-5 py-3 border-b border-gray-100">
                        <label className="text-xs font-medium text-gray-500 mb-2 block">
                            <Clock className="w-3.5 h-3.5 inline mr-1" />
                            영상 길이
                        </label>
                        <div className="flex gap-2">
                            {[4, 6, 8].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDuration(d)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${duration === d
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {d}초
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 씬 리스트 */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {scenes.map((scene, idx) => {
                            const isSelected = idx === selectedSceneIndex;
                            const progress = getSceneProgress(idx);
                            const hasImages = scene.cuts.some(c => c.imageUrl);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedSceneIndex(idx)}
                                    className={`w-full text-left p-3 rounded-xl transition-all ${isSelected
                                            ? 'bg-indigo-50 border-2 border-indigo-300 shadow-sm'
                                            : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <span className={`mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            S{scene.sceneNumber}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-gray-800 truncate">{scene.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-gray-400">
                                                    {scene.cuts.length}컷
                                                </span>
                                                {!hasImages && (
                                                    <span className="text-[10px] text-amber-500">⚠️ 이미지 없음</span>
                                                )}
                                                {progress.done > 0 && (
                                                    <span className="text-[10px] text-green-500 flex items-center gap-0.5">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {progress.done}/{progress.total}
                                                    </span>
                                                )}
                                                {progress.generating > 0 && (
                                                    <span className="text-[10px] text-indigo-500 flex items-center gap-0.5">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        생성중
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ====== 오른쪽: 컷 상세 ====== */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* 헤더 */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-800">
                                씬 {selectedScene?.sceneNumber}: {selectedScene?.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-0.5">{selectedScene?.cuts.length}개 컷 • {duration}초/영상</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* 씬 전체 변환 버튼 */}
                            <button
                                onClick={() => handleGenerateAllVideos(selectedSceneIndex)}
                                disabled={isGeneratingAll || !selectedScene?.cuts.some(c => c.imageUrl)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-95"
                            >
                                {isGeneratingAll ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        생성중...
                                    </>
                                ) : (
                                    <>
                                        <Clapperboard className="w-4 h-4" />
                                        씬 전체 영상 변환
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                        <div className="mx-6 mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* 컷 목록 */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {selectedScene?.cuts.map((cut, cutIdx) => {
                            const key = `${selectedSceneIndex}-${cutIdx}`;
                            const videoData = videos[key];
                            const isExpanded = expandedCuts.has(key);
                            const hasImage = !!cut.imageUrl;
                            const isGenerating = videoData?.status === 'generating';
                            const isDone = videoData?.status === 'done';
                            const hasError = videoData?.status === 'error';

                            return (
                                <div
                                    key={cutIdx}
                                    className={`bg-white rounded-xl border transition-all ${isDone ? 'border-green-200 shadow-sm' :
                                            isGenerating ? 'border-indigo-200 shadow-md' :
                                                hasError ? 'border-red-200' :
                                                    'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    {/* 컷 헤더 */}
                                    <div
                                        className="flex items-center gap-4 p-4 cursor-pointer"
                                        onClick={() => toggleCutExpand(key)}
                                    >
                                        {/* 컷 이미지 미니 썸네일 */}
                                        <div className="w-24 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {hasImage ? (
                                                <img src={cut.imageUrl} alt={cut.description} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Video className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* 컷 정보 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-indigo-500">컷 {cut.cutNumber || cutIdx + 1}</span>
                                                <span className="text-[10px] text-gray-400">{cut.duration}</span>
                                                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                                {isGenerating && <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
                                                {hasError && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{cut.description}</p>
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div className="flex items-center gap-2">
                                            {!isDone && !isGenerating && hasImage && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleGenerateVideo(selectedSceneIndex, cutIdx); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-600 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <Play className="w-3 h-3" />
                                                    영상 변환
                                                </button>
                                            )}
                                            {isDone && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadVideo(videoData.videoUrl, `scene${selectedScene.sceneNumber}_cut${cutIdx + 1}`);
                                                        }}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:scale-110 active:scale-90 transition-all"
                                                        title="다운로드"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleGenerateVideo(selectedSceneIndex, cutIdx); }}
                                                        className="p-1.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 hover:scale-110 active:scale-90 transition-all"
                                                        title="재생성"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            {isGenerating && (
                                                <span className="text-xs text-indigo-500 font-medium flex items-center gap-1">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    생성중...
                                                </span>
                                            )}

                                            <button className="text-gray-300">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* 확장 영역: 영상 미리보기 */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-gray-50">
                                            <div className="mt-3 flex gap-4">
                                                {/* 원본 이미지 */}
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-medium text-gray-400 mb-2">📷 원본 이미지</p>
                                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                        {hasImage ? (
                                                            <img src={cut.imageUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                                                이미지 없음
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* 생성된 영상 */}
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-medium text-gray-400 mb-2">🎬 생성된 영상</p>
                                                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                                                        {isDone ? (
                                                            <video
                                                                src={videoData.videoUrl}
                                                                controls
                                                                className="w-full h-full object-cover"
                                                                autoPlay={playingVideo === key}
                                                                onPlay={() => setPlayingVideo(key)}
                                                                onPause={() => setPlayingVideo(null)}
                                                            />
                                                        ) : isGenerating ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                                                <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                                                                <span className="text-xs text-gray-400">영상 생성중... (약 1~3분)</span>
                                                            </div>
                                                        ) : hasError ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-red-400">
                                                                <AlertCircle className="w-6 h-6 mb-1" />
                                                                <span className="text-xs">{videoData.error}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                                <span className="text-xs">영상 변환 버튼을 눌러주세요</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 프롬프트 */}
                                            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                                <p className="text-[10px] text-gray-400">프롬프트:</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{cut.imagePrompt || cut.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 하단 상태바 */}
                    {selectedScene && (
                        <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const p = getSceneProgress(selectedSceneIndex);
                                    return (
                                        <>
                                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                                                    style={{ width: `${p.total > 0 ? (p.done / p.total) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {p.done}/{p.total} 완료
                                            </span>
                                        </>
                                    );
                                })()}
                            </div>
                            <span className="text-[10px] text-gray-400">
                                Veo 2 • {duration}초/영상 • 16:9
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
