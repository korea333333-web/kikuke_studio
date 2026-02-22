"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [target, setTarget] = useState("");
  const [tone, setTone] = useState("");
  return (
    <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
      <div className="w-full max-w-5xl p-8 mt-12">
        {/* 헤더 영역 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">기본 설정</h2>
          <p className="text-gray-500">영상을 만들기 위해 필요한 기본 정보를 직접 입력해주세요.</p>
        </div>



        {/* 1단계 입력 폼 카드 */}
        <Card className="border shadow-sm bg-white">
          <CardContent className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 antialiased">영상 기본 정보</h3>
            <p className="text-sm text-gray-500 mb-8 pb-4 border-b">
              만들고자 하는 영상의 주제와 설정들을 자유롭게 입력해주세요.
            </p>

            <div className="space-y-8">


              {/* 주제 및 기획 의도 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">주제 및 내용</Label>
                <Select onValueChange={setTopic}>
                  <SelectTrigger className="w-full text-left font-normal bg-white">
                    <SelectValue placeholder="영상의 주제를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short-movie">단편 영화 / 웹드라마 (로맨스, 스릴러 등)</SelectItem>
                    <SelectItem value="mystery">미스터리 / 공포 괴담 / 기묘한 이야기</SelectItem>
                    <SelectItem value="sci-fi">SF / 미래형 세계관 시나리오</SelectItem>
                    <SelectItem value="fantasy">무협 / 판타지 소설 (오디오북 스크립트)</SelectItem>
                    <SelectItem value="true-crime">범죄 프로파일링 / 미제 사건 분석(스토리텔링형)</SelectItem>
                    <SelectItem value="history">역사적 사건 기반 픽션 드라마</SelectItem>
                    <SelectItem value="fairytale">어린이용 창작 동화 / 애니메이션 대본</SelectItem>
                    <SelectItem value="music-video">세계관 기반 뮤직비디오 스토리보드</SelectItem>
                    <SelectItem value="it-review">IT 기기 / 전자기기 리뷰</SelectItem>
                    <SelectItem value="vlogs">일상 브이로그 (Vlog)</SelectItem>
                    <SelectItem value="finance">재테크 / 주식 / 부동산 (스토리텔링형 해설)</SelectItem>
                    <SelectItem value="custom">직접 입력하기</SelectItem>
                  </SelectContent>
                </Select>
                {topic === "custom" && (
                  <Textarea
                    placeholder="예) 인공지능이 세상을 지배하게 된 먼 미래를 배경으로 한 SF 액션 드라마"
                    className="min-h-[100px] bg-white resize-none mt-3"
                  />
                )}
              </div>

              {/* 타겟 시청자 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">타겟 시청자</Label>
                <Select onValueChange={setTarget}>
                  <SelectTrigger className="w-full text-left font-normal bg-white">
                    <SelectValue placeholder="주요 시청자층을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teen">10대 (트렌디, 빠르고 숏폼 선호)</SelectItem>
                    <SelectItem value="twenties">2030세대 (자기계발, 재밌고 실용적인 내용)</SelectItem>
                    <SelectItem value="office">직장인 (공감대, 재테크, 스트레스 해소)</SelectItem>
                    <SelectItem value="parents">육아/주부 (공감, 생활 꿀팁, 교육)</SelectItem>
                    <SelectItem value="senior">시니어 (알기 쉬운 설명, 느린 템포, 건강/정보)</SelectItem>
                    <SelectItem value="all">전 연령층 (대중적인 콘텐츠)</SelectItem>
                    <SelectItem value="custom">직접 입력하기</SelectItem>
                  </SelectContent>
                </Select>
                {target === "custom" && (
                  <Input
                    placeholder="예) 10-20대 SF 및 미스터리 영화 매니아"
                    className="bg-white mt-3"
                  />
                )}
              </div>

              {/* 톤앤매너 설정 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">톤앤매너 (분위기 및 말투)</Label>
                <Select onValueChange={setTone}>
                  <SelectTrigger className="w-full text-left font-normal bg-white">
                    <SelectValue placeholder="영상의 전반적인 분위기를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">전문적이고 신뢰감 있는 (존댓말, 아나운서 톤)</SelectItem>
                    <SelectItem value="friendly">친근하고 편안한 (가벼운 존댓말, 옆집 형/누나 톤)</SelectItem>
                    <SelectItem value="humorous">유머러스하고 재치있는 (드립, 활기찬 톤)</SelectItem>
                    <SelectItem value="calm">차분하고 감성적인 (ASMR, 조용한 독백 톤)</SelectItem>
                    <SelectItem value="energetic">텐션이 높고 에너지 넘치는 (빠른 전개, 강한 억양)</SelectItem>
                    <SelectItem value="cinematic">긴장감 넘치고 시네마틱한 (영화 예고편 톤)</SelectItem>
                    <SelectItem value="custom">직접 입력하기</SelectItem>
                  </SelectContent>
                </Select>
                {tone === "custom" && (
                  <Input
                    placeholder="예) 어둡고 무거운 분위기, 차갑고 건조한 대사 톤"
                    className="bg-white mt-3"
                  />
                )}
              </div>
            </div>

            {/* 하단 버튼 블록 */}
            <div className="mt-10 pt-6 border-t flex justify-end gap-3">
              <Button variant="outline" className="w-[120px]">
                초기화
              </Button>
              <Button className="w-[200px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                다음 단계로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
