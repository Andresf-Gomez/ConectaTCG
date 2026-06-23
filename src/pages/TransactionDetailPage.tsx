import { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, WalletCards } from 'lucide-react';
import { Layout } from '../components/Layout';
import { PriceBox } from '../components/PriceBox';
import { cards, type Transaction } from '../data/cards';
import { money } from '../utils/money';
import { getCommissionValue, getCommissionLabel } from '../utils/commissions';

export function TransactionDetailPage({
  transaction,
  setPage,
  setTransactions,
  setSelectedTransaction,
}: {
  transaction: Transaction;
  setPage: (page: string) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setSelectedTransaction: (t: Transaction) => void;
}) {
  const [message, setMessage] = useState('');

  if (!transaction) {
    return (
      <Layout>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
          <p className="text-xl font-black text-slate-950">
            No hay una transacción seleccionada
          </p>
          <button
            onClick={() => setPage('history')}
            className="mt-5 px-5 py-3 rounded-2xl bg-blue-600 text-white font-black"
          >
            Volver al historial
          </button>
        </div>
      </Layout>
    );
  }

  const isSale = transaction.type === 'Venta';
  const isPurchase = transaction.type === 'Compra';
  const commissionValue = isSale ? getCommissionValue(transaction.gross) : 0;
  const commissionRate = isSale
    ? getCommissionLabel(transaction.gross)
    : 'No aplica';
  const netValue = isSale
    ? transaction.gross - commissionValue
    : transaction.gross;
  const relatedCard = cards.find((card) => card.name === transaction.product);

  function updateSelectedTransaction(nextValues: Partial<Transaction>, userMessage: string) {
    const updatedTransaction = { ...transaction, ...nextValues };
    setTransactions((currentTransactions) =>
      currentTransactions.map((item) =>
        item.id === transaction.id ? updatedTransaction : item
      )
    );
    setSelectedTransaction(updatedTransaction);
    setMessage(userMessage);
  }

  function confirmReceived() {
    updateSelectedTransaction(
      {
        status: 'Recibido',
        releaseMessage:
          'Recepción confirmada. El pago protegido será desembolsado al vendedor.',
      },
      'Recepción confirmada. El pago protegido será desembolsado al vendedor.'
    );
  }

  function openResolutionCase() {
    updateSelectedTransaction(
      {
        status: 'Caso abierto',
        releaseMessage:
          'Solicitud abierta. La plataforma contactará al vendedor para verificar la información de envío y resolver el caso.',
      },
      `Caso abierto. La plataforma contactará a ${transaction.counterpart} para verificar la información de envío y resolver la solicitud.`
    );
  }

  function payoutToBank() {
    updateSelectedTransaction(
      {
        status: 'Desembolsado a cuenta',
        payoutMethod: 'Cuenta bancaria',
        releaseMessage:
          'El dinero neto fue enviado a la cuenta bancaria registrada.',
      },
      `Desembolso solicitado por ${money(
        netValue
      )} a tu cuenta bancaria registrada.`
    );
  }

  function payoutToBalance() {
    updateSelectedTransaction(
      {
        status: 'Saldo en plataforma',
        payoutMethod: 'Saldo de plataforma',
        releaseMessage:
          'El dinero neto quedó disponible como saldo dentro de la plataforma.',
      },
      `El valor neto de ${money(
        netValue
      )} quedó disponible como saldo en la plataforma.`
    );
  }

  const canManagePurchase =
    isPurchase && transaction.status === 'Pago protegido';
  const canManageSale =
    isSale &&
    !['Desembolsado', 'Desembolsado a cuenta', 'Saldo en plataforma'].includes(
      transaction.status
    );

  return (
    <Layout>
      <button
        onClick={() => setPage('history')}
        className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700"
      >
        <ArrowLeft size={18} /> Volver al historial
      </button>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${
                    isSale
                      ? 'bg-yellow-100 text-slate-900'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {transaction.type}
                </span>
                <h2 className="text-3xl font-black text-slate-950 mt-3">
                  {transaction.product}
                </h2>
                <p className="text-slate-500 mt-1">
                  Transacción {transaction.id} · {transaction.date}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                {transaction.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">
                  {isSale ? 'Comprador' : 'Vendedor'}
                </p>
                <p className="font-black text-slate-950">
                  {transaction.counterpart}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">
                  Valor de la transacción
                </p>
                <p className="font-black text-blue-700 text-xl">
                  {money(transaction.gross)}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">Estado actual</p>
                <p className="font-black text-slate-950">
                  {transaction.status}
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500">Método de envío</p>
                <p className="font-black text-slate-950">
                  Servientrega / Coordinadora
                </p>
              </div>
            </div>

            {transaction.releaseMessage && (
              <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="font-black text-slate-900">
                  Última actualización
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {transaction.releaseMessage}
                </p>
              </div>
            )}
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-5 flex items-start gap-3">
              <CheckCircle2 className="text-green-700 shrink-0" size={24} />
              <div>
                <p className="font-black text-green-800">Acción realizada</p>
                <p className="text-sm text-green-700 mt-1">{message}</p>
              </div>
            </div>
          )}

          {isPurchase && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-2xl font-black text-slate-950">
                Gestión de compra
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Si recibiste el producto en buen estado, confirma la recepción
                para liberar el pago al vendedor. Si no lo recibiste, abre un
                caso para que la plataforma verifique la información de envío.
              </p>
              {canManagePurchase ? (
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={confirmReceived}
                    className="px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} /> Confirmar recibido
                  </button>
                  <button
                    onClick={openResolutionCase}
                    className="px-5 py-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-black flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={20} /> No recibido / abrir caso
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-sm font-bold text-slate-500">
                  Esta compra ya no tiene acciones pendientes según su estado
                  actual.
                </p>
              )}
            </div>
          )}

          {isSale && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-2xl font-black text-slate-950">
                Gestión de venta
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Selecciona cómo quieres recibir el valor neto de la venta
                después del descuento de comisión de la plataforma.
              </p>
              <div className="grid sm:grid-cols-3 gap-3 mt-5">
                <PriceBox
                  label="Valor venta"
                  value={money(transaction.gross)}
                />
                <PriceBox
                  label={`Comisión (${commissionRate})`}
                  value={`- ${money(commissionValue)}`}
                />
                <PriceBox
                  label="Neto vendedor"
                  value={money(netValue)}
                  highlight
                />
              </div>
              {canManageSale ? (
                <div className="grid sm:grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={payoutToBank}
                    className="px-5 py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black flex items-center justify-center gap-2"
                  >
                    <WalletCards size={20} /> Desembolsar a mi cuenta
                  </button>
                  <button
                    onClick={payoutToBalance}
                    className="px-5 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2"
                  >
                    <WalletCards size={20} /> Dejar como saldo
                  </button>
                </div>
              ) : (
                <p className="mt-5 text-sm font-bold text-slate-500">
                  Esta venta ya fue gestionada:{' '}
                  {transaction.payoutMethod || transaction.status}.
                </p>
              )}
            </div>
          )}
        </div>

        <aside className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm h-fit">
          <h3 className="text-xl font-black text-slate-950 mb-4">
            Resumen visual
          </h3>
          {relatedCard ? (
            <div>
              <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-3xl p-5 flex items-center justify-center h-64">
                <img
                  src={relatedCard.image}
                  className="max-h-full object-contain"
                />
              </div>
              <p className="font-black text-slate-950 mt-4">
                {relatedCard.name}
              </p>
              <p className="text-sm text-slate-500">
                {relatedCard.set} · {relatedCard.type}
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-6 text-center text-slate-500">
              Sin imagen asociada
            </div>
          )}

          <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <p className="font-black text-slate-900">Regla de protección</p>
            <p className="text-sm text-slate-600 mt-1">
              Si el comprador no confirma ni abre caso en 10 días calendario, la
              compra se entenderá como recibida.
            </p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
