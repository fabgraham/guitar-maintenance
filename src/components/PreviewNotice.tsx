import { isLocalPreview } from '@/utils/preview';

export function PreviewNotice() {
  if (!isLocalPreview) return null;
  return (
    <div className="preview-notice" role="status">
      <strong>Local preview</strong>
      <span>Sample data · changes are saved only in this browser.</span>
    </div>
  );
}
