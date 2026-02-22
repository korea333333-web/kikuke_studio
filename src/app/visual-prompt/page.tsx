"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Copy, Filter, Tag, LayoutGrid, Heart } from "lucide-react";
import Image from "next/image";

// 더미 데이터: 비주얼 프롬프트 갤러리 아이템
const promptItems = [
    {
        id: 1,
        title: "사이버펑크 네온 시티",
        category: "배경 (Background)",
        tags: ["#SF", "#사이버펑크", "#네온", "#밤거리"],
        prompt: "A breathtaking cyberpunk city at night, rain slicked streets reflecting neon signs, flying cars, towering skyscrapers, cinematic lighting, 8k resolution, highly detailed, unreal engine 5 render, volumetric fog",
        bgColor: "bg-fuchsia-900" // 이미지 대신 사용할 배경색
    },
    {
        id: 2,
        title: "판타지 엘프 궁수",
        category: "캐릭터 (Character)",
        tags: ["#판타지", "#엘프", "#여전사", "#마법숲"],
        prompt: "A beautiful female high elf archer aiming her glowing bow in an enchanted glowing forest, wearing ornate silver and green armor, dramatic lighting, magical atmosphere, intricate details, masterpiece",
        bgColor: "bg-emerald-900"
    },
    {
        id: 3,
        title: "스팀펑크 비행선",
        category: "오브젝트 (Object)",
        tags: ["#스팀펑크", "#비행선", "#기계", "#구름"],
        prompt: "A massive steampunk airship flying through dramatic sunset clouds, brass and copper gears, multiple propellers, smoke trailing, epic scale, concept art, trending on artstation",
        bgColor: "bg-amber-900"
    },
    {
        id: 4,
        title: "한국형 수묵화 스타일",
        category: "아트 스타일 (Style)",
        tags: ["#동양화", "#수묵화", "#산수화", "#여백의미"],
        prompt: "Traditional Korean ink wash painting of a lone pine tree on a misty mountain peak, minimal strokes, elegant composition, monochrome with subtle hints of red, zen atmosphere",
        bgColor: "bg-stone-800"
    },
    {
        id: 5,
        title: "디스토피아 폐허",
        category: "배경 (Background)",
        tags: ["#포스트아포칼립스", "#폐허", "#우울함", "#생존"],
        prompt: "Post-apocalyptic ruined city overgrown with thick green vegetation, collapsed concrete buildings, rusted cars, overcast sky, cinematic moody lighting, photorealistic, depth of field",
        bgColor: "bg-slate-700"
    },
    {
        id: 6,
        title: "귀여운 3D 픽사 스타일",
        category: "아트 스타일 (Style)",
        tags: ["#3D", "#픽사", "#애니메이션", "#귀여운"],
        prompt: "Cute 3D Pixar animation style red fox wearing a tiny backpack, standing in a sunny clearing, large expressive eyes, fluffy fur, soft lighting, vibrant colors, octane render",
        bgColor: "bg-orange-600"
    }
];

const categories = ["전체", "캐릭터 (Character)", "배경 (Background)", "오브젝트 (Object)", "아트 스타일 (Style)"];

export default function VisualPromptPage() {
    const [activeCategory, setActiveCategory] = useState("전체");

    const filteredItems = activeCategory === "전체"
        ? promptItems
        : promptItems.filter(item => item.category === activeCategory);

    return (
        <div className="flex h-full w-full flex-col bg-gray-50 overflow-y-auto">

            {/* 상단 히어로 섹션 */}
            <div className="w-full bg-slate-900 pt-16 pb-12 px-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-slate-900 to-slate-900"></div>
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-white mb-4 flex items-center justify-center gap-2">
                        <Sparkles className="w-8 h-8 text-blue-400" />
                        비주얼 프롬프트 갤러리
                    </h2>
                    <p className="text-slate-300 mb-8 text-lg">
                        전문가들이 직접 작성한 고품질 생성형 AI 프롬프트 라이브러리입니다.<br />
                        원하는 스타일을 찾고, 즉시 복사하여 영상과 썸네일 제작에 활용하세요.
                    </p>

                    {/* 검색 바 */}
                    <div className="flex max-w-2xl mx-auto bg-white rounded-full p-1.5 shadow-lg">
                        <div className="flex-1 flex items-center px-4">
                            <Search className="w-5 h-5 text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="어떤 스타일의 이미지를 찾으시나요? (예: 사이버펑크, 캐릭터, 수묵화)"
                                className="w-full bg-transparent border-none focus:outline-none text-gray-800"
                            />
                        </div>
                        <Button className="rounded-full px-8 bg-blue-600 hover:bg-blue-700 font-bold">
                            검색
                        </Button>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl mx-auto p-8 flex flex-col lg:flex-row gap-8">

                {/* 좌측: 필터 사이드바 */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-8 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4" /> 카테고리 필터
                            </h3>
                            <div className="space-y-1">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat
                                                ? 'bg-blue-100 text-blue-700 font-bold shadow-sm'
                                                : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4" /> 인기 태그
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['#시네마틱', '#지브리스타일', '#극사실주의', '#수채화', '#미니멀리즘', '#메카닉', '#조명효과'].map(tag => (
                                    <span key={tag} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-colors">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 우측: 갤러리 그리드 */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-6">
                        <div className="text-gray-600 font-medium">
                            총 <span className="font-bold text-gray-900">{filteredItems.length}</span>개의 프롬프트
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="h-8 bg-white text-gray-600">
                                <LayoutGrid className="w-4 h-4 mr-1" /> 인기순
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden border-gray-200 hover:shadow-md hover:border-blue-300 transition-all group flex flex-col h-full">
                                {/* 이미지 영역 (색상 블록으로 대체) */}
                                <div className={`w-full aspect-square ${item.bgColor} relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Button className="bg-white/90 hover:bg-white text-gray-900 font-bold">
                                            상세 보기
                                        </Button>
                                    </div>
                                    <button className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded">
                                            {item.category.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>

                                {/* 텍스트 영역 */}
                                <CardContent className="p-5 flex flex-col flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{item.title}</h3>

                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {item.tags.map(tag => (
                                            <span key={tag} className="text-xs text-blue-600 font-medium">{tag}</span>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 font-mono bg-slate-50 p-2 rounded">
                                            {item.prompt}
                                        </p>
                                        <Button className="w-full bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center gap-2">
                                            <Copy className="w-4 h-4" />
                                            프롬프트 복사
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
