import { useMemo, useState } from 'react'
import './App.css'

const starterProducts = [
  { id: 'LN-001', name: 'Solene Lounge Chair', category: 'Living Room', price: 18900, stock: 12, images: [], status: 'Active' },
  { id: 'LN-002', name: 'Mira Bedside Table', category: 'Bedroom', price: 7500, stock: 8, images: [], status: 'Active' },
  { id: 'LN-003', name: 'Arco Dining Set', category: 'Dining Room', price: 32500, stock: 4, images: [], status: 'Active' },
]
const emptyForm = { name: '', category: 'Living Room', price: '', stock: '', status: 'Active', images: [] }

function readProducts() {
  try { return JSON.parse(localStorage.getItem('luna-products')) || starterProducts } catch { return starterProducts }
}

function App() {
  const [products, setProducts] = useState(readProducts)
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const visibleProducts = useMemo(() => products.filter((product) => `${product.name} ${product.category} ${product.id}`.toLowerCase().includes(query.toLowerCase())), [products, query])
  const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selected.includes(product.id))
  const persist = (nextProducts) => { setProducts(nextProducts); localStorage.setItem('luna-products', JSON.stringify(nextProducts)) }
  const updateForm = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })) }
  const handleImages = (event) => {
    Array.from(event.target.files || []).forEach((file) => { const reader = new FileReader(); reader.onload = () => setForm((current) => ({ ...current, images: [...current.images, { name: file.name, url: reader.result }] })); reader.readAsDataURL(file) })
    event.target.value = ''
  }
  const saveProduct = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.price || !form.stock) { setNotice('Add a product name, price, and stock quantity to continue.'); return }
    const nextProduct = { ...form, name: form.name.trim(), price: Number(form.price), stock: Number(form.stock), id: editingId || `LN-${String(Date.now()).slice(-4)}` }
    persist(editingId ? products.map((product) => product.id === editingId ? nextProduct : product) : [nextProduct, ...products])
    setForm(emptyForm); setEditingId(null); setNotice(editingId ? 'Product updated successfully.' : 'Product added to your catalog.')
  }
  const editProduct = (product) => { setEditingId(product.id); setForm({ ...product, price: String(product.price), stock: String(product.stock) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const deleteProducts = (ids) => { persist(products.filter((product) => !ids.includes(product.id))); setSelected([]); setNotice(`${ids.length} product${ids.length > 1 ? 's' : ''} deleted.`) }
  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">L</span><span>Luna<span className="brand-light">Interiors</span></span></div><p className="workspace-label">Workspace</p><nav><button className="nav-item active"><span>▦</span> Product catalog</button><button className="nav-item"><span>◉</span> Orders <small>Coming soon</small></button><button className="nav-item"><span>♙</span> Customers <small>Coming soon</small></button></nav><div className="sidebar-bottom"><div className="profile"><span className="avatar">AD</span><span><strong>Admin</strong><small>Store manager</small></span><span className="more">•••</span></div></div></aside>
    <section className="content"><header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Catalog</div><div className="top-actions"><span className="status-dot" /> Store is live <button className="icon-button" aria-label="Notifications">♧</button></div></header>
      <div className="page-heading"><div><p className="eyebrow">LUNA INTERIORS / ADMIN</p><h1>Product catalog</h1><p className="lede">Keep your collection fresh, organized, and ready to discover.</p></div><button className="primary-button" onClick={() => { setForm(emptyForm); setEditingId(null); document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' }) }}><span>＋</span> Add product</button></div>
      <form id="product-form" className="product-form" onSubmit={saveProduct}><div className="form-heading"><div><span className="form-kicker">{editingId ? 'EDITING PRODUCT' : 'NEW PRODUCT'}</span><h2>{editingId ? 'Update product details' : 'Add to your collection'}</h2></div>{editingId && <button type="button" className="text-button" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel edit</button>}</div><div className="form-grid">
        <label>Product name<input name="name" value={form.name} onChange={updateForm} placeholder="e.g. Solene Lounge Chair" /></label><label>Category<select name="category" value={form.category} onChange={updateForm}><option>Living Room</option><option>Bedroom</option><option>Dining Room</option><option>Outdoor</option><option>Storage</option><option>Kitchen</option></select></label><label>Price <span className="field-hint">PHP</span><input name="price" type="number" min="0" value={form.price} onChange={updateForm} placeholder="0.00" /></label><label>Stock quantity<input name="stock" type="number" min="0" value={form.stock} onChange={updateForm} placeholder="0" /></label><label>Status<select name="status" value={form.status} onChange={updateForm}><option>Active</option><option>Draft</option><option>Archived</option></select></label><label className="upload-field">Product photos<input type="file" accept="image/*" multiple onChange={handleImages} /><span className="upload-box"><strong>＋</strong> Add multiple photos <small>PNG, JPG up to 5MB</small></span></label>
      </div>{form.images.length > 0 && <div className="image-previews">{form.images.map((image, index) => <div className="preview" key={`${image.name}-${index}`}><img src={image.url} alt={image.name} /><button type="button" onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }))} aria-label={`Remove ${image.name}`}>×</button></div>)}</div>}{notice && <p className="notice" role="status">{notice}</p>}<div className="form-footer"><span>Fields marked are required for a product listing.</span><button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Create product'} <span>→</span></button></div></form>
      <section className="catalog-section"><div className="section-heading"><div><span className="form-kicker">INVENTORY</span><h2>All products <span className="count-pill">{products.length}</span></h2></div><div className="table-tools"><div className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search catalog" /></div>{selected.length > 0 && <button className="delete-button" onClick={() => deleteProducts(selected)}>⌫ Delete {selected.length}</button>}</div></div><div className="table-wrap"><table><thead><tr><th className="check-cell"><input type="checkbox" checked={allVisibleSelected} onChange={() => setSelected(allVisibleSelected ? selected.filter((id) => !visibleProducts.some((product) => product.id === id)) : [...new Set([...selected, ...visibleProducts.map((product) => product.id)])])} aria-label="Select all products" /></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{visibleProducts.map((product) => <tr key={product.id}><td className="check-cell"><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelected(product.id)} aria-label={`Select ${product.name}`} /></td><td><div className="product-cell"><div className="product-thumb">{product.images?.[0] ? <img src={product.images[0].url} alt="" /> : <span>{product.name.charAt(0)}</span>}</div><div><strong>{product.name}</strong><small>{product.id}</small></div></div></td><td>{product.category}</td><td className="price">₱{Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td><td>{product.stock} units</td><td><span className={`status ${product.status.toLowerCase()}`}>{product.status}</span></td><td><button className="edit-button" onClick={() => editProduct(product)}>Edit</button><button className="row-delete" onClick={() => deleteProducts([product.id])} aria-label={`Delete ${product.name}`}>×</button></td></tr>)}{visibleProducts.length === 0 && <tr><td colSpan="7" className="empty-state">No products match your search.</td></tr>}</tbody></table></div></section><footer>© 2026 Luna Interiors <span>•</span> Product management</footer></section>
  </main>
}

export default App
