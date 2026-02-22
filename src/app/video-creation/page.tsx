"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, Paperclip, Upload, Volume2, Image as ImageIcon, Video, PlayCircle } from "lucide-react";

export default function VideoCreationPage() {
    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-5xl p-8 mt-12">
                {/* 헤더 및 상단 컨트롤 버튼 */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">영상 제작 스튜디오</h2>
                        <p className="text-gray-500">대본을 입력하고 AI로 음성과 이미지를 생성하여 영상을 완성하세요.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                            테스트
                        </Button>
                        <Button className="bg-[#1a56db] hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5">
                            <Paperclip className="w-4 h-4" />
                            직접 첨부 ON
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4" />
                            일괄 이미지 업로드
                        </Button>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            일괄 동영상 업로드
                        </Button>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600 font-semibold flex items-center gap-1.5">
                            <RefreshCw className="w-4 h-4" />
                            초기화
                        </Button>
                    </div>
                </div>

                <Card className="border shadow-sm bg-white rounded-xl mb-8">
                    <CardContent className="p-8">
                        {/* 1. 최종 대본 영역 */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-base font-bold text-gray-900">최종 대본</Label>
                            </div>
                            <Textarea
                                className="min-h-[250px] bg-slate-50/50 border-gray-200 resize-none text-sm text-gray-800 leading-relaxed font-mono"
                                defaultValue={`contracts, near the foreground of the queue Kang Hyuk-su is identifiable - Korean male square face monolid eyes buzz-cut hair stubble gaunt build in slate gray uniform - his large calloused welder's hands with burn spots just completing his signature his dead hollow eyes looking not at the document but straight ahead into nothing, the scale of eight thousand condemned humans processed like livestock is the core visual impact, rendered with sharp precise mechanical line work, glowing neon energy outlines on red ID codes creating river of light and holographic contract glows at signing stations, hard-edge digital shading with harsh overhead industrial processing lighting casting uniform shadows on eight thousand identical gray figures, industrial Terran grime on facility walls and metal infrastructure, faction-specific saturated color palette featuring mass institutional gray uniforms with red ID code river and cold steel-blue facility lighting, dynamic sci-fi gradient background blending industrial facility ceiling and vanishing-point perspective, epic interstellar`}
                            />
                            <button className="text-xs text-gray-500 mt-2 flex items-center gap-1 hover:text-gray-700">
                                <PlayCircle className="w-3 h-3" /> 지원 포맷 안내
                            </button>
                        </div>

                        {/* 2. 환경 설정 옵션 (4단 그리드) */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">자막 줄바꿈 (글자 수)</Label>
                                <Input defaultValue="30" className="w-full bg-white border-gray-200" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">TTS 제공자 선택</Label>
                                <Select defaultValue="elevenlabs">
                                    <SelectTrigger className="w-full bg-white border-gray-200">
                                        <SelectValue placeholder="제공자 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">성우 선택</Label>
                                <Select defaultValue="voice1">
                                    <SelectTrigger className="w-full bg-white border-gray-200">
                                        <SelectValue placeholder="성우 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="voice1">myK0rAapHek2oTw18z8x (사...</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">TTS 모델 선택 (ElevenLabs)</Label>
                                <Select defaultValue="v3">
                                    <SelectTrigger className="w-full bg-white border-gray-200">
                                        <SelectValue placeholder="모델 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="v3">Eleven v3 (Alpha)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* 3. 영상 스타일 탭 */}
                        <div className="mb-6 space-y-2">
                            <Label className="text-sm font-semibold text-gray-900">영상 스타일</Label>
                            <div className="flex bg-slate-100 p-1 rounded-lg w-max border border-gray-200">
                                {['애니메이션', '애니메이션2', '애니메이션3', '실사화', '실사화2', '커스텀'].map((style, idx) => (
                                    <button
                                        key={style}
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${idx === 0 ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. 목소리 미리듣기 */}
                        <div className="flex items-center gap-2 mb-8">
                            <Input
                                placeholder="목소리 미리듣기용 문장 입력"
                                className="flex-1 bg-white border-gray-200"
                            />
                            <Button className="bg-slate-700 hover:bg-slate-800 text-white font-semibold flex items-center gap-2 px-6">
                                <Volume2 className="w-4 h-4" />
                                미리듣기
                            </Button>
                        </div>

                        {/* 5. 단계 진행 버튼 */}
                        <div className="flex gap-4 mb-8">
                            <Button className="flex-1 bg-slate-400 hover:bg-slate-500 text-white text-lg font-bold py-6 rounded-xl border-none shadow-none cursor-not-allowed opacity-80" disabled>
                                2단계: 이미지 생성
                            </Button>
                            <Button className="flex-1 bg-slate-400 hover:bg-slate-500 text-white text-lg font-bold py-6 rounded-xl border-none shadow-none cursor-not-allowed opacity-80" disabled>
                                3단계: 영상 생성
                            </Button>
                        </div>

                        {/* 6. 옵션 체크박스 */}
                        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="include-subs" defaultChecked className="text-blue-600 border-gray-300" />
                                <Label htmlFor="include-subs" className="text-sm font-bold text-gray-900 cursor-pointer">영상에 자막 포함하기</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="custom-audio" className="border-gray-300" />
                                <Label htmlFor="custom-audio" className="text-sm font-medium text-gray-700 cursor-pointer">내 오디오 파일 사용 (TTS 대신)</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 7. 문장별 영어 프롬프트 영역 */}
                <div className="mb-4">
                    <Label className="text-base font-bold text-gray-900">문장별 영어 프롬프트 입력 (선택사항)</Label>
                    <p className="text-sm text-gray-600 mt-1 mb-4">각 문장에 대한 영어 프롬프트를 직접 입력하거나, 아래 '1단계: 프롬프트 생성' 버튼을 눌러 자동 생성할 수 있습니다.</p>

                    <div className="flex items-center gap-2 mb-6">
                        <Button className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold border-none">
                            ✨ 나노바나나 PRO 전체선택
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none">
                            🌿 나노바나나 노말 전체해제
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {/* 문장 8 예시 카드 */}
                        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm overflow-hidden">
                            <div className="flex items-center gap-6 p-4 bg-slate-50 border-b border-gray-200 -mx-6 -mt-6 mb-4">
                                <div className="font-bold text-gray-900">문장 8:</div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="pro-8" className="border-gray-300 data-[state=checked]:bg-amber-400 data-[state=checked]:text-amber-950 data-[state=checked]:border-none" />
                                    <Label htmlFor="pro-8" className="text-sm font-bold text-amber-600 flex items-center gap-1 cursor-pointer">✨ PRO</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="normal-8" className="border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none" />
                                    <Label htmlFor="normal-8" className="text-sm font-bold text-emerald-600 cursor-pointer">🌿 노말</Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm text-gray-900 font-medium font-serif bg-gray-50 p-3 rounded-md border border-gray-100">
                                    사형은 사라졌지만 그보다 훨씬 잔인한 것이 그 자리를 대신했다.
                                </div>
                                <Textarea
                                    className="min-h-[100px] bg-white border-gray-200 resize-none text-sm text-gray-800 font-mono"
                                    defaultValue="Korean manhwa sci-fi military style webtoon panel, symbolic dark composition — center frame a traditional execution chamber electric chair or lethal injection table rendered in cold sterile institutional gray is shown crumbling and dissolving into digital particles from left to right, but from the dissolving particles on the right side a far more horrifying image materializes — a CMC-"
                                />
                            </div>
                        </div>

                        {/* Dummy Card 2 */}
                        <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm overflow-hidden opacity-60">
                            <div className="flex items-center gap-6 p-4 bg-slate-50 border-b border-gray-200 -mx-6 -mt-6 mb-4">
                                <div className="font-bold text-gray-900">문장 9:</div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="pro-9" className="border-gray-300" />
                                    <Label htmlFor="pro-9" className="text-sm font-bold text-amber-600 flex items-center gap-1 cursor-pointer">✨ PRO</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="normal-9" defaultChecked className="border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none" />
                                    <Label htmlFor="normal-9" className="text-sm font-bold text-emerald-600 cursor-pointer">🌿 노말</Label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-sm text-gray-900 font-medium font-serif bg-gray-50 p-3 rounded-md border border-gray-100">
                                    우리는 식량과 자원을 대가로 스스로를 팔아넘겼다.
                                </div>
                                <Textarea
                                    className="min-h-[100px] bg-white border-gray-200 resize-none text-sm text-gray-800 font-mono"
                                    placeholder="프롬프트가 자동 생성됩니다..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
