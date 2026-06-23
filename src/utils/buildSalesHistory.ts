export function buildSalesHistory(card: { id: number; marketAvg: number; low: number; high: number }) {
  const points = [];
  const base = card.marketAvg || 100000;
  const minLimit = card.low || Math.round(base * 0.85);
  const maxLimit = card.high || Math.round(base * 1.15);

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const wave = Math.sin((30 - i + card.id) / 3.2) * 0.055;
    const secondaryWave = Math.cos((30 - i + card.id) / 5.1) * 0.035;
    const trend = ((30 - i) / 30 - 0.5) * 0.06;
    const rawPrice = base * (1 + wave + secondaryWave + trend);

    const price = Math.min(
      maxLimit,
      Math.max(minLimit, Math.round(rawPrice / 1000) * 1000)
    );

    points.push({
      fecha: date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
      }),
      precio: price,
    });
  }

  return points;
}
