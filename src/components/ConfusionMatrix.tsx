interface ConfusionMatrixProps {
  matrix: number[][];
  labels?: string[];
}

export default function ConfusionMatrix({
  matrix,
  labels = ['Cattle', 'Buffalo'],
}: ConfusionMatrixProps) {
  const max = matrix.flat().reduce((m, v) => Math.max(m, v), 0) || 1;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[280px] border-collapse text-center text-sm">
        <thead>
          <tr>
            <th className="px-4 pb-2" />
            <th colSpan={labels.length} className="input-label pb-2">
              Predicted
            </th>
          </tr>
          <tr>
            <th />
            {labels.map((l) => (
              <th
                key={l}
                className="px-4 pb-3 font-700 text-brand-800"
              >
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th className="pr-4 text-right font-700 text-brand-800">
                {labels[i]}
              </th>
              {row.map((v, j) => {
                const intensity = v / max;
                const correct = i === j;
                return (
                  <td key={j} className="px-2 py-2">
                    <div
                      className={`flex h-20 w-28 items-center justify-center rounded-xl text-xl font-800 tabular-nums transition-all ${
                        correct
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                      style={{
                        opacity: 0.35 + intensity * 0.65,
                      }}
                    >
                      {v}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
