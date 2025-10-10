import { tTooltip, TooltipKey } from '@/i18n/tooltips';
type Props = { locale: 'en' | 'ko'; kind: TooltipKey };


export default function TooltipInfo({ locale, kind }: Props) {
  const data = tTooltip(locale, kind);
  return (
    <div className="space-y-2 max-w-sm">
      <h4 className="font-semibold">{data.title}</h4>
      <p className="text-sm">{data.summary}</p>
      <p className="text-sm text-gray-600 whitespace-pre-line">{data.detail}</p>
      {data.examples?.length ? (
        <ul className="list-disc pl-5 text-sm text-gray-600">
          {locale === 'ko' ? '예시: ' : 'ex: '} {data.examples.map((ex, i) => <li key={i}>{ex}</li>)}
        </ul>
      ) : null}
    </div>
  );
}
