import { useMemo, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Metric } from '../components/Metric';
import { money } from '../utils/money';
import { getCommissionValue, getCommissionLabel } from '../utils/commissions';

function TransactionTableRow({ transaction, onView }) {
  const isSale = transaction.type === 'Venta';
  const commissionRate = isSale
    ? getCommissionLabel(transaction.gross)
    : 'No aplica';
  const commissionValue = isSale ? getCommissionValue(transaction.gross) : 0;
  const netValue = isSale
    ? transaction.gross - commissionValue
    : transaction.gross;

  const statusStyle =
    transaction.status === 'Recibido' ||
    transaction.status === 'Desembolsado' ||
    transaction.status === 'Desembolsado a cuenta' ||
    transaction.status === 'Saldo en plataforma'
      ? 'bg-green-100 text-green-800'
      : transaction.status === 'Pago protegido'
      ? 'bg-blue-100 text-blue-700'
      : transaction.status === 'Caso abierto'
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <tr className="align-middle hover:bg-slate-50 transition">
      <td className="px-2.5 py-3 whitespace-nowrap text-slate-600">
        {transaction.date}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap font-bold text-slate-500">
        {transaction.id}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
            isSale
              ? 'bg-yellow-100 text-slate-900'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {transaction.type}
        </span>
      </td>
      <td className="px-2.5 py-3 min-w-[180px] max-w-[220px]">
        <p className="font-black text-slate-900 leading-tight">
          {transaction.product}
        </p>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-slate-700">
        {transaction.counterpart}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-right font-black text-slate-900">
        {money(transaction.gross)}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-center">
        <span
          className={isSale ? 'font-black text-blue-700' : 'text-slate-400'}
        >
          {commissionRate}
        </span>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-right">
        <span className={isSale ? 'font-black text-red-600' : 'text-slate-400'}>
          {isSale ? `- ${money(commissionValue)}` : 'No aplica'}
        </span>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap text-right font-black text-blue-700">
        {money(netValue)}
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle}`}
        >
          {transaction.status}
        </span>
      </td>
      <td className="px-2.5 py-3 whitespace-nowrap">
        <button
          onClick={() => onView(transaction)}
          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black flex items-center gap-1"
        >
          <Eye size={12} /> Ver detalle
        </button>
      </td>
    </tr>
  );
}

export function HistoryPage({
  transactions,
  setTransactions,
  setPage,
  setSelectedTransaction,
}) {
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchText, setSearchText] = useState('');

  function clearFilters() {
    setTypeFilter('Todos');
    setStartDate('');
    setEndDate('');
    setSearchText('');
  }

  function viewTransaction(transaction) {
    setSelectedTransaction(transaction);
    setPage('transactionDetail');
  }

  const filteredTransactions = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return transactions.filter((transaction) => {
      const matchesType =
        typeFilter === 'Todos' || transaction.type === typeFilter;
      const matchesStart = !startDate || transaction.date >= startDate;
      const matchesEnd = !endDate || transaction.date <= endDate;
      const matchesSearch =
        !q ||
        `${transaction.product} ${transaction.counterpart} ${transaction.id}`
          .toLowerCase()
          .includes(q);
      return matchesType && matchesStart && matchesEnd && matchesSearch;
    });
  }, [transactions, typeFilter, startDate, endDate, searchText]);

  const totalPurchases = filteredTransactions
    .filter((transaction) => transaction.type === 'Compra')
    .reduce((sum, transaction) => sum + transaction.gross, 0);
  const totalSales = filteredTransactions
    .filter((transaction) => transaction.type === 'Venta')
    .reduce((sum, transaction) => sum + transaction.gross, 0);
  const totalCommissions = filteredTransactions
    .filter((transaction) => transaction.type === 'Venta')
    .reduce(
      (sum, transaction) => sum + getCommissionValue(transaction.gross),
      0
    );
  const netSales = totalSales - totalCommissions;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Historial de transacciones
          </h2>
          <p className="text-slate-600">
            Consulta compras y ventas. Ingresa al detalle de cada transacción
            para gestionar acciones.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Metric label="Compras filtradas" value={money(totalPurchases)} />
        <Metric label="Ventas brutas filtradas" value={money(totalSales)} />
        <Metric label="Comisión plataforma" value={money(totalCommissions)} />
        <Metric label="Ventas netas" value={money(netSales)} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm mb-5">
        <div className="grid lg:grid-cols-[150px_150px_150px_1fr_130px] gap-3 items-end">
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-2 w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option>Todos</option>
              <option>Compra</option>
              <option>Venta</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 uppercase">
              Buscar producto o vendedor
            </label>
            <div className="mt-2 flex items-center gap-2 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-blue-500">
              <Search size={18} className="text-blue-600" />
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Ej: Charizard, Golden Collector, T-001"
                className="w-full outline-none text-sm"
              />
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-black"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Detalle de transacciones
            </h3>
            <p className="text-xs text-slate-500">
              Haz clic en "Ver detalle" para confirmar recibido, abrir un caso o
              gestionar desembolsos.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black">
            {filteredTransactions.length} transacciones
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-[11px] text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                <th className="px-2.5 py-3 whitespace-nowrap">Fecha</th>
                <th className="px-2.5 py-3 whitespace-nowrap">ID</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Tipo</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Producto</th>
                <th className="px-2.5 py-3 whitespace-nowrap">
                  Vendedor / Comprador
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-right">
                  Valor
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-center">
                  % comisión
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-right">
                  Comisión
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap text-right">
                  Neto
                </th>
                <th className="px-2.5 py-3 whitespace-nowrap">Estado</th>
                <th className="px-2.5 py-3 whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionTableRow
                    key={transaction.id}
                    transaction={transaction}
                    onView={viewTransaction}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-3 py-8 text-center text-slate-500"
                  >
                    No se encontraron transacciones con los filtros
                    seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
