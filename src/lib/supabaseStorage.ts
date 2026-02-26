/**
 * Supabase Storage 기반 이미지 저장소
 * base64 이미지를 Supabase Storage에 업로드하고 공개 URL을 반환합니다.
 * localStorage 용량 제한 없이 이미지를 영구 저장할 수 있습니다.
 */

import { supabase } from './supabase';

const BUCKET_NAME = 'project-images';

/** base64 문자열을 Blob으로 변환 */
function base64ToBlob(base64DataUrl: string): { blob: Blob; mimeType: string } {
    const [header, data] = base64DataUrl.split(',');
    const mimeType = header.match(/data:(.*?);/)?.[1] || 'image/png';
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i);
    }
    return { blob: new Blob([array], { type: mimeType }), mimeType };
}

/** 이미지를 Supabase Storage에 업로드하고 공개 URL 반환 */
export async function uploadImage(key: string, base64DataUrl: string): Promise<string> {
    try {
        const { blob, mimeType } = base64ToBlob(base64DataUrl);
        const ext = mimeType.split('/')[1] || 'png';
        const filePath = `${key}.${ext}`;

        // 기존 파일이 있으면 덮어쓰기
        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, blob, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            console.error('[Supabase] 업로드 실패:', error.message);
            throw error;
        }

        // 공개 URL 가져오기
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (e) {
        console.error('[Supabase] 이미지 업로드 에러:', e);
        // 업로드 실패 시 원본 base64를 그대로 반환 (fallback)
        return base64DataUrl;
    }
}

/** Supabase Storage에서 이미지 삭제 */
export async function deleteStorageImage(key: string): Promise<void> {
    try {
        // 확장자를 모를 수 있으므로 여러 확장자 시도
        const extensions = ['png', 'jpeg', 'webp'];
        const paths = extensions.map(ext => `${key}.${ext}`);

        await supabase.storage
            .from(BUCKET_NAME)
            .remove(paths);
    } catch (e) {
        console.warn('[Supabase] 이미지 삭제 실패:', e);
    }
}

/** Storage 버킷이 존재하는지 확인하고, 없으면 생성 시도 */
export async function ensureBucketExists(): Promise<boolean> {
    try {
        const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
        if (data) return true;

        if (error) {
            // 버킷이 없으면 생성 시도
            const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
                fileSizeLimit: 10 * 1024 * 1024, // 10MB
            });

            if (createError) {
                console.error('[Supabase] 버킷 생성 실패:', createError.message);
                return false;
            }
            return true;
        }
        return true;
    } catch (e) {
        console.error('[Supabase] 버킷 확인 실패:', e);
        return false;
    }
}
