'use client';

export default function AnswerButton({
  label,
  onClick,
  disabled,
  state
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  state?: 'default' | 'correct' | 'wrong';
}) {
  const stateClasses = {
    default: 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-amber-500',
    correct: 'bg-green-50 border-green-500 text-green-700',
    wrong: 'bg-red-50 border-red-500 text-red-700'
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-xl border-2 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${state ? stateClasses[state] : stateClasses.default}
      `}
    >
      {label}
    </button>
  );
}
