import { Layout } from '../components/Layout';
import { money } from '../utils/money';
import { getCommissionValue, getCommissionLabel } from '../utils/commissions';

export function CommissionPage() {
  const examples = [72000, 210000, 365000];
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Comisiones de la plataforma
          </h2>
          <p className="text-slate-600">
            La comisión se descuenta únicamente al vendedor cuando la venta se
            completa y el pago puede ser desembolsado.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas entre</p>
          <h3 className="text-xl font-black text-slate-950 mt-1">
            $0 y $100.000
          </h3>
          <p className="text-4xl font-black text-blue-700 mt-4">8%</p>
          <p className="text-sm text-slate-500 mt-2">
            Ideal para cartas de menor valor.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas entre</p>
          <h3 className="text-xl font-black text-slate-950 mt-1">
            $100.001 y $300.000
          </h3>
          <p className="text-4xl font-black text-blue-700 mt-4">6%</p>
          <p className="text-sm text-slate-500 mt-2">
            Para cartas y productos de valor medio.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Ventas superiores a</p>
          <h3 className="text-xl font-black text-slate-950 mt-1">$300.000</h3>
          <p className="text-4xl font-black text-blue-700 mt-4">4%</p>
          <p className="text-sm text-slate-500 mt-2">
            Pensado para ventas de alto valor.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-2xl font-black text-slate-950 mb-4">
          Ejemplos de cálculo
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {examples.map((value) => {
            const commission = getCommissionValue(value);
            return (
              <div
                key={value}
                className="rounded-2xl bg-slate-50 p-4 border border-slate-100"
              >
                <p className="text-sm text-slate-500">Valor de venta</p>
                <p className="font-black text-slate-950">{money(value)}</p>
                <p className="text-sm text-slate-500 mt-3">
                  Comisión plataforma ({getCommissionLabel(value)})
                </p>
                <p className="font-black text-red-600">- {money(commission)}</p>
                <p className="text-sm text-slate-500 mt-3">Neto vendedor</p>
                <p className="font-black text-blue-700">
                  {money(value - commission)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
