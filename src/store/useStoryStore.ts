import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ====== 비주얼 스튜디오 데이터 구조 ======
export interface Cut {
    cutNumber: number;           // 컷 번호 (1-1, 1-2 ...)
    description: string;         // 컷 설명 (한국어)
    duration: string;            // 예상 시간 (예: "3초")
    imagePrompt: string;         // AI 이미지 생성용 영어 프롬프트
    imagePromptKr?: string;      // 영어 프롬프트의 한국어 번역
    imageUrl?: string;           // 생성된 이미지 URL (선택)
}

export interface Scene {
    sceneNumber: number;         // 씬 번호
    title: string;               // 씬 제목 (한국어)
    description: string;         // 씬 설명 (한국어)
    timeRange: string;           // 시간 범위 (예: "00:00 ~ 01:30")
    location: string;            // 촬영 장소
    cuts: Cut[];                 // 해당 씬의 컷 목록
    isExpanded?: boolean;        // UI에서 확장 여부
    imagePrompt?: string;        // 씬 대표 이미지 프롬프트
    imageUrl?: string;           // 씬 대표 이미지 URL
}

interface StoryState {
    videoFormat: string;
    topic: string;
    targetAudience: string;
    tone: string;
    visualStyle: string;
    cameraAngle: string;
    lighting: string;
    characterSheet: string;
    synopsis: string;
    script: string;
    title: string;
    description: string;
    scenePrompts: string[];
    sceneImages: string[];
    sceneAudios: string[];

    // Script generation history
    scriptHistory: Array<{
        id: string;
        timestamp: string;
        title: string;
        script: string;
        characterSheet: string;
        episodeCount?: string;
        endingStyle?: string;
    }>;

    // ====== 비주얼 스튜디오 상태 ======
    scenes: Scene[];                  // 전체 씬 목록
    selectedSceneIndex: number;       // 현재 선택된 씬 인덱스
    isSceneAnalyzed: boolean;         // 씬 분석 완료 여부

    setVideoFormat: (format: string) => void;
    setTopic: (topic: string) => void;
    setTargetAudience: (target: string) => void;
    setTone: (tone: string) => void;
    setBasicSettings: (format: string, topic: string, targetAudience: string, tone: string, visualStyle: string, cameraAngle: string, lighting: string) => void;
    setSynopsis: (synopsis: string) => void;
    setCharacterSheet: (sheet: string) => void;
    setScript: (script: string) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setScenePrompts: (prompts: string[]) => void;
    setSceneImages: (images: string[]) => void;
    updateSceneImage: (index: number, imageUrl: string) => void;
    setSceneAudios: (audios: string[]) => void;
    updateSceneAudio: (index: number, audioUrl: string) => void;

    // History Actions
    addScriptToHistory: (entry: { title: string, script: string, characterSheet: string, episodeCount?: string, endingStyle?: string }) => void;
    deleteScriptFromHistory: (id: string) => void;

    // ====== 비주얼 스튜디오 액션 ======
    setScenes: (scenes: Scene[]) => void;
    setSelectedSceneIndex: (index: number) => void;
    setIsSceneAnalyzed: (analyzed: boolean) => void;
    updateSceneCuts: (sceneIndex: number, cuts: Cut[]) => void;
    updateCutPrompt: (sceneIndex: number, cutIndex: number, prompt: string) => void;
    updateCutImageUrl: (sceneIndex: number, cutIndex: number, url: string) => void;
    updateSceneImageUrl: (sceneIndex: number, url: string) => void;
    updateSceneImagePrompt: (sceneIndex: number, prompt: string) => void;
    resetVisualStudio: () => void;
}

