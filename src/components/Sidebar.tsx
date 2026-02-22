"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  FileText,
  BookOpen,
  Type,
  Video,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Settings,
  Globe,
  Youtube
} from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: '기본 설정', href: '/', icon: FileText },
    { name: '스토리 대본', href: '/story-script', icon: BookOpen },
    { name: '제목/내용 생성', href: '/title-content', icon: Type },
    { name: '영상 제작', href: '/video-creation', icon: Video },
    { name: '썸네일 제작', href: '/thumbnail-creation', icon: ImageIcon },
    { name: '비주얼 프롬프트', href: '/visual-prompt', icon: Sparkles },
    { name: '유튜브 업로드', href: '/youtube-upload', icon: Youtube },
  ];

  return (
    <div className="w-[280px] h-screen bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
      {/* 최상단 로고 */}
      <div className="p-6">
        <h1 className="text-white font-bold text-xl tracking-tight">KIKUKE'S STUDIO</h1>
      </div>

      {/* 메뉴 그룹 */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-600 text-white rounded-lg shadow-sm'
                : 'hover:bg-slate-800 hover:text-white rounded-lg'
                }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 최하단 고정 버튼 영역 */}
      <div className="p-4 space-y-3 mt-auto border-t border-slate-800">
        <button className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          <ExternalLink className="w-4 h-4" />
          새 창 열기
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Settings className="w-4 h-4" />
          설정
        </button>
        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Globe className="w-4 h-4" />
          브라우저로 열기
        </button>

        {/* 버전 정보 */}
        <div className="text-center text-xs text-slate-500 pt-2 pb-1">
          v1.2.1
        </div>
      </div>
    </div>
  );
}
