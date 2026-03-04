"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useStoryStore, Scene, Cut } from '@/store/useStoryStore';
import { StoryContextPanel } from '@/components/StoryContextPanel';
import { saveImage, loadImage } from '@/lib/imageDB';
import { uploadImage, ensureBucketExists } from '@/lib/supabaseStorage';
import {
    Sparkles, Film, ChevronRight, Clapperboard, Layers, Loader2,
    Copy, Check, RefreshCw, ImageIcon, AlertCircle,
    ChevronDown, ChevronUp, Wand2, Download, Edit3, X, ZoomIn,
    Play, Video, Clock
} from 'lucide-react';

// 비주얼 스타일 한국어 매핑
const styleLabels: Record<string, string> = {
    cinematic: '🎬 실사 시네마틱',
    photorealistic: '📷 초현실 사진',
    ghibli: '🌿 지브리 애니메이션',
    pixar: '🧸 픽사 3D',
    webtoon: '📱 한국식 웹툰',
    watercolor: '🎨 수채화',
    cyberpunk: '🌃 사이버펑크',
    vintage: '📼 빈티지 레트로',
};

const cameraLabels: Record<string, string> = {
    dynamic: '🎥 다이내믹 앵글',
    wide: '🏞️ 울트라 와이드',
    closeup: '👁️ 클로즈업',
    drone: '🚁 드론 샷',
    handheld: '📱 핸드헬드',
    lowangle: '⬆️ 로우 앵글',
};

const lightLabels: Record<string, string> = {
    dramatic: '🔦 드라마틱',
    natural: '☀️ 자연광',
    neon: '💡 네온',
    moody: '🌑 무디/로우키',
    soft: '✨ 소프트',
    golden_hour: '🌅 골든 아워',
};

