import { create } from 'zustand';

interface StoryState {
    topic: string;
    targetAudience: string;
    tone: string;
    setTopic: (topic: string) => void;
    setTargetAudience: (target: string) => void;
    setTone: (tone: string) => void;
    setBasicSettings: (topic: string, targetAudience: string, tone: string) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
    topic: '',
    targetAudience: '',
    tone: '',
    setTopic: (topic) => set({ topic }),
    setTargetAudience: (targetAudience) => set({ targetAudience }),
    setTone: (tone) => set({ tone }),
    setBasicSettings: (topic, targetAudience, tone) => set({ topic, targetAudience, tone }),
}));
