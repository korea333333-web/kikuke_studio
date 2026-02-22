"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Type, Image as ImageIcon, Download, Sparkles, LayoutTemplate, Palette, TypeIcon, PaintBucket, Move } from "lucide-react";

export default function ThumbnailCreationPage() {
    const [selectedTemplate, setSelectedTemplate] = useState('split');
    const [mainText, setMainText] = useState('천재 해커가 모습을 감춘 이유');
    const [subText, setSubText] = useState('[단독 공개]');

    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-6xl p-8 mt-12 mb-12">
                {/* 헤더 영역 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">썸네일 제작 스튜디오</h2>
                    <p className="text-gray-500">생성된 이미지와 텍스트를 조합하여 클릭을 유도하는 맞춤형 유튜브 썸네일을 무료로 제작하세요.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* 좌측: 캔버스 에디터 (미리보기) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* AI 썸네일 기획 제안 영역 */}
                        <Card className="border border-blue-100 shadow-sm bg-blue-50/50 rounded-xl overflow-hidden">
                            <div className="bg-blue-600 px-6 py-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <h3 className="text-sm font-bold text-white">AI 썸네일 기획 추천</h3>
                            </div>
                            <CardContent className="p-6">
                                <p className="text-sm text-gray-600 mb-4">현재 대본을 바탕으로 분석한 가장 클릭률이 높을 콘셉트입니다. 텍스트를 클릭하면 캔버스에 적용됩니다.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button onClick={() => { setMainText("천재 해커가 3년 넘게\n모습을 감춘 이유"); setSubText("[충격 반전]"); }} className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-sm group">
                                        <div className="font-bold text-blue-700 mb-1 group-hover:text-blue-800">콘셉트 A (미스터리)</div>
                                        <div className="text-gray-800 font-semibold leading-tight line-clamp-2">천재 해커가 3년 넘게<br />모습을 감춘 이유</div>
                                        <div className="text-xs text-red-500 mt-2 font-bold">[충격 반전]</div>
                                    </button>
                                    <button onClick={() => { setMainText("시스템을 박살낸\n단 한 줄의 코드"); setSubText("미친 해킹 실력 ㄷㄷ"); }} className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-sm group">
                                        <div className="font-bold text-purple-700 mb-1 group-hover:text-purple-800">콘셉트 B (능력 강조)</div>
                                        <div className="text-gray-800 font-semibold leading-tight line-clamp-2">시스템을 박살낸<br />단 한 줄의 코드</div>
                                        <div className="text-xs text-amber-500 mt-2 font-bold">미친 해킹 실력 ㄷㄷ</div>
                                    </button>
                                    <button onClick={() => { setMainText("해커의 사랑이\n치명적인 이유"); setSubText("사이버펑크 로맨스"); }} className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all text-sm group">
                                        <div className="font-bold text-rose-700 mb-1 group-hover:text-rose-800">콘셉트 C (서사/감성)</div>
                                        <div className="text-gray-800 font-semibold leading-tight line-clamp-2">해커의 사랑이<br />치명적인 이유</div>
                                        <div className="text-xs text-rose-500 mt-2 font-bold">사이버펑크 로맨스</div>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 작업 캔버스 */}
                        <Card className="border shadow-sm bg-white rounded-xl overflow-hidden">
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <LayoutTemplate className="w-4 h-4 text-gray-500" />
                                    썸네일 프리뷰 (1280 x 720)
                                </h3>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold">
                                        <Move className="w-3 h-3 mr-1" />
                                        요소 이동
                                    </Button>
                                    <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 font-semibold">
                                        <Download className="w-3 h-3 mr-1" />
                                        결과물 다운로드 (JPG)
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-6 bg-gray-100 flex items-center justify-center min-h-[500px]">
                                {/* CSS Background Based Canvas Mockup */}
                                <div className="relative w-full aspect-video shadow-lg rounded-md overflow-hidden bg-slate-800 border-4 border-white group cursor-crosshair">

                                    {/* 배경 레이어 (가상) */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 opacity-90"></div>

                                    {/* 이미지 예시 (Cyberpunk Hacker 느낌) - 외부 이미지 사용불가로 CSS 그라데이션과 텍스트로 대체 */}
                                    <div className="absolute right-0 bottom-0 top-0 w-2/3 bg-gradient-to-l from-emerald-900/40 to-transparent"></div>
                                    <div className="absolute right-10 bottom-0 text-[180px] leading-none opacity-20 filter blur-[2px]">👩🏻‍💻</div>

                                    {/* 텍스트 오버레이 레이어 */}
                                    <div className={`absolute top-0 bottom-0 left-0 p-10 flex flex-col justify-center ${selectedTemplate === 'center' ? 'w-full text-center items-center' : 'w-2/3 text-left'}`}>

                                        {/* 부가 텍스트 (상단) */}
                                        <div className="mb-4 inline-block transform -rotate-2">
                                            <span className="bg-red-600 text-white text-xl md:text-3xl font-black px-4 py-1.5 leading-none shadow-md border-2 border-slate-900">
                                                {subText}
                                            </span>
                                        </div>

                                        {/* 메인 텍스트 (그림자/외곽선 빵빵한 유튜브 스타일) */}
                                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.15] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter" style={{ WebkitTextStroke: '3px #1a1a1a', textShadow: '4px 4px 0 #1a1a1a, 8px 8px 15px rgba(0,0,0,0.5)' }}>
                                            {mainText.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {line}<br />
                                                </React.Fragment>
                                            ))}
                                        </h1>

                                        {/* 강조 데코레이션 (유튜브 특유의 화살표 느낌) */}
                                        <div className="absolute right-[20%] top-[20%] text-6xl transform rotate-12 drop-shadow-xl animate-pulse">
                                            😱
                                        </div>
                                    </div>

                                    {/* 가이드라인 (Hover시 보임) */}
                                    <div className="absolute inset-0 border border-blue-400/0 group-hover:border-blue-400/50 pointer-events-none transition-colors border-dashed"></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 우측: 편집 도구 패널 */}
                    <div className="lg:col-span-4">
                        <Card className="border shadow-sm bg-white rounded-xl sticky top-6">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 antialiased flex items-center gap-2 border-b pb-4">
                                    <Palette className="w-5 h-5 text-gray-600" />
                                    디자인 도구상자
                                </h3>

                                <div className="space-y-6">
                                    {/* 1. 레이아웃 선택 */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-gray-900">레이아웃 템플릿</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setSelectedTemplate('split')}
                                                className={`p-3 border rounded-lg text-xs font-medium flex flex-col items-center gap-2 transition-colors ${selectedTemplate === 'split' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className="w-full h-8 bg-gray-200 rounded flex">
                                                    <div className="w-1/2 h-full bg-blue-400/30 rounded-l"></div>
                                                </div>
                                                좌측 정렬 (기본)
                                            </button>
                                            <button
                                                onClick={() => setSelectedTemplate('center')}
                                                className={`p-3 border rounded-lg text-xs font-medium flex flex-col items-center gap-2 transition-colors ${selectedTemplate === 'center' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <div className="w-full h-8 bg-gray-200 rounded flex justify-center">
                                                    <div className="w-2/3 h-full bg-blue-400/30"></div>
                                                </div>
                                                중앙 정렬
                                            </button>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* 2. 메인 텍스트 입력 */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                <TypeIcon className="w-4 h-4 text-blue-600" /> 메인 텍스트
                                            </Label>
                                        </div>
                                        <Textarea
                                            value={mainText}
                                            onChange={(e) => setMainText(e.target.value)}
                                            className="resize-none font-semibold text-gray-800"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <Select defaultValue="dohyeon">
                                                <SelectTrigger className="w-full h-8 text-xs bg-white">
                                                    <SelectValue placeholder="폰트 선택" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="dohyeon">배달의민족 도현 (추천)</SelectItem>
                                                    <SelectItem value="jalnan">여기어때 잘난체</SelectItem>
                                                    <SelectItem value="blackhan">검은고딕</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select defaultValue="white">
                                                <SelectTrigger className="w-full h-8 text-xs bg-white">
                                                    <SelectValue placeholder="색상" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="white">기본 흰색</SelectItem>
                                                    <SelectItem value="yellow">경고 노란색</SelectItem>
                                                    <SelectItem value="neon">네온 그린</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* 3. 서브 텍스트 입력 */}
                                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-gray-100">
                                        <Label className="text-sm font-bold text-gray-900">상단 서브 텍스트 (어그로)</Label>
                                        <Input
                                            value={subText}
                                            onChange={(e) => setSubText(e.target.value)}
                                            className="bg-white font-medium"
                                        />
                                        <div className="flex items-center gap-2 mt-2">
                                            <Label className="text-xs text-gray-500 w-16">배경색</Label>
                                            <div className="flex gap-1.5">
                                                <button className="w-6 h-6 rounded bg-red-600 ring-2 ring-offset-1 ring-red-600 pointer-events-none"></button>
                                                <button className="w-6 h-6 rounded bg-black hover:ring-2 ring-offset-1 ring-gray-900"></button>
                                                <button className="w-6 h-6 rounded bg-blue-600 hover:ring-2 ring-offset-1 ring-blue-600"></button>
                                                <button className="w-6 h-6 rounded bg-yellow-400 hover:ring-2 ring-offset-1 ring-yellow-400"></button>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* 4. 이미지 및 배경 제어 */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            <ImageIcon className="w-4 h-4 text-emerald-600" /> 레이어 소스 관리
                                        </Label>

                                        <Button variant="outline" className="w-full justify-start text-sm h-10 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                                            + 나노바나나 생성 이미지 배경에 깔기
                                        </Button>

                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <Button variant="outline" className="text-xs h-9 bg-white">
                                                인물 자동 누끼 추가
                                            </Button>
                                            <Button variant="outline" className="text-xs h-9 bg-white">
                                                <PaintBucket className="w-3 h-3 mr-1" />
                                                어둡게 효과
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 5. 스티커 (클릭 유발) */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-amber-500" /> 시선 집중 스티커
                                        </Label>
                                        <div className="flex gap-2">
                                            {['😱', '🔥', '🚨', '❓', '💥', '⚠️'].map(emoji => (
                                                <button key={emoji} className="w-10 h-10 text-xl border rounded-md bg-white hover:bg-slate-100 shadow-sm transition-transform hover:scale-110">
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    );
}
