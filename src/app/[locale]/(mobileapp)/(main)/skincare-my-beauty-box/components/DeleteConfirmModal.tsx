'use client';

const text = {
  ko: {
    title: '제품 삭제',
    message: '"{name}"을(를) My Beauty Box에서 삭제하시겠습니까?',
    cancel: '취소',
    delete: '삭제',
    deleting: '삭제 중...',
  },
  en: {
    title: 'Delete Product',
    message: 'Remove "{name}" from My Beauty Box?',
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting...',
  },
};

interface DeleteConfirmModalProps {
  locale: string;
  productName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  locale,
  productName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const t = text[locale as keyof typeof text] || text.en;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600 mb-6">
          {t.message.replace('{name}', productName)}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? t.deleting : t.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
