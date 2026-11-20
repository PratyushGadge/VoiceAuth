import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5001';

export default function Portal({ student, onLogout }) {
  const [page, setPage] = useState('overview');
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ platform: 'Amazon', order_id: '', item: '', expected_date: '' });

  async function loadDeliveries() {
    const response = await fetch(`${API_URL}/deliveries?student_id=${student.id}`);
    setDeliveries(await response.json());
  }

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function registerDelivery(event) {
    event.preventDefault();
    await fetch(`${API_URL}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, student_id: student.id }),
    });
    await loadDeliveries();
    setForm({ platform: 'Amazon', order_id: '', item: '', expected_date: '' });
    setPage('deliveries');
  }

  function updateForm(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  const expectedCount = deliveries.filter(d => d.status === 'Expected').length;
  const receivedCount = deliveries.filter(d => d.status === 'Received').length;
  const searchResults = deliveries.filter(d =>
    (d.order_id + ' ' + d.platform).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="portal">
      <aside className="sidebar">
        <div className="brand">Voice<span>Auth</span></div>
        <button className={page === 'overview' ? 'selected' : ''} onClick={() => setPage('overview')}>Overview</button>
        <button className={page === 'register' ? 'selected' : ''} onClick={() => setPage('register')}>Register delivery</button>
        <button className={page === 'deliveries' ? 'selected' : ''} onClick={() => setPage('deliveries')}>My deliveries</button>
        <div className="sidebar-bottom">
          <strong>{student.name}</strong>
          <button onClick={onLogout}>Log out</button>
        </div>
      </aside>

      <main className="content">
        {page === 'overview' && (
          <>
            <h1>Welcome, {student.name}</h1>
            <div className="stats">
              <div className="card"><span>Expected</span><strong>{expectedCount}</strong></div>
              <div className="card"><span>Received</span><strong>{receivedCount}</strong></div>
              <div className="card"><span>Total registered</span><strong>{deliveries.length}</strong></div>
            </div>
            <div className="card">
              <h2>Recent deliveries</h2>
              <DeliveryTable rows={deliveries.slice(0, 5)} />
            </div>
          </>
        )}

        {page === 'register' && (
          <>
            <h1>Register a delivery</h1>
            <form className="card form" onSubmit={registerDelivery}>
              <label>
                Platform
                <select name="platform" value={form.platform} onChange={updateForm}>
                  <option>Amazon</option>
                  <option>Flipkart</option>
                  <option>Swiggy</option>
                  <option>Zomato</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Order ID
                <input name="order_id" value={form.order_id} onChange={updateForm} required />
              </label>
              <label>
                Item
                <input name="item" value={form.item} onChange={updateForm} placeholder="e.g. Books" />
              </label>
              <label>
                Expected date
                <input name="expected_date" type="date" value={form.expected_date} onChange={updateForm} required />
              </label>
              <button className="button" type="submit">Register delivery</button>
            </form>
          </>
        )}

        {page === 'deliveries' && (
          <>
            <h1>My deliveries</h1>
            <div className="card">
              <input className="search" placeholder="Search by order ID or platform" value={search} onChange={e => setSearch(e.target.value)} />
              <DeliveryTable rows={searchResults} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function DeliveryTable({ rows }) {
  if (rows.length === 0) {
    return <p className="muted">No deliveries yet.</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Platform</th>
          <th>Item</th>
          <th>Expected date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(d => (
          <tr key={d.id}>
            <td>{d.order_id}</td>
            <td>{d.platform}</td>
            <td>{d.item}</td>
            <td>{d.expected_date}</td>
            <td><span className={'status ' + d.status}>{d.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
