import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardBasicProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  className?: string;
}

const CardBasic = React.forwardRef<HTMLDivElement, CardBasicProps>(
  ({ title, subtitle, className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "w-82 h-16 min-h-16 py-5 px-4 gap-4 rounded-lg border border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md",
          className
        )}
        style={{
          boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
          borderColor: '#E5E7EB'
        }}
        {...props}
      >
        <div className="flex flex-col gap-1">
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
      </Card>
    );
  }
);

CardBasic.displayName = 'CardBasic';

export default CardBasic;