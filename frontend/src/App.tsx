import { useCallback, useEffect, useMemo, useState } from 'react';

type Product = {
  productId: string;
  productCode: string;
  type: string;
  name: string;
  amount: number;
  availableInventory: number;
};

const apiBase = import.meta.env.VITE_PRODUCTS_API_URL?.trim().replace(/\/$/, '');

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    if (!apiBase) {
      setError('API URL is not configured. Set VITE_PRODUCTS_API_URL in your environment.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${apiBase}/products`);
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !Array.isArray((data as { items?: unknown }).items)) {
        throw new Error('The API returned an unexpected response.');
      }
      setProducts((data as { items: Product[] }).items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => [p.productCode, p.name, p.type, p.productId].some((v) => String(v ?? '').toLowerCase().includes(q)));
  }, [products, search]);

  return <main className="page">
    <header className="hero">
      <div><p className="eyebrow">CATALOGUE MANAGEMENT</p><h1>Product list</h1><p className="subtitle">Browse products and current inventory.</p></div>
      <button className="refresh" onClick={() => void loadProducts()} disabled={loading}>{loading ? 'Loading…' : '↻ Refresh'}</button>
    </header>
    <section className="summary" aria-label="Catalogue summary">
      <div className="metric"><span>Products loaded</span><strong>{products.length}</strong></div>
      <div className="metric"><span>Matching products</span><strong>{filtered.length}</strong></div>
    </section>
    <section className="catalogue">
      <div className="toolbar"><div><h2>All products</h2><p>Search by name, code, type or ID.</p></div><input aria-label="Search products" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      {loading && <p className="state" role="status">Loading product catalogue…</p>}
      {!loading && error && <div className="error" role="alert"><p>{error}</p><button onClick={() => void loadProducts()}>Try again</button></div>}
      {!loading && !error && filtered.length === 0 && <p className="state">{products.length === 0 ? 'No products found yet. Add items to the DynamoDB table to get started.' : 'No products match your search.'}</p>}
      {!loading && !error && filtered.length > 0 && <div className="table-wrap"><table><thead><tr><th>Product</th><th>Code</th><th>Type</th><th className="numeric">Amount</th><th className="numeric">Available inventory</th></tr></thead><tbody>
        {filtered.map((p) => <tr key={p.productId}><td><strong>{p.name || 'Unnamed product'}</strong><small>{p.productId}</small></td><td>{p.productCode || '—'}</td><td><span className="type-pill">{p.type || 'Uncategorized'}</span></td><td className="numeric">{Number(p.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="numeric"><span className={Number(p.availableInventory) <= 5 ? 'stock low' : 'stock'}>{Number(p.availableInventory ?? 0).toLocaleString()}</span></td></tr>)}
      </tbody></table></div>}
    </section>
    <footer>Product data is served by API Gateway and DynamoDB.</footer>
  </main>;
}
