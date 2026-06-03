export interface ApiErrorShape {
  message?: string;
  code?: number;
  error_subcode?: number;
  type?: string;
}

export function getFriendlyApiError(error: ApiErrorShape | string | unknown): string {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object') {
    const candidate = error as ApiErrorShape;

    if (candidate.code === 10 && candidate.error_subcode === 2332002) {
      return 'Ứng dụng Meta chưa được cấp quyền Ads Library API. Token hợp lệ nhưng app chưa có quyền gọi /ads_archive.';
    }

    if (candidate.message) return candidate.message;
  }

  return 'Không thể tải dữ liệu. Vui lòng kiểm tra cấu hình và thử lại.';
}
