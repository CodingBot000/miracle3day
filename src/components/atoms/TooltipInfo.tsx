'use client';

import { useTranslations } from 'next-intl';

export type TooltipKey = 'primary' | 'alternative' | 'combo';
type Props = { kind: TooltipKey };

export default function TooltipInfo({ kind }: Props) {
  const t = useTranslations('Tooltips');
  const tCommon = useTranslations('Common');

  const title = t(`${kind}.title`);
  const summary = t(`${kind}.summary`);
  const detail = t(`${kind}.detail`);
  const examples = t.raw(`${kind}.examples`) as string[] | undefined;

  return (
    <div className="space-y-2 max-w-sm">
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm">{summary}</p>
      <p className="text-sm text-gray-600 whitespace-pre-line">{detail}</p>
      {examples?.length ? (
        <ul className="list-disc pl-5 text-sm text-gray-600">
          {tCommon('exampleLabel')} {examples.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      ) : null}
    </div>
  );
}
