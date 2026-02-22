"use client";

import React, { useState, useEffect } from 'react';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function StoryScriptPage() {
    const { topic } = useStoryStore();
    const [step, setStep] = useState(1);
    const [localTopic, setLocalTopic] = useState("");

    useEffect(() => {
        if (topic) {
            setLocalTopic(topic);
        }
    }, [topic]);

    const handleNext = () => setStep(step < 3 ? step + 1 : 3);
    const handlePrev = () => setStep(step > 1 ? step - 1 : 1);

    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-5xl p-8 mt-12">
                {/* 헤더 영역 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">스토리 대본 생성</h2>
                    <p className="text-gray-500">장르별 스토리 대본을 생성합니다.</p>
                </div>

                {/* 상단 스텝 버튼 (알약 형태) */}
                <div className="flex items-center gap-3 mb-8">
                    <button
                        onClick={() => setStep(1)}
                        className={`px-5 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${step === 1 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        1. 대본 생성
                    </button>
                    <button
                        onClick={() => setStep(2)}
                        className={`px-5 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${step === 2 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        2. 캐릭터 시트
                    </button>
                    <button
                        onClick={() => setStep(3)}
                        className={`px-5 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors ${step === 3 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                    >
                        3. 이미지 프롬프트
                    </button>
                </div>

                {step === 1 && (
                    <Card className="border shadow-sm bg-white rounded-xl">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 antialiased">Step 1. 대본 생성 (한국어)</h3>

                            <div className="space-y-6">
                                {/* 생성 길이 */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900">생성 길이</Label>
                                    <Select defaultValue="10000">
                                        <SelectTrigger className="w-full text-left font-normal bg-white">
                                            <SelectValue placeholder="길이를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5000">5,000자</SelectItem>
                                            <SelectItem value="10000">10,000자</SelectItem>
                                            <SelectItem value="15000">15,000자</SelectItem>
                                            <SelectItem value="20000">20,000자</SelectItem>
                                            <SelectItem value="30000">30,000자</SelectItem>
                                            <SelectItem value="40000">40,000자</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 주제/키워드 */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900">주제/키워드</Label>
                                    <Input
                                        placeholder="예: 용사가 마왕을 물리치는 여정, 천재 해커의 복수극"
                                        className="bg-white"
                                        value={localTopic}
                                        onChange={(e) => setLocalTopic(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 하단 버튼 블록 */}
                            <div className="mt-8 flex items-center gap-3">
                                <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg shadow-sm">
                                    대본 생성
                                </Button>
                                <Button className="w-[100px] bg-slate-600 hover:bg-slate-700 text-white font-semibold py-6 rounded-lg shadow-sm">
                                    직접 첨부
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="border shadow-sm bg-white rounded-xl">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">Step 2. 캐릭터 시트 추출</h3>
                            <p className="text-sm text-gray-600 mb-6">대본에서 등장인물의 외형 정보를 AI가 분석하여 캐릭터 시트를 생성합니다. (고정 프롬프트 블록 + 부정 프롬프트 포함)</p>

                            <div className="flex items-center gap-2 mb-6">
                                <Button onClick={handlePrev} variant="outline" className="text-gray-600 bg-gray-100 hover:bg-gray-200 border-none">
                                    ← 이전
                                </Button>
                                <div className="flex-1 bg-slate-400 text-white text-sm font-medium py-2 rounded-md text-center">
                                    분석 중...
                                </div>
                                <Button className="bg-slate-600 hover:bg-slate-700 text-white">
                                    직접 첨부
                                </Button>
                            </div>

                            <div className="border rounded-xl p-6 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-gray-900 text-sm">캐릭터 시트</h4>
                                    <span className="text-xs text-blue-600 font-semibold">1,024자</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50/50 p-3 rounded-md border border-blue-100">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                                        캐릭터 분석 중...
                                    </div>
                                    <pre className="min-h-[300px] w-full bg-slate-100/50 border border-gray-200 rounded-md p-6 text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-y-auto leading-relaxed shadow-inner">
                                        {`# 해커의 사랑이야기 - 캐릭터 시트
───────────────────────────

## 캐릭터 1: 차윤서 (Cha Yun-seo)
───────────────────────────

### 기본 정보
- **이름:** 차윤서 (Cha Yun-seo)
- **나이:** 26세 (3년 전 기준 23세)
- **성별:** 여성
- **국적/민족:** 한국인
- **직업/역할:** 해커 (온라인 닉네임: Ghost)
- **성격 키워드:** 내성적, 예민한, 집중력 강한, 감정 깊은, 조심스러운

### 얼굴 구조
- **얼굴형:** (추론) Oval(길고 갸름한 형)
- **광대뼈:** 보통 높이, 평평하지 않고 약간 돌출
- **턱선:** 날카로운 각진 턱, 명확한 턱선
- **코:** 폭(보통), 길이(보통에서 약간 긴), 브릿지(높은 콧대) (추론)
- **입술:** 두께(보통), 형태(윗입술이 약간 얇고 아랫입술이 도톰한 형태) (추론)
- **이마:** 보통에서 약간 넓은, 헤어라인 형태(자연스러운 일자형) (추론)

### 눈
- **형태:** Double eyelid (쌍꺼풀), almond shape (아몬드형) (추론)
- **크기:** 보통
- **색상:** Dark brown 다크 브라운 (#3B1E08)
- **눈썹:** 형태(약간 곧은 편, 미세한 각도), 두께(보통), 색상(black #1A1A1A) (추론)

### 피부
- **톤:** Fitzpatrick Type III, 밝은 베이지에서 약간 따뜻한 톤 (#E8D5C4) (추론)
- **질감:** 매끈한 피부, 약간의 모공 (추론)
- **특이사항:** 특별한 흉터나 점 없음, 밤샘 작업으로 인한 약간의 피로감이 눈가에 나타남 (추론)

### 헤어
- **색상:** Black 블랙 (#1A1A1A)
- **길이:** 짧은 편, 귀를 덮지 않는 길이, 앞머리는 이마 절반 가림`}
                                    </pre>
                                </div>

                                <div className="flex items-center gap-2 mt-6">
                                    <Button variant="outline" className="border-orange-400 text-orange-500 hover:bg-orange-50 hover:text-orange-600 w-20">
                                        편집
                                    </Button>
                                    <Button variant="destructive" className="bg-red-500 hover:bg-red-600 w-20">
                                        중단
                                    </Button>
                                    <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                        다음: 이미지 프롬프트 →
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="border shadow-sm bg-white rounded-xl">
                        <CardContent className="p-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">Step 3. 영어 이미지 프롬프트 생성</h3>
                            <p className="text-sm text-gray-600 mb-8">캐릭터 DNA + 시각화 스타일을 반영하여 영어 이미지 프롬프트를 생성합니다.</p>

                            <div className="space-y-6 mb-8">
                                {/* 시각화 스타일 */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900">시각화 스타일</Label>
                                    <Select>
                                        <SelectTrigger className="w-full text-left font-normal bg-white">
                                            <SelectValue placeholder="스타일을 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cinematic">Cinematic (영화 같은)</SelectItem>
                                            <SelectItem value="anime">Anime (애니메이션)</SelectItem>
                                            <SelectItem value="cyberpunk">Cyberpunk (사이버펑크)</SelectItem>
                                            <SelectItem value="fantasy">Fantasy (판타지)</SelectItem>
                                            <SelectItem value="photorealistic">Photorealistic (실사)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 프롬프트 밀도 */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-900">프롬프트 밀도</Label>
                                    <Select defaultValue="1-1">
                                        <SelectTrigger className="w-full text-left font-normal bg-white">
                                            <SelectValue placeholder="밀도를 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1-1">1문장 = 1프롬프트</SelectItem>
                                            <SelectItem value="1-2">1문단 = 1프롬프트</SelectItem>
                                            <SelectItem value="detail">상세 묘사 우선</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* 하단 버튼 블록 */}
                            <div className="flex items-center gap-3">
                                <Button onClick={handlePrev} className="w-[100px] bg-gray-500 hover:bg-gray-600 text-white font-semibold py-6 rounded-lg shadow-sm">
                                    ← 이전
                                </Button>
                                <Button className="flex-1 bg-[#0f52ba] hover:bg-blue-700 text-white font-semibold py-6 rounded-lg shadow-sm">
                                    이미지 프롬프트 생성
                                </Button>
                                <Button className="flex-1 bg-[#6a35ff] hover:bg-[#5b2bd6] text-white font-semibold py-6 rounded-lg shadow-sm">
                                    영상 프롬프트 생성
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
