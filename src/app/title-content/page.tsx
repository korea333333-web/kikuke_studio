"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, Hash } from "lucide-react";

export default function TitleContentPage() {
    return (
        <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
            <div className="w-full max-w-5xl p-8 mt-12">
                {/* 헤더 영역 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">제목/내용 생성</h2>
                    <p className="text-gray-500">생성된 대본을 바탕으로 유튜브 업로드용 제목과 더보기란(설명, 태그)을 제안합니다.</p>
                </div>

                {/* 생성 조건 컨트롤 패널 */}
                <Card className="border shadow-sm bg-white rounded-xl mb-8">
                    <CardContent className="p-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 antialiased">생성 옵션 설정</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* 제목 강조 포인트 */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">제목 강조 포인트</Label>
                                <Select defaultValue="hook">
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="강조 포인트 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hook">강렬한 후킹 (클릭 유도)</SelectItem>
                                        <SelectItem value="emotion">감성/서사 중심</SelectItem>
                                        <SelectItem value="info">정보 전달/핵심 요약</SelectItem>
                                        <SelectItem value="mystery">호기심 자극 (미스터리)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 내용 강조 포인트 */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">내용(더보기란) 강조 포인트</Label>
                                <Select defaultValue="summary">
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="강조 포인트 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="summary">전체 스토리 요약 중심</SelectItem>
                                        <SelectItem value="character">캐릭터 매력 강조</SelectItem>
                                        <SelectItem value="world">상세한 세계관 설명</SelectItem>
                                        <SelectItem value="callToAction">참여 유도 (구독/좋아요 강조)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 이모지 사용량 */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-900">이모지 활용도</Label>
                                <Select defaultValue="moderate">
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue placeholder="이모지 사용량 선택" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">사용 안 함 (진중한 톤)</SelectItem>
                                        <SelectItem value="light">가볍게 포인트만 (1~2개)</SelectItem>
                                        <SelectItem value="moderate">적절히 사용 (기본)</SelectItem>
                                        <SelectItem value="heavy">적극 방출 (눈에 띄게✨🔥)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button className="w-[180px] bg-[#6a35ff] hover:bg-[#5b2bd6] text-white font-semibold py-5 rounded-lg shadow-sm">
                                <Sparkles className="w-4 h-4 mr-2" />
                                맞춤형 제목/내용 생성
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 결과 화면 패널 */}
                <Card className="border shadow-sm bg-white rounded-xl">
                    <CardContent className="p-8">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-lg font-bold text-gray-900 antialiased">AI 메타데이터 제안 결과</h3>
                            <Button className="bg-[#0f52ba] hover:bg-blue-700 text-white font-semibold shadow-sm">
                                텍스트 전체 복사
                            </Button>
                        </div>

                        <div className="space-y-8">
                            {/* 1. 추천 제목 풀 */}
                            <div className="border rounded-xl p-6 bg-slate-50/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-bold text-gray-900 text-sm">추천 유튜브 제목 (클릭 유도)</h4>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 font-medium hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group">
                                        <span className="text-gray-400 group-hover:text-blue-500 mt-0.5">•</span>
                                        [단독공개] 천재 해커가 3년 동안 모습을 감췄던 진짜 이유... "Ghost"의 귀환 💻🔥
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 font-medium hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group">
                                        <span className="text-gray-400 group-hover:text-blue-500 mt-0.5">•</span>
                                        "내 복수는 코드로 시작된다" 뒷세계 1위 해커 차윤서의 미친 침투 실력 ㄷㄷ (사이버펑크 스릴러)
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 font-medium hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors group">
                                        <span className="text-gray-400 group-hover:text-blue-500 mt-0.5">•</span>
                                        완벽했던 해커의 단 한 번의 실수... 그리고 시작된 치명적인 사랑 이야기 💔
                                    </div>
                                </div>
                            </div>

                            {/* 2. 유튜브 더보기란: 요약 및 타임라인 */}
                            <div className="border rounded-xl p-6 bg-slate-50/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-emerald-600" />
                                    <h4 className="font-bold text-gray-900 text-sm">유튜브 더보기란 (설명 및 타임라인)</h4>
                                </div>
                                <Textarea
                                    readOnly
                                    defaultValue="최고의 실력을 갖춘 천재 해커 차윤서('Ghost').
3년 전의 사건으로 은둔하던 그녀가 다시 키보드 앞에 앉았다.
차갑고 예민한 외면 뒤에 숨겨진 그녀의 진짜 목적은 무엇일까?
그리고 그녀의 완벽한 코드에 예상치 못한 '버그'가 생기기 시작하는데...

네온사인 가득한 사이버펑크 도시에서 펼쳐지는 치명적인 로맨스 스릴러!

[타임라인]
00:00 - Ghost, 3년 만의 시스템 접속
01:45 - 첫 번째 타겟: 코퍼레이션 보안망 뚫기
04:12 - 뜻밖의 에러, 그리고 그 남자와의 첫 만남
08:30 - 해커의 사랑이야기 메인 테마
12:00 - 복수와 사랑 사이에서의 갈등

구독과 좋아요, 알림 설정은 엄청난 시너지를 만듭니다! ✨"
                                    className="min-h-[250px] bg-white border-gray-200 resize-none text-sm text-gray-800 focus-visible:ring-1 focus-visible:ring-blue-500 leading-relaxed font-mono whitespace-pre-wrap"
                                />
                            </div>

                            {/* 3. 추천 해시태그 */}
                            <div className="border rounded-xl p-6 bg-slate-50/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Hash className="w-5 h-5 text-purple-600" />
                                    <h4 className="font-bold text-gray-900 text-sm">추천 해시태그</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['#해커', '#사이버펑크', '#로맨스스릴러', '#차윤서', '#Ghost', '#웹소설원작', '#AI단편영화'].map((tag) => (
                                        <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 cursor-pointer transition-colors text-xs font-semibold rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
