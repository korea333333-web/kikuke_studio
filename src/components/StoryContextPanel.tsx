"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStoryStore } from '@/store/useStoryStore';
import { Button } from "@/components/ui/button";
import { Edit3, Info } from "lucide-react";

export function StoryContextPanel() {
    const router = useRouter();
    const { videoFormat, topic, targetAudience, tone } = useStoryStore();

    // 설정이 비어있으면 렌더링하지 않음 (1단계 진입 전)
    if (!topic && !targetAudience && !tone) {
        return null;
    }

    const handleClickEdit = () => {
        router.push('/');
    };

    return (
        <div className="w-full bg-indigo-50 border-b border-indigo-100 flex items-center justify-between px-6 py-3 shadow-sm z-10 sticky top-0">
            <div className="flex items-center gap-2 overflow-hidden flex-1 mr-4">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm font-bold text-slate-700 whitespace-nowrap shrink-0">현재 설정 정보:</span>
                <span className="text-sm font-medium text-slate-600 truncate">
                    형식({videoFormat === 'narration' ? '🎙️ 정보/내레이션' : '📝 이야기'}) / 주제({topic}) / 타겟({targetAudience}) / 톤앤매너({tone})
                </span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleClickEdit}
                className="h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold shrink-0"
            >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> 설정 수정하기
            </Button>
        </div>
    );
}