// API 한도 관리를 위한 딜레이 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function VisualStudioPage() {
    const {
        script, characterSheet, visualStyle, cameraAngle, lighting,
        scenes, selectedSceneIndex, isSceneAnalyzed,
        setScenes, setSelectedSceneIndex, setIsSceneAnalyzed,
        updateSceneCuts, updateCutPrompt, updateCutImageUrl,
        updateSceneImageUrl, updateSceneImagePrompt, resetVisualStudio,
    } = useStoryStore();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGeneratingCuts, setIsGeneratingCuts] = useState(false);
    const [isGeneratingAllCuts, setIsGeneratingAllCuts] = useState(false);
    const [allCutsProgress, setAllCutsProgress] = useState({ current: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [copiedCutId, setCopiedCutId] = useState<string | null>(null);
    const [expandedCuts, setExpandedCuts] = useState<Record<string, boolean>>({});

    // 이미지 생성 관련 상태
    const [isGeneratingSceneImages, setIsGeneratingSceneImages] = useState(false);
    const [sceneImageProgress, setSceneImageProgress] = useState({ current: 0, total: 0 });
    const [generatingSceneIdx, setGeneratingSceneIdx] = useState<number | null>(null);
    const [isGeneratingCutImages, setIsGeneratingCutImages] = useState(false);
    const [cutImageProgress, setCutImageProgress] = useState({ current: 0, total: 0 });
    const [generatingCutKey, setGeneratingCutKey] = useState<string | null>(null);

    // 프롬프트 편집 상태
    const [editingScenePrompt, setEditingScenePrompt] = useState<number | null>(null);
    const [tempScenePrompt, setTempScenePrompt] = useState('');

    // 이미지 라이트박스 상태
    const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

    // ====== 영상 생성 관련 상태 ======
    const [videoData, setVideoData] = useState<Record<string, { videoUrl: string; status: 'idle' | 'generating' | 'done' | 'error'; error?: string }>>({});
    const [videoDuration, setVideoDuration] = useState<number>(4);
    const [showPrompt, setShowPrompt] = useState<Record<string, boolean>>({});

    // 이미지 다운로드 함수
    const handleDownloadImage = (imageUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename + '.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ====== 영상 생성 함수 (개별 컷) ======
    const handleGenerateVideo = async (sceneIdx: number, cutIdx: number) => {
        const cut = scenes[sceneIdx]?.cuts[cutIdx];
        if (!cut?.imageUrl) {
            setError("이미지가 없는 컷은 영상으로 변환할 수 없어요.");
            return;
        }

        const key = `${sceneIdx}-${cutIdx}`;
        setVideoData(prev => ({ ...prev, [key]: { videoUrl: '', status: 'generating' } }));
        setError(null);

        try {
            const response = await fetch('/api/generate-video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: cut.imageUrl,
                    prompt: cut.imagePrompt || cut.description || 'Smooth cinematic camera movement',
                    duration: videoDuration,
                    aspectRatio: '16:9',
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setVideoData(prev => ({ ...prev, [key]: { videoUrl: data.videoUrl, status: 'done' } }));
        } catch (err: any) {
            setVideoData(prev => ({ ...prev, [key]: { videoUrl: '', status: 'error', error: err.message } }));
            if (err.message?.includes('429') || err.message?.includes('한도')) {
                setError("API 한도 초과. 잠시 후 다시 시도해주세요 ☕");
            }
        }
    };

    // ====== 씬 전체 영상 변환 ======
    const handleGenerateAllVideos = async (sceneIdx: number) => {
        const scene = scenes[sceneIdx];
        if (!scene || scene.cuts.length === 0) return;
        setError(null);

        for (let i = 0; i < scene.cuts.length; i++) {
            const key = `${sceneIdx}-${i}`;
            if (videoData[key]?.status === 'done') continue;
            if (!scene.cuts[i].imageUrl) continue;

            await handleGenerateVideo(sceneIdx, i);
            if (i < scene.cuts.length - 1) {
                await new Promise(r => setTimeout(r, 15000));
            }
        }
    };

    // 영상 다운로드
    const handleDownloadVideo = (videoUrl: string, filename: string) => {
        const link = document.createElement('a');
        link.href = videoUrl;
        link.download = filename + '.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ====== IndexedDB에서 이미지 복원 (페이지 진입 시) ======
    useEffect(() => {
        if (scenes.length === 0) return;

        const restoreImages = async () => {
            for (let i = 0; i < scenes.length; i++) {
                // 씬 이미지 복원
                if (!scenes[i].imageUrl) {
                    const sceneImg = await loadImage(`scene-${i}`);
                    if (sceneImg) updateSceneImageUrl(i, sceneImg);
                }
                // 컷 이미지 복원
                for (let j = 0; j < scenes[i].cuts.length; j++) {
                    if (!scenes[i].cuts[j].imageUrl) {
                        const cutImg = await loadImage(`cut-${i}-${j}`);
                        if (cutImg) updateCutImageUrl(i, j, cutImg);
                    }
                }
            }
        };

        restoreImages();
    }, [scenes.length]); // 씬 개수가 바뀔 때만 실행

    const selectedScene = scenes[selectedSceneIndex];

    // ====== 1단계: 대본을 씬으로 분석 ======
    const handleAnalyzeScript = async () => {
        if (!script) {
            setError('대본이 없습니다. 먼저 "대본 생성" 단계에서 대본을 작성해주세요.');
            return;
        }
        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-scenes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ script, characterSheet }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '씬 분석에 실패했습니다.');

            setScenes(data.scenes);
            setSelectedSceneIndex(0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ====== 전체 씬 이미지 일괄 생성 ======
    const handleGenerateAllSceneImages = async () => {
        setIsGeneratingSceneImages(true);
        setError(null);
        setSceneImageProgress({ current: 0, total: scenes.length });

        for (let i = 0; i < scenes.length; i++) {
            // 이미 이미지가 있는 씬은 건너뛰기
            if (scenes[i].imageUrl) {
                setSceneImageProgress(prev => ({ ...prev, current: i + 1 }));
                continue;
            }

            try {
                setGeneratingSceneIdx(i);
                await generateSceneImage(i);
                setSceneImageProgress(prev => ({ ...prev, current: i + 1 }));

                // API 한도 관리: 2초 간격
                if (i < scenes.length - 1) {
                    await delay(2000);
                }
            } catch (err: any) {
                if (err.message?.includes('한도') || err.message?.includes('429')) {
                    setError(`씬 ${i + 1}에서 API 한도 초과. 잠시 후 다시 시도해주세요.`);
                    break;
                }
                // 개별 씬 실패는 계속 진행
                console.error(`씬 ${i + 1} 이미지 생성 실패:`, err);
            }
        }

        setIsGeneratingSceneImages(false);
        setGeneratingSceneIdx(null);
    };

    // ====== 개별 씬 이미지 생성 ======
    const generateSceneImage = async (sceneIdx: number, customPrompt?: string) => {
        const scene = scenes[sceneIdx];
        if (!scene) return;

        const response = await fetch('/api/generate-scene-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sceneTitle: scene.title,
                sceneDescription: scene.description,
                visualStyle,
                cameraAngle,
                lighting,
                characterSheet,
                customPrompt: customPrompt || scene.imagePrompt,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '이미지 생성 실패');

        // Supabase Storage에 업로드 시도 → 성공하면 공개 URL 사용
        let finalUrl = data.imageUrl;
        try {
            const publicUrl = await uploadImage(`scene-${sceneIdx}`, data.imageUrl);
            if (publicUrl && !publicUrl.startsWith('data:')) finalUrl = publicUrl;
        } catch { /* Supabase 실패 시 base64 유지 */ }
        updateSceneImageUrl(sceneIdx, finalUrl);
        // IndexedDB에도 백업 저장
        await saveImage(`scene-${sceneIdx}`, finalUrl);
        if (data.imagePrompt) {
            updateSceneImagePrompt(sceneIdx, data.imagePrompt);
        }
    };

    // ====== 개별 씬 이미지 재생성 ======
    const handleRegenerateSceneImage = async (sceneIdx: number) => {
        setGeneratingSceneIdx(sceneIdx);
        setError(null);
        try {
            await generateSceneImage(sceneIdx);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGeneratingSceneIdx(null);
        }
    };

    // ====== 씬 프롬프트 수정 후 재생성 ======
    const handleEditScenePrompt = (sceneIdx: number) => {
        setEditingScenePrompt(sceneIdx);
        setTempScenePrompt(scenes[sceneIdx]?.imagePrompt || '');
    };

    const handleSaveScenePrompt = async (sceneIdx: number) => {
        updateSceneImagePrompt(sceneIdx, tempScenePrompt);
        setEditingScenePrompt(null);

        // 수정된 프롬프트로 재생성
        setGeneratingSceneIdx(sceneIdx);
        try {
            await generateSceneImage(sceneIdx, tempScenePrompt);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGeneratingSceneIdx(null);
        }
    };

    // ====== 2단계: 선택한 씬의 컷/프롬프트 생성 ======
    const handleGenerateCuts = async (sceneIdx: number) => {
        const scene = scenes[sceneIdx];
        if (!scene) return;

        setIsGeneratingCuts(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-cuts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sceneTitle: scene.title,
                    sceneDescription: scene.description,
                    scriptExcerpt: '',
                    characterSheet,
                    visualStyle,
                    cameraAngle,
                    lighting,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '컷 생성에 실패했습니다.');

            updateSceneCuts(sceneIdx, data.cuts);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGeneratingCuts(false);
        }
    };

    // ====== 전체 씬 컷 일괄 생성 ======
    const handleGenerateAllCuts = async () => {
        setIsGeneratingAllCuts(true);
        setError(null);
        const scenesWithoutCuts = scenes.filter(s => s.cuts.length === 0);
        setAllCutsProgress({ current: 0, total: scenesWithoutCuts.length });

        let completed = 0;
        for (let i = 0; i < scenes.length; i++) {
            // 이미 컷이 있는 씬은 건너뛰기
            if (scenes[i].cuts.length > 0) continue;

            try {
                setIsGeneratingCuts(true);
                const response = await fetch('/api/generate-cuts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sceneTitle: scenes[i].title,
                        sceneDescription: scenes[i].description,
                        scriptExcerpt: '',
                        characterSheet,
                        visualStyle,
                        cameraAngle,
                        lighting,
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `씬 ${i + 1} 컷 생성 실패`);

                updateSceneCuts(i, data.cuts);
                completed++;
                setAllCutsProgress(prev => ({ ...prev, current: completed }));

                // API 한도 관리: 3초 간격
                if (completed < scenesWithoutCuts.length) {
                    await delay(3000);
                }
            } catch (err: any) {
                if (err.message?.includes('한도') || err.message?.includes('429')) {
                    setError(`씬 ${i + 1}에서 API 한도 초과. 잠시 후 다시 시도해주세요.`);
                    break;
                }
                console.error(`씬 ${i + 1} 컷 생성 실패:`, err);
                completed++;
                setAllCutsProgress(prev => ({ ...prev, current: completed }));
            }
        }

        setIsGeneratingCuts(false);
        setIsGeneratingAllCuts(false);
    };

    // ====== 씬별 컷 이미지 생성 ======
    const handleGenerateCutImages = async (sceneIdx: number) => {
        const scene = scenes[sceneIdx];
        if (!scene || scene.cuts.length === 0) return;

        setIsGeneratingCutImages(true);
        setError(null);
        setCutImageProgress({ current: 0, total: scene.cuts.length });

        for (let i = 0; i < scene.cuts.length; i++) {
            const cut = scene.cuts[i];

            // 이미 이미지가 있는 컷은 건너뛰기
            if (cut.imageUrl) {
                setCutImageProgress(prev => ({ ...prev, current: i + 1 }));
                continue;
            }

            try {
                setGeneratingCutKey(`${sceneIdx}-${i}`);

                const response = await fetch('/api/generate-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: cut.imagePrompt, visualStyle, cameraAngle, lighting }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                // Supabase Storage에 업로드
                let finalUrl = data.imageUrl;
                try {
                    const publicUrl = await uploadImage(`cut-${sceneIdx}-${i}`, data.imageUrl);
                    if (publicUrl && !publicUrl.startsWith('data:')) finalUrl = publicUrl;
                } catch { /* fallback */ }
                updateCutImageUrl(sceneIdx, i, finalUrl);
                await saveImage(`cut-${sceneIdx}-${i}`, finalUrl);
                setCutImageProgress(prev => ({ ...prev, current: i + 1 }));

                // API 한도 관리: 3초 간격 (이미지 생성은 더 무거움)
                if (i < scene.cuts.length - 1) {
                    await delay(3000);
                }
            } catch (err: any) {
                if (err.message?.includes('한도') || err.message?.includes('429')) {
                    setError(`컷 ${i + 1}에서 API 한도 초과. 잠시 후 다시 시도해주세요.`);
                    break;
                }
                console.error(`컷 ${i + 1} 이미지 생성 실패:`, err);
            }
        }

        setIsGeneratingCutImages(false);
        setGeneratingCutKey(null);
    };

    // ====== 개별 컷 이미지 재생성 ======
    const handleRegenerateCutImage = async (sceneIdx: number, cutIdx: number) => {
        const cut = scenes[sceneIdx]?.cuts[cutIdx];
        if (!cut) return;

        setGeneratingCutKey(`${sceneIdx}-${cutIdx}`);
        setError(null);

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: cut.imagePrompt, visualStyle, cameraAngle, lighting }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Supabase Storage에 업로드
            let finalUrl = data.imageUrl;
            try {
                const publicUrl = await uploadImage(`cut-${sceneIdx}-${cutIdx}`, data.imageUrl);
                if (publicUrl && !publicUrl.startsWith('data:')) finalUrl = publicUrl;
            } catch { /* fallback */ }
            updateCutImageUrl(sceneIdx, cutIdx, finalUrl);
            await saveImage(`cut-${sceneIdx}-${cutIdx}`, finalUrl);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGeneratingCutKey(null);
        }
    };

    // 프롬프트 복사
    const handleCopyPrompt = (cutId: string, prompt: string) => {
        navigator.clipboard.writeText(prompt);
        setCopiedCutId(cutId);
        setTimeout(() => setCopiedCutId(null), 2000);
    };

    // 컷 프롬프트 토글
    const toggleCutExpand = (cutId: string) => {
        setExpandedCuts(prev => ({ ...prev, [cutId]: !prev[cutId] }));
    };

    // ====== 대본 없을 때 안내 화면 ======
    if (!script) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 p-8">
                <StoryContextPanel />
                <div className="text-center max-w-lg">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Clapperboard className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-3">비주얼 스튜디오</h2>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        대본을 씬(Scene)과 컷(Cut)으로 세분화하고,<br />
                        각 컷마다 AI 이미지를 생성하는 공간입니다.<br />
                        먼저 <strong className="text-indigo-600">"대본 생성"</strong> 단계에서 대본을 완성해주세요.
                    </p>
                    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 inline-flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        대본이 완성되어야 씬 분석을 시작할 수 있습니다.
                    </div>
                </div>
            </div>
        );
    }

    // ====== 씬 분석 전 화면 ======
    if (!isSceneAnalyzed || scenes.length === 0) {
        return (
            <div className="flex h-full w-full flex-col bg-gray-50 overflow-y-auto">
                <StoryContextPanel />
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center max-w-xl">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <Layers className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">대본 씬(Scene) 분석</h2>
                        <p className="text-gray-500 mb-4 leading-relaxed">
                            완성된 대본을 AI가 분석하여 <strong>장소/시간/분위기</strong>가 바뀌는<br />
                            큼직한 씬(장면) 단위로 자동 구조화합니다.
                        </p>

                        {/* 현재 설정된 비주얼 스타일 표시 */}
                        <div className="mb-6 inline-flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
                                {styleLabels[visualStyle] || visualStyle}
                            </span>
                            <span className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-full text-xs font-semibold border border-sky-100">
                                {cameraLabels[cameraAngle] || cameraAngle}
                            </span>
                            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-100">
                                {lightLabels[lighting] || lighting}
                            </span>
                        </div>

                        {error && (
                            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 inline-flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                onClick={handleAnalyzeScript}
                                disabled={isAnalyzing}
                                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto text-base"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        AI가 대본을 분석하고 있습니다...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        대본 씬(Scene) 분석 시작하기
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 mt-4">
                            대본 길이에 따라 5~25개의 씬으로 자동 분할됩니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 씬 이미지 생성 완료 수 계산
    const sceneImagesGenerated = scenes.filter(s => s.imageUrl).length;
    const allSceneImagesGenerated = sceneImagesGenerated === scenes.length;

    // ====== 메인 비주얼 스튜디오 화면 ======
    return (
        <>
            <div className="flex h-full w-full flex-col bg-gray-50 overflow-hidden">
                <StoryContextPanel />

                {/* 상단 헤더 바 */}
                <div className="w-full bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <Clapperboard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white font-bold text-lg">비주얼 스튜디오</h2>
                            <p className="text-slate-400 text-xs">
                                총 {scenes.length}개 씬 · {scenes.reduce((acc, s) => acc + s.cuts.length, 0)}개 컷 ·
                                씬 이미지 {sceneImagesGenerated}/{scenes.length}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-medium">
                            {styleLabels[visualStyle] || visualStyle}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-medium">
                            {cameraLabels[cameraAngle] || cameraAngle}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-medium">
                            {lightLabels[lighting] || lighting}
                        </span>
                        <button
                            onClick={() => {
                                if (window.confirm('씬 분석 데이터를 모두 초기화하시겠습니까?')) {
                                    resetVisualStudio();
                                }
                            }}
                            className="ml-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-xs font-medium transition-colors"
                        >
                            초기화
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mx-6 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-xs font-bold">닫기</button>
                    </div>
                )}

                {/* ====== 메인 컨텐츠 영역 ====== */}
                <div className="flex-1 overflow-y-auto">

                    {/* ===== 1단계: 씬 이미지 생성 영역 ===== */}
                    <div className="px-6 pt-5 pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Film className="w-5 h-5 text-violet-500" />
                                <h3 className="text-base font-bold text-gray-900">1단계: 씬 대표 이미지</h3>
                                <span className="text-xs text-gray-400">({sceneImagesGenerated}/{scenes.length} 완료)</span>
                            </div>
                            <button
                                onClick={handleGenerateAllSceneImages}
                                disabled={isGeneratingSceneImages || allSceneImagesGenerated}
                                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGeneratingSceneImages ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {sceneImageProgress.current}/{sceneImageProgress.total} 생성 중...
                                    </>
                                ) : allSceneImagesGenerated ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        전체 완료
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        전체 씬 이미지 생성
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 진행률 바 */}
                        {isGeneratingSceneImages && (
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(sceneImageProgress.current / sceneImageProgress.total) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-center">
                                    {sceneImageProgress.current}/{sceneImageProgress.total} 씬 이미지 생성 완료 · API 한도 관리를 위해 2초 간격으로 생성합니다
                                </p>
                            </div>
                        )}

                        {/* 씬 이미지 카드 그리드 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {scenes.map((scene, idx) => {
                                const isGenerating = generatingSceneIdx === idx;
                                const isEditing = editingScenePrompt === idx;
                                const isSelected = selectedSceneIndex === idx;

                                return (
                                    <div
                                        key={idx}
                                        className={`bg-white rounded-xl border-2 overflow-hidden transition-all cursor-pointer group ${isSelected
                                            ? 'border-indigo-500 shadow-lg shadow-indigo-100'
                                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                            }`}
                                        onClick={() => setSelectedSceneIndex(idx)}
                                    >
                                        {/* 이미지 영역 */}
                                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                            {scene.imageUrl ? (
                                                <img
                                                    src={scene.imageUrl}
                                                    alt={scene.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : isGenerating ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
                                                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                                                    <span className="text-[10px] text-indigo-400">생성 중...</span>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    <ImageIcon className="w-8 h-8 text-gray-300 mb-1" />
                                                    <span className="text-[10px] text-gray-400">이미지 대기</span>
                                                </div>
                                            )}

                                            {/* 씬 번호 뱃지 */}
                                            <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded ${isSelected ? 'bg-indigo-500 text-white' : 'bg-black/60 text-white'
                                                }`}>
                                                S{scene.sceneNumber}
                                            </span>

                                            {/* 이미지가 있을 때 액션 버튼 (호버 시 표시) */}
                                            {scene.imageUrl && !isGenerating && (
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setLightboxImage({ url: scene.imageUrl!, title: `씬 ${scene.sceneNumber}: ${scene.title}` }); }}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                        title="크게 보기"
                                                    >
                                                        <ZoomIn className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadImage(scene.imageUrl!, `scene_${scene.sceneNumber}`);
                                                            const btn = e.currentTarget;
                                                            btn.classList.add('!bg-green-400');
                                                            setTimeout(() => btn.classList.remove('!bg-green-400'), 800);
                                                        }}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                        title="다운로드"
                                                    >
                                                        <Download className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRegenerateSceneImage(idx);
                                                            const icon = e.currentTarget.querySelector('svg');
                                                            if (icon) icon.classList.add('animate-spin');
                                                        }}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                        title="재생성"
                                                    >
                                                        <RefreshCw className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEditScenePrompt(idx); }}
                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                        title="프롬프트 수정"
                                                    >
                                                        <Edit3 className="w-4 h-4 text-gray-700" />
                                                    </button>
                                                    {scene.imagePrompt && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(scene.imagePrompt!);
                                                                const btn = e.currentTarget;
                                                                btn.classList.add('!bg-green-400');
                                                                setTimeout(() => btn.classList.remove('!bg-green-400'), 800);
                                                            }}
                                                            className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                            title="프롬프트 복사"
                                                        >
                                                            <Copy className="w-4 h-4 text-gray-700" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* 씬 정보 */}
                                        <div className="p-3">
                                            <h4 className="text-xs font-bold text-gray-800 truncate">{scene.title}</h4>
                                            <p className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{scene.description}</p>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">📍 {scene.location}</span>
                                                {scene.cuts.length > 0 && (
                                                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                                                        {scene.cuts.length}컷
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 프롬프트 편집 모달 */}
                        {editingScenePrompt !== null && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            씬 {scenes[editingScenePrompt]?.sceneNumber} 이미지 프롬프트 수정
                                        </h3>
                                        <button onClick={() => setEditingScenePrompt(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                            <X className="w-5 h-5 text-gray-400" />
                                        </button>
                                    </div>
                                    <textarea
                                        value={tempScenePrompt}
                                        onChange={(e) => setTempScenePrompt(e.target.value)}
                                        className="w-full min-h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        placeholder="영어로 이미지 프롬프트를 입력하세요..."
                                    />
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setEditingScenePrompt(null)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={() => handleSaveScenePrompt(editingScenePrompt)}
                                            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-sm font-bold rounded-lg flex items-center gap-1.5"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            저장 후 재생성
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 구분선 */}
                    <div className="mx-6 border-t border-gray-200" />

                    {/* ===== 전체 컷 일괄 생성 버튼 영역 ===== */}
                    <div className="px-6 pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-5 h-5 text-orange-500" />
                                <h3 className="text-base font-bold text-gray-900">2단계: 씬별 컷(Cut) & 프롬프트</h3>
                                <span className="text-xs text-gray-400">
                                    ({scenes.filter(s => s.cuts.length > 0).length}/{scenes.length} 씬 완료)
                                </span>
                            </div>
                            <button
                                onClick={handleGenerateAllCuts}
                                disabled={isGeneratingAllCuts || isGeneratingCuts || scenes.every(s => s.cuts.length > 0)}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isGeneratingAllCuts ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {allCutsProgress.current}/{allCutsProgress.total} 씬 처리 중...
                                    </>
                                ) : scenes.every(s => s.cuts.length > 0) ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        전체 완료
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        전체 씬 컷 일괄 생성
                                    </>
                                )}
                            </button>
                        </div>

                        {/* 일괄 생성 진행률 바 */}
                        {isGeneratingAllCuts && (
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${allCutsProgress.total > 0 ? (allCutsProgress.current / allCutsProgress.total) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-center">
                                    {allCutsProgress.current}/{allCutsProgress.total} 씬 컷 생성 완료 · API 한도 관리를 위해 3초 간격으로 처리합니다
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ===== 선택된 씬 컷 상세 영역 ===== */}
                    <div className="px-6 pt-2 pb-8">
                        {selectedScene ? (
                            <div>
                                {/* 씬 헤더 */}
                                <div className="mb-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2.5 py-1 bg-indigo-500 text-white text-sm font-bold rounded-lg">
                                            Scene {selectedScene.sceneNumber}
                                        </span>
                                        <h3 className="text-xl font-extrabold text-gray-900">{selectedScene.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-2">{selectedScene.description}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span>📍 {selectedScene.location}</span>
                                        <span>📐 {selectedScene.timeRange}</span>
                                    </div>
                                </div>

                                {/* 컷 생성 영역 */}
                                {selectedScene.cuts.length === 0 ? (
                                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
                                            <Wand2 className="w-8 h-8 text-white" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-2">이 씬의 컷(Cut)을 생성하세요</h4>
                                        <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                                            AI가 이 씬을 세부 컷으로 나누고,<br />
                                            각 컷에 맞는 이미지 프롬프트를 자동으로 생성합니다.
                                        </p>
                                        <button
                                            onClick={() => handleGenerateCuts(selectedSceneIndex)}
                                            disabled={isGeneratingCuts}
                                            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                                        >
                                            {isGeneratingCuts ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    컷 & 프롬프트 생성 중...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    이 씬의 컷(Cut) & 프롬프트 생성하기
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* 컷 목록 헤더 + 이미지 생성 버튼 */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clapperboard className="w-4 h-4 text-orange-500" />
                                                <h4 className="text-sm font-bold text-gray-700">
                                                    2단계: 컷 이미지 ({selectedScene.cuts.filter(c => c.imageUrl).length}/{selectedScene.cuts.length} 완료)
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleGenerateCuts(selectedSceneIndex)}
                                                    disabled={isGeneratingCuts}
                                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    <RefreshCw className={`w-3 h-3 ${isGeneratingCuts ? 'animate-spin' : ''}`} />
                                                    컷 재분석
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateCutImages(selectedSceneIndex)}
                                                    disabled={isGeneratingCutImages || selectedScene.cuts.every(c => c.imageUrl)}
                                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                >
                                                    {isGeneratingCutImages ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            {cutImageProgress.current}/{cutImageProgress.total} 생성 중...
                                                        </>
                                                    ) : selectedScene.cuts.every(c => c.imageUrl) ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5" />
                                                            전체 완료
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="w-3.5 h-3.5" />
                                                            씬 {selectedScene.sceneNumber} 컷 이미지 생성
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateAllVideos(selectedSceneIndex)}
                                                    disabled={isGeneratingCutImages || !selectedScene.cuts.some(c => c.imageUrl) || Object.entries(videoData).some(([k, v]) => k.startsWith(`${selectedSceneIndex}-`) && v.status === 'generating')}
                                                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-xs font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                >
                                                    {Object.entries(videoData).some(([k, v]) => k.startsWith(`${selectedSceneIndex}-`) && v.status === 'generating') ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            영상 생성 중...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Video className="w-3.5 h-3.5" />
                                                            씬 전체 영상 변환
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* 컷 이미지 진행률 바 */}
                                        {isGeneratingCutImages && (
                                            <div className="mb-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${(cutImageProgress.current / cutImageProgress.total) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 text-center">
                                                    {cutImageProgress.current}/{cutImageProgress.total} 컷 이미지 생성 완료
                                                </p>
                                            </div>
                                        )}

                                        {/* 컷 카드 리스트 */}
                                        {selectedScene.cuts.map((cut, cutIdx) => {
                                            const cutId = `${selectedSceneIndex}-${cutIdx}`;
                                            const isExpanded = expandedCuts[cutId] !== false;
                                            const isCopied = copiedCutId === cutId;
                                            const isCutGenerating = generatingCutKey === cutId;

                                            return (
                                                <div
                                                    key={cutIdx}
                                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    {/* 컷 헤더 */}
                                                    <div
                                                        className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                                        onClick={() => toggleCutExpand(cutId)}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded flex-shrink-0">
                                                                Cut {selectedScene.sceneNumber}-{cut.cutNumber}
                                                            </span>
                                                            <span className="text-sm font-medium text-gray-800 truncate">{cut.description}</span>
                                                            {cut.imageUrl && (
                                                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                                                                    ✅ 이미지
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                                ⏱️ {cut.duration}
                                                            </span>
                                                            {isExpanded ? (
                                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                                            ) : (
                                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* 컷 상세 (이미지 | 영상) + 프롬프트 토글 */}
                                                    {isExpanded && (
                                                        <div className="px-5 pb-4 border-t border-gray-100">
                                                            {/* 이미지 & 영상 나란히 (크게) */}
                                                            <div className="mt-3 flex gap-4">
                                                                {/* ===== 왼쪽: 컷 이미지 (크게) ===== */}
                                                                <div className="flex-1">
                                                                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                                                                        <ImageIcon className="w-3 h-3" />
                                                                        컷 이미지
                                                                    </label>
                                                                    <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative group">
                                                                        {cut.imageUrl ? (
                                                                            <>
                                                                                <img
                                                                                    src={cut.imageUrl}
                                                                                    alt={cut.description}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); setLightboxImage({ url: cut.imageUrl!, title: `씬 ${selectedScene.sceneNumber} - 컷 ${cutIdx + 1}` }); }}
                                                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                                                        title="크게 보기"
                                                                                    >
                                                                                        <ZoomIn className="w-4 h-4 text-gray-700" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleDownloadImage(cut.imageUrl!, `scene${selectedScene.sceneNumber}_cut${cutIdx + 1}`);
                                                                                            const btn = e.currentTarget;
                                                                                            btn.classList.add('!bg-green-400');
                                                                                            setTimeout(() => btn.classList.remove('!bg-green-400'), 800);
                                                                                        }}
                                                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                                                        title="다운로드"
                                                                                    >
                                                                                        <Download className="w-4 h-4 text-gray-700" />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleRegenerateCutImage(selectedSceneIndex, cutIdx);
                                                                                            const icon = e.currentTarget.querySelector('svg');
                                                                                            if (icon) icon.classList.add('animate-spin');
                                                                                        }}
                                                                                        className="p-2 bg-white/90 rounded-lg hover:bg-white hover:scale-110 active:scale-90 transition-all duration-150"
                                                                                        title="재생성"
                                                                                    >
                                                                                        <RefreshCw className="w-4 h-4 text-gray-700" />
                                                                                    </button>
                                                                                </div>
                                                                            </>
                                                                        ) : isCutGenerating ? (
                                                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                                                                                <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
                                                                                <span className="text-xs text-orange-400">이미지 생성 중...</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                                                <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                                                                <span className="text-xs text-gray-400">이미지 대기</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    {/* 이미지 하단 버튼 */}
                                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                                        <button
                                                                            onClick={() => handleCopyPrompt(`en-${cutId}`, cut.imagePrompt)}
                                                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${copiedCutId === `en-${cutId}`
                                                                                ? 'bg-emerald-500 text-white'
                                                                                : 'bg-slate-800 hover:bg-slate-900 text-white'
                                                                                }`}
                                                                        >
                                                                            {copiedCutId === `en-${cutId}` ? (
                                                                                <><Check className="w-3 h-3" /> 복사됨!</>
                                                                            ) : (
                                                                                <><Copy className="w-3 h-3" /> 영문 프롬프트 복사</>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCopyPrompt(`kr-${cutId}`, cut.imagePromptKr || cut.description)}
                                                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${copiedCutId === `kr-${cutId}`
                                                                                ? 'bg-emerald-500 text-white'
                                                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                                }`}
                                                                        >
                                                                            {copiedCutId === `kr-${cutId}` ? (
                                                                                <><Check className="w-3 h-3" /> 복사됨!</>
                                                                            ) : (
                                                                                <><Copy className="w-3 h-3" /> 한글 프롬프트 복사</>
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setShowPrompt(prev => ({ ...prev, [cutId]: !prev[cutId] }))}
                                                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${showPrompt[cutId]
                                                                                ? 'bg-indigo-100 text-indigo-600'
                                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                                }`}
                                                                        >
                                                                            <Edit3 className="w-3 h-3" />
                                                                            프롬프트 {showPrompt[cutId] ? '닫기' : '확인'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleRegenerateCutImage(selectedSceneIndex, cutIdx)}
                                                                            disabled={isCutGenerating}
                                                                            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                                                                        >
                                                                            <RefreshCw className={`w-3 h-3 ${isCutGenerating ? 'animate-spin' : ''}`} />
                                                                            재생성
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {/* ===== 구분선 ===== */}
                                                                <div className="w-px bg-gray-200 self-stretch" />

                                                                {/* ===== 오른쪽: 영상 (크게) ===== */}
                                                                {(() => {
                                                                    const videoKey = `${selectedSceneIndex}-${cutIdx}`;
                                                                    const vd = videoData[videoKey];
                                                                    const isVideoGenerating = vd?.status === 'generating';
                                                                    const isVideoDone = vd?.status === 'done';
                                                                    const hasVideoError = vd?.status === 'error';

                                                                    return (
                                                                        <div className="flex-1">
                                                                            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                                                                                <Video className="w-3 h-3" />
                                                                                영상 변환
                                                                            </label>

                                                                            {/* 영상 미리보기 (크게) */}
                                                                            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
                                                                                {isVideoDone ? (
                                                                                    <video
                                                                                        src={vd.videoUrl}
                                                                                        controls
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                ) : isVideoGenerating ? (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                                                                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                                                                                        <span className="text-xs text-gray-400">영상 생성중 (1~3분)</span>
                                                                                    </div>
                                                                                ) : hasVideoError ? (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-red-400 px-4">
                                                                                        <AlertCircle className="w-6 h-6 mb-2" />
                                                                                        <span className="text-xs text-center">{vd?.error}</span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                                                                        <Film className="w-8 h-8 text-gray-600 mb-2" />
                                                                                        <span className="text-xs">영상 미생성</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            {/* 영상 하단 버튼 */}
                                                                            <div className="flex items-center gap-2 mt-2">
                                                                                {/* 길이 선택 */}
                                                                                <div className="flex gap-1">
                                                                                    {[4, 6, 8].map(d => (
                                                                                        <button
                                                                                            key={d}
                                                                                            onClick={() => setVideoDuration(d)}
                                                                                            className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${videoDuration === d
                                                                                                ? 'bg-indigo-500 text-white'
                                                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                                                }`}
                                                                                        >
                                                                                            {d}초
                                                                                        </button>
                                                                                    ))}
                                                                                </div>

                                                                                {/* 영상 변환 버튼 */}
                                                                                {!isVideoGenerating && (
                                                                                    <button
                                                                                        onClick={() => handleGenerateVideo(selectedSceneIndex, cutIdx)}
                                                                                        disabled={!cut.imageUrl || isVideoGenerating}
                                                                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-[11px] font-semibold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all active:scale-95"
                                                                                    >
                                                                                        <Play className="w-3 h-3" />
                                                                                        {isVideoDone ? '재변환' : '영상 변환'}
                                                                                    </button>
                                                                                )}

                                                                                {/* 영문 프롬프트 복사 */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(cut.imagePrompt || '');
                                                                                        setCopiedCutId(`video-en-${cutIdx}`);
                                                                                        setTimeout(() => setCopiedCutId(null), 2000);
                                                                                    }}
                                                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 ${copiedCutId === `video-en-${cutIdx}` ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                                                >
                                                                                    {copiedCutId === `video-en-${cutIdx}` ? <><Check className="w-3 h-3" /> 복사됨!</> : <><Copy className="w-3 h-3" /> 영문</>}
                                                                                </button>
                                                                                {/* 한글 프롬프트 복사 */}
                                                                                <button
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(cut.imagePromptKr || cut.description || '');
                                                                                        setCopiedCutId(`video-kr-${cutIdx}`);
                                                                                        setTimeout(() => setCopiedCutId(null), 2000);
                                                                                    }}
                                                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 ${copiedCutId === `video-kr-${cutIdx}` ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                                                                                >
                                                                                    {copiedCutId === `video-kr-${cutIdx}` ? <><Check className="w-3 h-3" /> 복사됨!</> : <><Copy className="w-3 h-3" /> 한글</>}
                                                                                </button>
                                                                            </div>

                                                                            {/* 영상 다운로드 */}
                                                                            {isVideoDone && (
                                                                                <button
                                                                                    onClick={() => handleDownloadVideo(vd.videoUrl, `scene${selectedScene.sceneNumber}_cut${cutIdx + 1}`)}
                                                                                    className="w-full mt-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[11px] font-semibold hover:bg-green-100 transition-all active:scale-95"
                                                                                >
                                                                                    <Download className="w-3 h-3" />
                                                                                    영상 다운로드
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>

                                                            {/* 프롬프트 (토글로 표시/숨김) */}
                                                            {showPrompt[cutId] && (
                                                                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                                                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1 mb-1.5">
                                                                        <Edit3 className="w-3 h-3" />
                                                                        AI 이미지 프롬프트 (편집 가능)
                                                                    </label>
                                                                    <textarea
                                                                        value={cut.imagePrompt}
                                                                        onChange={(e) => updateCutPrompt(selectedSceneIndex, cutIdx, e.target.value)}
                                                                        className="w-full min-h-[80px] p-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-40 text-gray-400">
                                위에서 씬을 선택해주세요
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 이미지 라이트박스 모달 */}
            {lightboxImage && (
                <div
                    className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-8"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute -top-12 left-0 right-0 flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">{lightboxImage.title}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownloadImage(lightboxImage.url, lightboxImage.title.replace(/[^a-zA-Z0-9\uac00-\ud7a3]/g, '_'))}
                                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    다운로드
                                </button>
                                <button
                                    onClick={() => setLightboxImage(null)}
                                    className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <img
                            src={lightboxImage.url}
                            alt={lightboxImage.title}
                            className="w-full h-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
