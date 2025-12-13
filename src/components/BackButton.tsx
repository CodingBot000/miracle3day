import { useNavigation } from '@/hooks/useNavigation';

interface BackButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const BackButton = ({ className = '', children }: BackButtonProps) => {
  const { goBack } = useNavigation();

  return (
    <button onClick={goBack} className={className}>
      {children || (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};
