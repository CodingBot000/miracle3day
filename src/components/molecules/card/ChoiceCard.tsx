import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ChoiceMode = 'single' | 'multi';

interface ChoiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  selected: boolean;
  mode: ChoiceMode;          // 'single' | 'multi'
  onSelect?: () => void;
  disabled?: boolean;
  // 멀티는 좌측 동그라미 항상 보이도록, 싱글은 기본 false (디자인 가이드에 따라 조절)
  showIndicator?: boolean;   
}

const SelectionDot: React.FC<{ checked: boolean; disabled?: boolean }> = ({ checked, disabled }) => {
  return (
    <span
      aria-hidden
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: '20px',
        height: '20px',
        border: '1px solid #D6D6D6'
      }}
    >
      {checked && !disabled && (
        <span
          className="rounded-full"
          style={{
            width: '12px',
            height: '12px',
            background: '#FB718F'
          }}
        />
      )}
    </span>
  );
};

export const ChoiceCard = React.forwardRef<HTMLDivElement, ChoiceCardProps>(
  ({ title, subtitle, selected, mode, onSelect, disabled, showIndicator, className, children, ...props }, ref) => {
    const role = mode === 'multi' ? 'checkbox' : 'radio';
    const indicatorVisible = showIndicator ?? (mode === 'multi'); // 멀티 기본 표시

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect?.();
      }
    };

    return (
      <Card
        ref={ref}
        role={role}
        aria-checked={selected}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onSelect?.()}
        onKeyDown={handleKeyDown}
        data-selected={selected ? '' : undefined}
          className={cn(
          // 가득 채우고 세로 패딩만 유지
          'w-full py-5 px-4 rounded-lg border cursor-pointer transition-all duration-200 bg-white',
          
          selected
            ? 'border-rose-400 shadow-md'
            : 'border-gray-300 hover:border-rose-300 hover:shadow-md',
          disabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        // className={cn(
        //   'cursor-pointer transition-all duration-200 rounded-lg border',
        //   disabled && 'opacity-60 cursor-not-allowed',
        //   className
        // )}
        // style={{
        //   width: '328px',
        //   height: '89px',
        //   padding: '20px 16px',
        //   borderRadius: '8px',
        //   borderWidth: '1px',
        //   borderColor: selected ? '#FB718F' : '#E5E7EB',
        //   boxShadow: '0px 1px 2px 0px #0000000D',
        //   backgroundColor: '#FFFFFF'
        // }}
        {...props}
      >
        <div className="flex items-center" style={{ gap: '16px' }}>
          {indicatorVisible && <SelectionDot checked={selected} disabled={disabled} />}

          <div className={`flex flex-col ${subtitle ? 'gap-1' : 'justify-center'}`}>
            <h3
              className="font-medium"
              style={{
                fontFamily: 'Pretendard Variable',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '100%',
                color: '#1C1C1C'
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  fontFamily: 'Pretendard Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '120%',
                  color: '#4B5563'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </Card>
    );
  }
);
ChoiceCard.displayName = 'ChoiceCard';
