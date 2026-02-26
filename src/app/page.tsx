"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStoryStore } from '@/store/useStoryStore';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Home() {
  const router = useRouter();
  const { videoFormat: storeVideoFormat, topic: storeTopic, targetAudience: storeTarget, tone: storeTone, visualStyle: storeVisualStyle, cameraAngle: storeCameraAngle, lighting: storeLighting, setBasicSettings } = useStoryStore();

  const [videoFormat, setVideoFormat] = useState("narration");

  const [topic, setTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");

  const [target, setTarget] = useState("");
  const [customTarget, setCustomTarget] = useState("");

  const [tone, setTone] = useState("");
  const [customTone, setCustomTone] = useState("");

  // 新規 추가된 비주얼 연출 옵션
  const [visualStyle, setVisualStyle] = useState("cinematic");
  const [cameraAngle, setCameraAngle] = useState("dynamic");
  const [lighting, setLighting] = useState("dramatic");

  useEffect(() => {
    if (storeVideoFormat) setVideoFormat(storeVideoFormat);

    if (storeTopic) {
      const predefinedTopics = ["short-movie", "mystery", "sci-fi", "fantasy", "true-crime", "history", "fairytale", "music-video", "it-review", "vlogs", "finance"];
      if (predefinedTopics.includes(storeTopic)) {
        setTopic(storeTopic);
      } else {
        setTopic("custom");
        setCustomTopic(storeTopic);
      }
    }
    if (storeTarget) {
      const predefinedTargets = ["teen", "twenties", "office", "parents", "senior", "all"];
      if (predefinedTargets.includes(storeTarget)) {
        setTarget(storeTarget);
      } else {
        setTarget("custom");
        setCustomTarget(storeTarget);
      }
    }
    if (storeTone) {
      const predefinedTones = ["professional", "friendly", "humorous", "calm", "energetic", "cinematic"];
      if (predefinedTones.includes(storeTone)) {
        setTone(storeTone);
      } else {
        setTone("custom");
        setCustomTone(storeTone);
      }
    }
    if (storeVisualStyle) setVisualStyle(storeVisualStyle);
    if (storeCameraAngle) setCameraAngle(storeCameraAngle);
    if (storeLighting) setLighting(storeLighting);
  }, [storeVideoFormat, storeTopic, storeTarget, storeTone, storeVisualStyle, storeCameraAngle, storeLighting]);

  const handleNextStep = () => {
    const finalTopic = topic === "custom" ? customTopic : topic;
    const finalTarget = target === "custom" ? customTarget : target;
    const finalTone = tone === "custom" ? customTone : tone;

    setBasicSettings(videoFormat, finalTopic, finalTarget, finalTone, visualStyle, cameraAngle, lighting);
    router.push('/synopsis');
  };

  const handleReset = () => {
    setVideoFormat("narration");
    setTopic("");
    setCustomTopic("");
    setTarget("");
    setCustomTarget("");
    setTone("");
    setCustomTone("");
    setVisualStyle("cinematic");
    setCameraAngle("dynamic");
    setLighting("dramatic");
  };
  const storyTopics = [
    { value: "romance", label: "로맨스 / 멜로" },
    { value: "thriller", label: "스릴러 / 서스펜스" },
    { value: "horror", label: "공포 / 호러" },
    { value: "mystery", label: "미스터리 / 추리" },
    { value: "sci-fi", label: "SF / 미래형 세계관" },
    { value: "fantasy", label: "무협 / 판타지" },
    { value: "history", label: "역사 / 사극 (픽션 드라마)" },
    { value: "action", label: "액션 / 느와르" },
    { value: "comedy", label: "코미디 / 시트콤" },
    { value: "family", label: "가족 / 휴먼 드라마" },
    { value: "fairytale", label: "어린이 창작 동화 / 애니메이션" },
    { value: "anecdote", label: "썰툰 / 사연 기반 재연 (웹툰형)" },
    { value: "music-video", label: "세계관 뮤직비디오 스토리" },
  ];

  const narrationTopics = [
    { value: "it-review", label: "IT 기기 / 테크 리뷰" },
    { value: "car-review", label: "자동차 / 모빌리티 리뷰" },
    { value: "finance", label: "경제 / 주식 / 재테크 분석" },
    { value: "real-estate", label: "부동산 / 임장 정보" },
    { value: "news-politics", label: "시사 / 정치 / 이슈 분석" },
    { value: "history-doc", label: "역사 방구석 다큐멘터리 / 지식" },
    { value: "science-space", label: "우주 / 과학 교양" },
    { value: "mystery-doc", label: "미제 사건 / 사건 사고 다큐" },
    { value: "movie-review", label: "영화 / 드라마 리뷰 및 요약" },
    { value: "book-review", label: "책 리뷰 / 문학 요약" },
    { value: "vlog", label: "일상 브이로그 / 여행기 해설" },
    { value: "cooking", label: "요리 / 레시피 해설" },
    { value: "health", label: "건강 / 의학 정보" },
    { value: "motivation", label: "동기부여 / 자기계발" },
  ];

  const currentTopics = videoFormat === 'drama' ? storyTopics : narrationTopics;

  return (
    <div className="flex h-full w-full flex-col items-center bg-gray-50 overflow-y-auto">
      <div className="w-full max-w-5xl p-8 mt-12 mb-20">
        {/* 헤더 영역 */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">어떤 종류의 영상을 만드시나요?</h2>
          <p className="text-gray-500 font-medium">제작하려는 콘텐츠의 성격에 맞춰 최적화된 AI 기획 엔진이 배정됩니다.</p>
        </div>

        {/* 1단계: 메인 트랙 선택 (거대한 카드 형태) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Track A: 이야기 */}
          <button
            onClick={() => setVideoFormat('drama')}
            className={`flex flex-col text-left p-8 rounded-2xl border-2 transition-all duration-200 ${videoFormat === 'drama'
              ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
              : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
              }`}
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className={`text-xl font-bold mb-2 ${videoFormat === 'drama' ? 'text-indigo-800' : 'text-slate-800'}`}>이야기 (Story)</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-4">
              다양한 등장인물들이 사건을 이끌어가는 서사 중심의 영상입니다. 캐릭터 간의 대화와 성격 묘사가 중요합니다.
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">역사 픽션</span>
              <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">단편 영화</span>
              <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">썰툰/괴담</span>
            </div>
          </button>

          {/* Track B: 정보/내레이션 */}
          <button
            onClick={() => setVideoFormat('narration')}
            className={`flex flex-col text-left p-8 rounded-2xl border-2 transition-all duration-200 ${videoFormat === 'narration'
              ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100'
              : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
              }`}
          >
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className={`text-xl font-bold mb-2 ${videoFormat === 'narration' ? 'text-blue-800' : 'text-slate-800'}`}>정보 / 내레이션 (Info/Review)</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-4">
              시각 자료(B-Roll)와 함께 1인 해설자가 지식이나 상황을 전달하는 영상입니다.<br />
              <span className="text-blue-600 font-bold">* 캐릭터 대본 기획이 생략됩니다.</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-auto">
              <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">전자기기 리뷰</span>
              <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">주식/재테크</span>
              <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">지식/역사 다큐</span>
            </div>
          </button>
        </div>


        {/* 2단계: 세부 입력 폼 (선택된 트랙에 맞춤화) */}
        <Card className="border shadow-sm bg-white rounded-xl">
          <CardContent className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-2 antialiased">
              {videoFormat === 'drama' ? '장르 및 기획 의도 상세 설정' : '리뷰/정보 분석 상세 설정'}
            </h3>
            <p className="text-sm text-gray-500 mb-8 pb-4 border-b">
              선택하신 형식에 맞추어 인공지능이 최적의 대본을 작성할 수 있도록 힌트를 제공해주세요.
            </p>

            <div className="space-y-8">
              {/* 주제 및 기획 의도 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">핵심 주제 / 다룰 내용</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger className="w-full text-left font-normal bg-white h-11">
                    <SelectValue placeholder="카테고리를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentTopics.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                    <SelectItem value="custom">직접 입력하기</SelectItem>
                  </SelectContent>
                </Select>
                {topic === "custom" && (
                  <Textarea
                    placeholder={videoFormat === 'drama' ? "예) 인공지능이 세상을 지배하게 된 먼 미래를 배경으로 한 SF 액션 드라마" : "예) 2024년 새롭게 출시된 아이폰 16 Pro 맥스와 갤럭시 S24 울트라의 카메라 성능 비교 분석"}
                    className="min-h-[100px] bg-white resize-none mt-3"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                  />
                )}
              </div>

              {/* 타겟 시청자 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">타겟 시청자층</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger className="w-full text-left font-normal bg-white h-11">
                    <SelectValue placeholder="주요 시청자층을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teen">10대 (트렌디, 빠르고 숏폼 선호)</SelectItem>
                    <SelectItem value="twenties">2030세대 (재밌고 실용적인 내용)</SelectItem>
                    <SelectItem value="office">직장인 (공감대, 재테크, 정보 획득)</SelectItem>
                    <SelectItem value="parents">육아/주부 (공감, 생활 꿀팁, 교육)</SelectItem>
                    <SelectItem value="senior">시니어 (알기 쉬운 설명, 느린 템포, 건강/정보)</SelectItem>
                    <SelectItem value="all">전 연령층 (대중적인 콘텐츠)</SelectItem>
                    <SelectItem value="custom">직접 입력하기</SelectItem>
                  </SelectContent>
                </Select>
                {target === "custom" && (
                  <Input
                    placeholder="예) 최신 테크 기기에 관심이 많은 2030 얼리어답터"
                    className="bg-white mt-3 h-11"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                  />
                )}
              </div>

              {/* 톤앤매너 설정 */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">콘텐츠의 전체적인 톤앤매너</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-full text-left font-normal bg-white h-11">
                    <SelectValue placeholder="영상의 대사 톤과 해설 분위기를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">전문적이고 신뢰감 있는 (존댓말, 아나운서 톤)</SelectItem>
                    <SelectItem value="friendly">친근하고 편안한 (가벼운 존댓말, 옆집 형/누나 톤)</SelectItem>
                    <SelectItem value="humorous">유머러스하고 재치있는 (드립, 활기찬 톤)</SelectItem>
                    <SelectItem value="calm">차분하고 감성적인 (ASMR, 조용한 독백 톤)</SelectItem>
                    <SelectItem value="energetic">텐션이 높고 에너지 넘치는 (빠른 전개, 강한 억양)</SelectItem>
                    <SelectItem value="cinematic">긴장감 넘치고 시네마틱한 (묵직한 전개)</SelectItem>
                    <SelectItem value="custom">직접 입력하기</SelectItem>
                  </SelectContent>
                </Select>
                {tone === "custom" && (
                  <Input
                    placeholder="예) 다소 진지하지만 위트를 곁들인 MZ세대 감성의 톤"
                    className="bg-white mt-3 h-11"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                  />
                )}
              </div>

              {/* ----------------- 비주얼 연출 스타일 설정 부분 ----------------- */}
              <div className="pt-6 mt-6 border-t border-slate-100 space-y-8">
                <div className="mb-2">
                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-xl">🎬</span> 비주얼 연출 스타일 (전체 적용)
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">이 영상 전체에 적용될 기본적인 이미지 프롬프트(화풍, 조명, 구도) 기조를 설정합니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 화풍/스타일 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">핵심 화풍 (Visual Style)</Label>
                    <Select value={visualStyle} onValueChange={setVisualStyle}>
                      <SelectTrigger className="w-full bg-white h-11">
                        <SelectValue placeholder="화풍 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinematic">실사 시네마틱 (영화 같은)</SelectItem>
                        <SelectItem value="photorealistic">초현실주의 사진 (다큐멘터리)</SelectItem>
                        <SelectItem value="ghibli">지브리 애니메이션 스타일</SelectItem>
                        <SelectItem value="pixar">픽사 3D 애니메이션 스타일</SelectItem>
                        <SelectItem value="webtoon">한국식 고퀄리티 웹툰 스타일</SelectItem>
                        <SelectItem value="watercolor">수채화 / 동화책 일러스트</SelectItem>
                        <SelectItem value="cyberpunk">사이버펑크 / 네온 스타일</SelectItem>
                        <SelectItem value="vintage">빈티지 레트로 필름 카메라</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 카메라 구도 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">기본 카메라 무빙 (Camera)</Label>
                    <Select value={cameraAngle} onValueChange={setCameraAngle}>
                      <SelectTrigger className="w-full bg-white h-11">
                        <SelectValue placeholder="구도/렌즈 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dynamic">다이내믹 앵글 (역동적이고 꽉 찬 화면)</SelectItem>
                        <SelectItem value="wide">울트라 와이드 샷 (배경 묘사 중심)</SelectItem>
                        <SelectItem value="closeup">익스트림 클로즈업 (표정과 감정선 중심)</SelectItem>
                        <SelectItem value="drone">드론 샷 / 조감도 (스케일감)</SelectItem>
                        <SelectItem value="handheld">핸드헬드 샷 (유튜브 VLOG, 현장감)</SelectItem>
                        <SelectItem value="lowangle">로우 앵글 (인물을 웅장하게)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 조명 설정 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">메인 조명 (Lighting)</Label>
                    <Select value={lighting} onValueChange={setLighting}>
                      <SelectTrigger className="w-full bg-white h-11">
                        <SelectValue placeholder="조명 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dramatic">드라마틱 조명 (대비가 강한 영화 조명)</SelectItem>
                        <SelectItem value="natural">자연광 (따뜻하고 사실적인 태양빛)</SelectItem>
                        <SelectItem value="neon">네온 조명 (사이버펑크, 미래지향적)</SelectItem>
                        <SelectItem value="moody">무디/로우키 (어둡고 무거운 분위기)</SelectItem>
                        <SelectItem value="soft">소프트 조명 (부드럽고 몽환적인)</SelectItem>
                        <SelectItem value="golden_hour">골든 아워 (따뜻한 노을빛)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

            </div>

            {/* 하단 버튼 블록 */}
            <div className="mt-10 pt-6 border-t flex justify-end gap-3">
              <Button variant="outline" className="w-[120px] font-bold text-slate-600 hover:text-slate-900" onClick={handleReset}>
                모두 지우기
              </Button>
              <Button
                className="w-[240px] bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-md shadow-slate-900/20 h-11"
                onClick={handleNextStep}
                disabled={
                  (!topic || (topic === "custom" && !customTopic)) ||
                  (!target || (target === "custom" && !customTarget)) ||
                  (!tone || (tone === "custom" && !customTone))
                }
              >
                다음 단계로 ({videoFormat === 'narration' ? '시놉시스 기획' : '시놉시스 기획'}) &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
