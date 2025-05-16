export default function formatCount(count: number): string {
    if (count >= 1000000) {
      const m = count / 1000000;
      return `${Number(m.toFixed(1))}M+`;
    } else if (count >= 1000) {
      const k = count / 1000;
      return `${Number(k.toFixed(1))}K+`;
    } else {
      return `${count}`;
    }
  }
  