export const useStoryStore = create<StoryState>()(
    persist(
        (set) => ({
            videoFormat: '',
            topic: '',
            targetAudience: '',
            tone: '',
            visualStyle: '',
            cameraAngle: '',
            lighting: '',
            synopsis: '',
            characterSheet: '',
            script: '',
            title: '',
            description: '',
            scenePrompts: [],
            sceneImages: [],
            sceneAudios: [],
            scriptHistory: [],

            // 비주얼 스튜디오 초기 상태
            scenes: [],
            selectedSceneIndex: 0,
            isSceneAnalyzed: false,

            setVideoFormat: (videoFormat) => set({ videoFormat }),
            setTopic: (topic) => set({ topic }),
            setTargetAudience: (targetAudience) => set({ targetAudience }),
            setTone: (tone) => set({ tone }),
            setBasicSettings: (videoFormat, topic, targetAudience, tone, visualStyle, cameraAngle, lighting) => set({ videoFormat, topic, targetAudience, tone, visualStyle, cameraAngle, lighting }),
            setSynopsis: (synopsis) => set({ synopsis }),
            setCharacterSheet: (characterSheet) => set({ characterSheet }),
            setScript: (script) => set({ script }),
            setTitle: (title) => set({ title }),
            setDescription: (description) => set({ description }),
            setScenePrompts: (scenePrompts) => set({ scenePrompts }),
            setSceneImages: (sceneImages) => set({ sceneImages }),
            updateSceneImage: (index, imageUrl) => set((state) => {
                const newImages = [...state.sceneImages];
                newImages[index] = imageUrl;
                return { sceneImages: newImages };
            }),
            setSceneAudios: (sceneAudios) => set({ sceneAudios }),
            updateSceneAudio: (index, audioUrl) => set((state) => {
                const newAudios = [...state.sceneAudios];
                newAudios[index] = audioUrl;
                return { sceneAudios: newAudios };
            }),

            // History Actions
            addScriptToHistory: (entry) => set((state) => ({
                scriptHistory: [
                    {
                        id: Date.now().toString(),
                        timestamp: new Date().toISOString(),
                        ...entry
                    },
                    ...state.scriptHistory
                ]
            })),
            deleteScriptFromHistory: (id) => set((state) => ({
                scriptHistory: state.scriptHistory.filter(h => h.id !== id)
            })),

            // ====== 비주얼 스튜디오 액션 ======
            setScenes: (scenes) => set({ scenes, isSceneAnalyzed: true }),
            setSelectedSceneIndex: (selectedSceneIndex) => set({ selectedSceneIndex }),
            setIsSceneAnalyzed: (isSceneAnalyzed) => set({ isSceneAnalyzed }),

            // 특정 씬의 컷 목록 업데이트 (컷 생성 후)
            updateSceneCuts: (sceneIndex, cuts) => set((state) => {
                const newScenes = [...state.scenes];
                if (newScenes[sceneIndex]) {
                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], cuts };
                }
                return { scenes: newScenes };
            }),

            // 특정 컷의 프롬프트 수정
            updateCutPrompt: (sceneIndex, cutIndex, prompt) => set((state) => {
                const newScenes = [...state.scenes];
                if (newScenes[sceneIndex] && newScenes[sceneIndex].cuts[cutIndex]) {
                    const newCuts = [...newScenes[sceneIndex].cuts];
                    newCuts[cutIndex] = { ...newCuts[cutIndex], imagePrompt: prompt };
                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], cuts: newCuts };
                }
                return { scenes: newScenes };
            }),

            // 특정 컷의 이미지 URL 업데이트
            updateCutImageUrl: (sceneIndex, cutIndex, url) => set((state) => {
                const newScenes = [...state.scenes];
                if (newScenes[sceneIndex] && newScenes[sceneIndex].cuts[cutIndex]) {
                    const newCuts = [...newScenes[sceneIndex].cuts];
                    newCuts[cutIndex] = { ...newCuts[cutIndex], imageUrl: url };
                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], cuts: newCuts };
                }
                return { scenes: newScenes };
            }),

            // 특정 씬의 대표 이미지 URL 업데이트
            updateSceneImageUrl: (sceneIndex, url) => set((state) => {
                const newScenes = [...state.scenes];
                if (newScenes[sceneIndex]) {
                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], imageUrl: url };
                }
                return { scenes: newScenes };
            }),

            // 특정 씬의 이미지 프롬프트 수정
            updateSceneImagePrompt: (sceneIndex, prompt) => set((state) => {
                const newScenes = [...state.scenes];
                if (newScenes[sceneIndex]) {
                    newScenes[sceneIndex] = { ...newScenes[sceneIndex], imagePrompt: prompt };
                }
                return { scenes: newScenes };
            }),

            // 비주얼 스튜디오 초기화
            resetVisualStudio: () => set({
                scenes: [],
                selectedSceneIndex: 0,
                isSceneAnalyzed: false,
            }),
        }),
        {
            name: 'story-storage',
            storage: {
                getItem: (name) => {
                    const str = localStorage.getItem(name);
                    if (!str) return null;
                    try {
                        const parsed = JSON.parse(str);
                        // 기존 저장된 base64 이미지를 자동 정리 (마이그레이션)
                        if (parsed?.state?.scenes) {
                            let cleaned = false;
                            parsed.state.scenes = parsed.state.scenes.map((scene: any) => {
                                const newScene = { ...scene };
                                if (newScene.imageUrl?.startsWith('data:')) {
                                    newScene.imageUrl = undefined;
                                    cleaned = true;
                                }
                                if (newScene.cuts) {
                                    newScene.cuts = newScene.cuts.map((c: any) => {
                                        if (c.imageUrl?.startsWith('data:')) {
                                            cleaned = true;
                                            return { ...c, imageUrl: undefined };
                                        }
                                        return c;
                                    });
                                }
                                return newScene;
                            });
                            if (parsed.state.sceneImages?.some((img: string) => img?.startsWith('data:'))) {
                                parsed.state.sceneImages = [];
                                cleaned = true;
                            }
                            if (cleaned) {
                                try { localStorage.setItem(name, JSON.stringify(parsed)); } catch { }
                            }
                        }
                        return parsed;
                    } catch {
                        return null;
                    }
                },
                setItem: (name, value) => {
                    try {
                        localStorage.setItem(name, typeof value === 'string' ? value : JSON.stringify(value));
                    } catch {
                        // quota 에러 시 자동 처리 — partialize에서 이미 이미지를 제거했으므로
                        // 여기까지 올 일은 거의 없음. 만일의 경우 경고만 출력
                        console.warn('[storage] localStorage 저장 실패 — 이미지 데이터가 너무 큼');
                    }
                },
                removeItem: (name) => localStorage.removeItem(name),
            },
            partialize: (state) => ({
                videoFormat: state.videoFormat,
                topic: state.topic,
                targetAudience: state.targetAudience,
                tone: state.tone,
                visualStyle: state.visualStyle,
                cameraAngle: state.cameraAngle,
                lighting: state.lighting,
                synopsis: state.synopsis,
                characterSheet: state.characterSheet,
                script: state.script,
                title: state.title,
                description: state.description,
                scenePrompts: state.scenePrompts,
                sceneImages: [] as string[],
                sceneAudios: state.sceneAudios,
                scriptHistory: state.scriptHistory,
                // 씬 데이터에서 이미지 URL 제외 (IndexedDB에서 관리)
                scenes: state.scenes.map(s => ({
                    ...s,
                    imageUrl: undefined,
                    cuts: s.cuts.map(c => ({ ...c, imageUrl: undefined })),
                })),
                selectedSceneIndex: state.selectedSceneIndex,
                isSceneAnalyzed: state.isSceneAnalyzed,
            } as any),
        }
    )
);
