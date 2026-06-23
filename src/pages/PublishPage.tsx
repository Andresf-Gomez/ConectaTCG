import { useState } from 'react';
import { PlusCircle, Upload } from 'lucide-react';
import { Layout } from '../components/Layout';
import { PriceBox } from '../components/PriceBox';
import { cards } from '../data/cards';
import { money } from '../utils/money';

export function PublishPage({ setPage }: { setPage: (page: string) => void }) {
  const publishExpansions = Array.from(new Set(cards.map((c) => c.set)));
  const languageOptions = ['Español', 'Inglés', 'Japonés', 'Portugués'];
  const singleConditionOptions = [
    'Near Mint',
    'Excellent',
    'Light Played',
    'Played',
    'Damaged',
  ];
  const sealedConditionOptions = [
    'Sellado nuevo',
    'Sellado con desgaste leve',
    'Sellado con golpe en caja',
    'Sellado con plástico abierto',
    'Producto abierto / incompleto',
  ];

  const [selectedType, setSelectedType] = useState('Carta single');
  const [selectedExpansion, setSelectedExpansion] = useState(cards[0].set);
  const [selectedCard, setSelectedCard] = useState(cards[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(cards[0].language || 'Español');
  const [selectedCondition, setSelectedCondition] = useState('Near Mint');
  const [price, setPrice] = useState(cards[0].marketAvg);

  const filteredPublishCards = cards.filter(
    (c) => c.set === selectedExpansion && c.type === selectedType
  );
  const conditionOptions =
    selectedType === 'Producto sellado' ? sealedConditionOptions : singleConditionOptions;

  function applyCard(card: typeof cards[number]) {
    setSelectedCard(card);
    setSelectedType(card.type);
    setSelectedLanguage(card.language || 'Español');
    setSelectedCondition(
      card.type === 'Producto sellado' ? 'Sellado nuevo' : 'Near Mint'
    );
    setPrice(card.marketAvg);
  }

  function changeType(type: string) {
    setSelectedType(type);
    const firstCard =
      cards.find((c) => c.type === type && c.set === selectedExpansion) ||
      cards.find((c) => c.type === type) ||
      cards[0];
    setSelectedExpansion(firstCard.set);
    applyCard(firstCard);
  }

  function changeExpansion(expansion: string) {
    setSelectedExpansion(expansion);
    const firstCard =
      cards.find((c) => c.set === expansion && c.type === selectedType) ||
      cards.find((c) => c.set === expansion) ||
      cards[0];
    applyCard(firstCard);
  }

  function changeCard(id: string) {
    const c = cards.find((x) => x.id === Number(id));
    if (!c) return;
    applyCard(c);
  }

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-950">
            Publicar producto
          </h2>
          <p className="text-slate-600">
            Selecciona la expansión, el producto, idioma, estado y precio de venta.
          </p>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-4">
            Información de publicación
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700">
                Tipo de producto
              </label>
              <select
                value={selectedType}
                onChange={(e) => changeType(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                <option>Carta single</option>
                <option>Producto sellado</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Expansión / set
              </label>
              <select
                value={selectedExpansion}
                onChange={(e) => changeExpansion(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {publishExpansions.map((expansion) => (
                  <option key={expansion} value={expansion}>
                    {expansion}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Primero selecciona la expansión para limitar las cartas o productos disponibles.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Buscar carta o producto
              </label>
              <select
                value={selectedCard.id}
                onChange={(e) => changeCard(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {filteredPublishCards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.set}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Idioma</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {languageOptions.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Estado</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              >
                {conditionOptions.map((condition) => (
                  <option key={condition}>{condition}</option>
                ))}
              </select>
              {selectedType === 'Producto sellado' && (
                <p className="text-xs text-slate-400 mt-1">
                  Para producto sellado se valida si está nuevo, con desgaste, golpe,
                  plástico abierto o incompleto.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">
                Precio de venta
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-2 w-full border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Fotos</label>
              <div className="mt-2 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50">
                <PlusCircle className="mx-auto text-blue-600 mb-2" />
                <p className="font-bold text-slate-800">
                  Subir fotos del producto
                </p>
                <p className="text-sm text-slate-500">
                  {selectedType === 'Producto sellado'
                    ? 'Frente, laterales, esquinas, sello/plástico y detalle de caja.'
                    : 'Frente, reverso, esquinas y detalle de estado.'}
                </p>
              </div>
            </div>
            <textarea
              className="border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-500"
              placeholder="Observaciones sobre estado, envío o condiciones"
            />
          </div>
        </div>
        <div className="space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-slate-950 text-xl">
              Referencia de precio
            </h3>
            <div className="flex gap-4 mt-4">
              <img
                src={selectedCard.image}
                className="w-20 rounded-xl bg-slate-50 object-contain"
              />
              <div>
                <p className="font-black">{selectedCard.name}</p>
                <p className="text-sm text-slate-500">{selectedCard.set}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedType} · {selectedLanguage}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <PriceBox label="Bajo" value={money(selectedCard.low)} />
              <PriceBox
                label="Promedio"
                value={money(selectedCard.marketAvg)}
                highlight
              />
              <PriceBox label="Alto" value={money(selectedCard.high)} />
            </div>
            <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <p className="font-black text-slate-900">Precio sugerido</p>
              <p className="text-2xl font-black text-blue-700">
                {money(selectedCard.marketAvg)}
              </p>
              <p className="text-sm text-slate-600">
                Basado en historial de publicaciones y ventas recientes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPage('publishSuccess')}
            className="w-full px-5 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 font-black text-slate-900 flex items-center justify-center gap-2"
          >
            <Upload size={20} /> Publicar producto
          </button>
        </div>
      </div>
    </Layout>
  );
}
