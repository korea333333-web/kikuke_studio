"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Youtube, Upload, Link as LinkIcon, CheckCircle2, AlertCircle, Video } from "lucide-react";

export default function YoutubeUploadPage() {
    const [isConnected, setIsConnected] = useState(false);

    // 이전에 생성된 더미 데이터를 불러왔다고 가정
    const dummyData = {
        title: '[단독공개] 천재 해커가 3년 동안 모습을 감췄던 진짜 이유... "Ghost"의 귀환 💻🔥',
        description: '최고의 실력을 갖춘 천재 해커 차윤서(\'Ghost\').\n3년 전의 사건으로 은둔하던 그녀가 다시 키보드 앞에 앉았다.\n\n00:00 오프닝: 어둠 속의 타이핑\n00:45 과거의 그림자\n...',
        tags: '#해커, #사이버펑크, #로맨스스릴러, #단편영화',
    };

    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-5xl p-8 mt-12 mb-12">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Youtube className="w-8 h-8 text-red-600" />
                        유튜브 자동 업로드
                    </h2>
                    <p className="text-gray-500">스튜디오에서 제작한 영상과 메타데이터(제목, 썸네일, 더보기란)를 내 유튜브 채널에 원클릭으로 업로드합니다.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 좌측: 계정 연결 및 설정 퍼널 */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 1. 계정 연결 */}
                        <Card className="border shadow-sm bg-white rounded-xl">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">1</span>
                                    채널 연동
                                </h3>

                                {!isConnected ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500">유튜브 업로드를 위해 구글 계정을 연결해주세요. (YouTube Data API v3 권한 필요)</p>
                                        <Button
                                            onClick={() => setIsConnected(true)}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2"
                                        >
                                            <Youtube className="w-5 h-5" /> 구글 계정으로 로그인
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-emerald-900 text-sm">연결 완료됨</div>
                                            <div className="text-xs text-emerald-700 mt-1">KIKUKE Studio Official 채널</div>
                                            <button
                                                onClick={() => setIsConnected(false)}
                                                className="text-xs text-emerald-600 underline mt-2 hover:text-emerald-800"
                                            >
                                                계정 로그아웃
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 2. 업로드 설정 */}
                        <Card className={`border shadow-sm rounded-xl transition-opacity ${!isConnected ? 'opacity-50 pointer-events-none bg-gray-50' : 'bg-white'}`}>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">2</span>
                                    공개 및 카테고리 설정
                                </h3>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">공개 상태</Label>
                                        <Select defaultValue="private">
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="공개 상태 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">공개 (Public)</SelectItem>
                                                <SelectItem value="unlisted">일부 공개 (Unlisted)</SelectItem>
                                                <SelectItem value="private">비공개 (Private)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" /> 최초 업로드 시 비공개/일부공개를 권장합니다.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">카테고리</Label>
                                        <Select defaultValue="24">
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="카테고리 선택" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="24">엔터테인먼트</SelectItem>
                                                <SelectItem value="1">영화/애니메이션</SelectItem>
                                                <SelectItem value="20">게임</SelectItem>
                                                <SelectItem value="27">교육</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-100">
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold h-14 shadow-lg flex items-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            유튜브에 즉시 업로드
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 우측: 업로드 데이터 최종 검토 (미리보기) */}
                    <div className="lg:col-span-2">
                        <Card className="border shadow-sm bg-white rounded-xl h-full">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs">3</span>
                                    최종 업로드 데이터 검토 (수정 가능)
                                </h3>

                                <div className="space-y-6">
                                    {/* 첨부파일 영역 */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-md flex items-center justify-center">
                                                <Video className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 mb-1">첨부된 영상 파일</div>
                                                <div className="font-semibold text-sm text-gray-900 truncate">final_output_video_v1.mp4</div>
                                                <div className="text-xs text-emerald-600 mt-1">✓ 렌더링 완료 (1080p, 45MB)</div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-md flex items-center justify-center overflow-hidden">
                                                {/* 실제 썸네일 이미지가 들어갈 자리이나 아이콘으로 대체 */}
                                                <div className="text-xs font-bold font-serif px-1 text-center leading-none">천재<br />해커</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 mb-1">첨부된 맞춤 썸네일</div>
                                                <div className="font-semibold text-sm text-gray-900 truncate">youtube_thumbnail.jpg</div>
                                                <div className="text-xs text-emerald-600 mt-1">✓ 제작 완료 (1280x720)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">유튜브 제목 (Title)</Label>
                                        <Input
                                            defaultValue={dummyData.title}
                                            className="font-medium text-gray-900 border-gray-300"
                                            maxLength={100}
                                        />
                                        <div className="text-right text-xs text-gray-400">71/100</div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">더보기란 설명 (Description)</Label>
                                        <Textarea
                                            defaultValue={dummyData.description}
                                            className="min-h-[200px] resize-none text-sm text-gray-700 border-gray-300 leading-relaxed"
                                            maxLength={5000}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">해시태그 (Tags)</Label>
                                        <Textarea
                                            defaultValue={dummyData.tags}
                                            className="min-h-[60px] resize-none text-sm text-blue-600 border-gray-300 font-medium"
                                        />
                                        <p className="text-xs text-gray-500">쉼표(,)로 구분하여 입력하세요.</p>
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
