import Image from 'next/image';
import type { Metadata } from 'next';
import { logout } from '../login/actions';
import {
  addCategory,
  addProduct,
  approveReview,
  deleteProduct,
  destroyProduct,
  deleteReview,
  markAlertNotified,
  saveOccasion,
  setProductOccasions,
  updateBanner,
  updateCategory,
  updateOrderStatus,
  updateProduct,
} from './actions';
import { getAllProducts, getAllReviews, getBanner, getCategories, getOccasions, getOrders, getStockAlerts } from '@/lib/store';
import { isLive } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Owner Studio — Noor e Kala',
  robots: { index: false, follow: false },
};

const statuses = ['new', 'confirmed', 'paid', 'making', 'shipped', 'delivered', 'cancelled'];

function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Working late';
}

export default async function Admin() {
  // One round of parallel reads rather than seven sequential ones — matters
  // once the database is remote (Turso) instead of a local file.
  const [products, categories, orders, banner, reviews, alerts, occasions] = await Promise.all([
    getAllProducts(),
    getCategories(true),
    getOrders(),
    getBanner(),
    getAllReviews(),
    getStockAlerts(),
    getOccasions(true),
  ]);

  const pendingReviews = reviews.filter((review) => review.status === 'pending');
  const readyToTell = alerts.filter((alert) => alert.back_in_stock);

  const activeProducts = products.filter((product) => product.is_active !== false);
  const liveProducts = activeProducts.filter((product) => !product.sold_out);
  const lowStock = activeProducts.filter((product) => typeof product.stock === 'number' && product.stock <= 2);

  return (
    <div className="studio">
      <aside className="studio-side">
        <a className="brand-lockup" href="/">
          <span>n</span>
          <b>Noor e Kala</b>
        </a>
        <nav>
          <a href="#overview">Overview</a>
          <a href="#add">Add product</a>
          <a href="#products">Products</a>
          <a href="#collections">Collections</a>
          <a href="#occasions">Occasions &amp; offers</a>
          <a href="#waitlist">Waiting list{readyToTell.length ? ` (${readyToTell.length})` : ''}</a>
          <a href="#reviews">Reviews{pendingReviews.length ? ` (${pendingReviews.length})` : ''}</a>
          <a href="#orders">Orders</a>
        </nav>
        <a className="side-link" href="/" target="_blank">
          View live shop
        </a>
        <form action={logout}>
          <button className="plain-button">Sign out</button>
        </form>
      </aside>

      <main className="studio-main" id="overview">
        <div className="studio-hero">
          <div>
            <p>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1>{greeting()}.</h1>
          </div>
        </div>

        <section className="stat-grid">
          <div>
            <span>Live products</span>
            <b>{liveProducts.length}</b>
          </div>
          <div>
            <span>New orders</span>
            <b>{orders.filter((order) => order.status === 'new').length}</b>
          </div>
          <div>
            <span>Trending picks</span>
            <b>{activeProducts.filter((product) => product.featured).length}</b>
          </div>
          <div>
            <span>Low stock</span>
            <b>{lowStock.length}</b>
          </div>
          <div>
            <span>Reviews to approve</span>
            <b>{pendingReviews.length}</b>
          </div>
          <div>
            <span>People to tell</span>
            <b>{readyToTell.length}</b>
          </div>
        </section>

        <section className="owner-panel">
          <div className="panel-title">
            <p>Announcement</p>
            <h2>The offer bar at the top of the shop</h2>
          </div>
          <form action={updateBanner} className="owner-form">
            <label className="wide">
              Message
              <input name="banner_text" defaultValue={banner.text} placeholder="Grand opening offer…" />
            </label>
            <label className="wide">
              Link (optional)
              <input name="banner_link" defaultValue={banner.link ?? ''} placeholder="https://…" />
            </label>
            <div className="toggle-row wide">
              <label>
                <input name="banner_on" type="checkbox" defaultChecked={banner.on} /> Show the bar
              </label>
            </div>
            <button className="wide">Save announcement</button>
          </form>
        </section>

        <section className="owner-panel" id="add">
          <div className="panel-title">
            <p>New product</p>
            <h2>Add a piece</h2>
          </div>
          <form action={addProduct} className="owner-form product-editor">
            <label>
              Product name
              <input name="name" placeholder="Pressed flower keepsake" required />
            </label>
            <label>
              Category
              <select name="cat" required>
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Selling price
              <input name="price" type="number" min="0" placeholder="899" required />
            </label>
            <label>
              Original price / MRP
              <input name="mrp" type="number" min="0" placeholder="1099" />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min="0" placeholder="Leave blank if made to order" />
            </label>
            <label className="wide">
              Product photos <small>— pick several at once; the first becomes the main photo</small>
              <input name="photos" type="file" accept="image/*" multiple />
            </label>
            <label className="wide">
              Image URL
              <input name="img" placeholder="/img/your-photo.jpg — or upload above" />
            </label>
            <label className="wide">
              Description
              <textarea name="desc" placeholder="What makes this piece special?" />
            </label>
            <label className="wide">
              Custom note
              <textarea name="note" placeholder="Names, colours, flower preservation instructions…" />
            </label>
            <label>
              Display order
              <input name="sort_order" type="number" defaultValue="0" />
            </label>
            <div className="toggle-row wide">
              <label>
                <input name="featured" type="checkbox" /> Trending
              </label>
              <label>
                <input name="new" type="checkbox" /> New arrival
              </label>
              <label>
                <input name="enquiry" type="checkbox" /> Custom enquiry
              </label>
              <label>
                <input name="sold_out" type="checkbox" /> Sold out
              </label>
            </div>
            <button className="wide">Publish product</button>
          </form>
        </section>

        <section className="owner-panel" id="products">
          <div className="panel-title">
            <p>Catalogue</p>
            <h2>Edit products, pricing and homepage placement</h2>
          </div>
          <div className="product-admin-list">
            {products.length ? (
              products.map((product) => (
                <article
                  className="product-admin-card"
                  // The fields below are uncontrolled, so React would keep their old
                  // DOM values after a save. Keying on the data remounts the form so it
                  // shows what was actually stored.
                  key={`${product.id}|${product.price}|${product.mrp}|${product.sort_order}|${product.is_active}|${product.sold_out}|${product.featured}|${product.new}|${product.stock}|${product.cat}`}
                >
                  <Image src={product.img} alt="" width={120} height={120} sizes="120px" />
                  <form action={updateProduct} className="owner-form product-editor">
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="existing_img" value={product.img ?? ''} />
                    <label>
                      Product name
                      <input name="name" defaultValue={product.name} required />
                    </label>
                    <label>
                      Category
                      <select name="cat" defaultValue={product.cat}>
                        {categories.map((category) => (
                          <option key={category.key} value={category.key}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Selling price
                      <input name="price" type="number" min="0" defaultValue={product.price} required />
                    </label>
                    <label>
                      MRP
                      <input name="mrp" type="number" min="0" defaultValue={product.mrp ?? ''} />
                    </label>
                    <label>
                      Stock
                      <input name="stock" type="number" min="0" defaultValue={product.stock ?? ''} />
                    </label>
                    <label>
                      Display order
                      <input name="sort_order" type="number" defaultValue={product.sort_order ?? 0} />
                    </label>
                    <label className="wide">
                      Add more photos <small>— select several at once</small>
                      <input name="photos" type="file" accept="image/*" multiple />
                    </label>
                    <label className="wide">
                      Main image URL
                      <input name="img" defaultValue={product.img ?? ''} />
                    </label>
                    <label className="wide">
                      Extra image URLs
                      <textarea name="existing_images" defaultValue={(product.images ?? []).join('\n')} />
                    </label>
                    <label className="wide">
                      Description
                      <textarea name="desc" defaultValue={product.desc ?? ''} />
                    </label>
                    <label className="wide">
                      Custom note
                      <textarea name="note" defaultValue={product.note ?? ''} />
                    </label>
                    <div className="toggle-row wide">
                      <label>
                        <input name="featured" type="checkbox" defaultChecked={Boolean(product.featured)} /> Trending
                      </label>
                      <label>
                        <input name="new" type="checkbox" defaultChecked={Boolean(product.new)} /> New arrival
                      </label>
                      <label>
                        <input name="enquiry" type="checkbox" defaultChecked={Boolean(product.enquiry)} /> Custom enquiry
                      </label>
                      <label>
                        <input name="sold_out" type="checkbox" defaultChecked={Boolean(product.sold_out)} /> Sold out
                      </label>
                      <label>
                        <input name="is_active" type="checkbox" defaultChecked={product.is_active !== false} /> Show in
                        shop
                      </label>
                    </div>
                    <button>Save changes</button>
                  </form>
                  <div className="admin-card-actions">
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button className="danger-button">Hide from shop</button>
                    </form>
                    {product.is_active === false ? (
                      <form action={destroyProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button className="danger-button solid">Delete permanently</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No products yet</h3>
                <p>Add your first piece with the form above.</p>
              </div>
            )}
          </div>
        </section>

        <section className="owner-panel" id="collections">
          <div className="panel-title">
            <p>Collections</p>
            <h2>Add future product categories</h2>
          </div>
          <form action={addCategory} className="owner-form collection-add">
            <label>
              New collection name
              <input name="label" placeholder="Candles" required />
            </label>
            <button>Add collection</button>
          </form>
          <div className="collection-list">
            {categories.map((category) => (
              <form action={updateCategory} className="collection-row" key={category.key}>
                <input type="hidden" name="key" value={category.key} />
                <input name="label" defaultValue={category.label} />
                <input name="sort_order" type="number" defaultValue={category.sort_order ?? 0} aria-label="Sort order" />
                <label>
                  <input name="is_active" type="checkbox" defaultChecked={category.is_active !== false} /> Show
                </label>
                <button>Save</button>
              </form>
            ))}
          </div>
        </section>

        <section className="owner-panel" id="occasions">
          <div className="panel-title">
            <p>Occasions &amp; offers</p>
            <h2>Run a sale for a festival or moment</h2>
          </div>

          <p className="panel-hint">
            An occasion is a way for customers to shop by moment (&ldquo;Weddings&rdquo;, &ldquo;For Mum&rdquo;). Give it
            a discount above 0% and it becomes a live offer on every piece tagged with it — a banner appears on the
            homepage automatically while it runs. Leave the dates blank to run it until you switch it off.
          </p>

          <form action={saveOccasion} className="owner-form">
            <label>
              Occasion name
              <input name="label" placeholder="Rakhi" required />
            </label>
            <label>
              Emoji
              <input name="emoji" placeholder="🪢" maxLength={4} />
            </label>
            <label>
              Discount %
              <input name="discount_percent" type="number" min="0" max="90" defaultValue="0" />
            </label>
            <label>
              Starts on
              <input name="starts_on" type="date" />
            </label>
            <label>
              Ends on
              <input name="ends_on" type="date" />
            </label>
            <label>
              Order
              <input name="sort_order" type="number" defaultValue="0" />
            </label>
            <label className="wide">
              Headline shown on the homepage
              <input name="headline" placeholder="Rakhi Special — 15% off every keepsake for siblings" />
            </label>
            <div className="toggle-row wide">
              <label>
                <input name="is_active" type="checkbox" defaultChecked /> Show this occasion
              </label>
            </div>
            <button className="wide">Add occasion</button>
          </form>

          <div className="collection-list">
            {occasions.map((occasion) => {
              const live = isLive(occasion);
              const tagged = products.filter((product) => product.occasions.includes(occasion.key)).length;
              return (
                <form action={saveOccasion} className="occasion-row" key={occasion.key}>
                  <input type="hidden" name="key" value={occasion.key} />
                  <div className="occasion-head">
                    <strong>
                      {occasion.emoji ?? ''} {occasion.label}
                    </strong>
                    <span className={`occasion-state${live ? ' live' : ''}`}>
                      {live ? `LIVE · ${Math.round(occasion.discount_percent)}% off` : 'not running'}
                    </span>
                    <small>{tagged} pieces tagged</small>
                  </div>
                  <label>
                    Name
                    <input name="label" defaultValue={occasion.label} required />
                  </label>
                  <label>
                    Emoji
                    <input name="emoji" defaultValue={occasion.emoji ?? ''} maxLength={4} />
                  </label>
                  <label>
                    Discount %
                    <input
                      name="discount_percent"
                      type="number"
                      min="0"
                      max="90"
                      defaultValue={occasion.discount_percent}
                    />
                  </label>
                  <label>
                    Starts
                    <input name="starts_on" type="date" defaultValue={occasion.starts_on ?? ''} />
                  </label>
                  <label>
                    Ends
                    <input name="ends_on" type="date" defaultValue={occasion.ends_on ?? ''} />
                  </label>
                  <label>
                    Order
                    <input name="sort_order" type="number" defaultValue={occasion.sort_order} />
                  </label>
                  <label className="wide">
                    Headline
                    <input name="headline" defaultValue={occasion.headline ?? ''} />
                  </label>
                  <div className="toggle-row wide">
                    <label>
                      <input name="is_active" type="checkbox" defaultChecked={occasion.is_active} /> Show
                    </label>
                    <button>Save</button>
                  </div>
                </form>
              );
            })}
          </div>

          <div className="panel-title" style={{ marginTop: 'var(--s5)' }}>
            <p>Tagging</p>
            <h2>Which pieces belong to which occasion</h2>
          </div>
          <div className="tag-list">
            {products
              .filter((product) => product.is_active !== false)
              .map((product) => (
                <form action={setProductOccasions} className="tag-row" key={product.id}>
                  <input type="hidden" name="id" value={product.id} />
                  <Image src={product.img} alt="" width={120} height={120} sizes="120px" />
                  <div>
                    <strong>{product.name}</strong>
                    <div className="toggle-row">
                      {occasions.map((occasion) => (
                        <label key={occasion.key}>
                          <input
                            type="checkbox"
                            name="occasions"
                            value={occasion.key}
                            defaultChecked={product.occasions.includes(occasion.key)}
                          />{' '}
                          {occasion.emoji ?? ''} {occasion.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button>Save tags</button>
                </form>
              ))}
          </div>
        </section>

        <section className="owner-panel" id="waitlist">
          <div className="panel-title">
            <p>Waiting list</p>
            <h2>People who asked to be told when a piece is back</h2>
          </div>
          <div className="order-list">
            {alerts.length ? (
              alerts.map((alert) => (
                <article className={`review-row${alert.back_in_stock ? ' pending' : ''}`} key={alert.id}>
                  <div>
                    <strong>{alert.product_name ?? 'Unknown product'}</strong>
                    <p>{alert.contact}</p>
                    <small>
                      asked {new Date(alert.created_at).toLocaleDateString('en-IN')} ·{' '}
                      <b>{alert.back_in_stock ? 'back in stock — message them' : 'still sold out'}</b>
                    </small>
                  </div>
                  <div className="review-actions">
                    <form action={markAlertNotified}>
                      <input type="hidden" name="id" value={alert.id} />
                      <button>Mark as told</button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p>Nobody is waiting on a sold-out piece right now.</p>
            )}
          </div>
        </section>

        <section className="owner-panel" id="reviews">
          <div className="panel-title">
            <p>Reviews</p>
            <h2>Nothing appears on the shop until you approve it</h2>
          </div>
          <div className="order-list">
            {reviews.length ? (
              reviews.map((review) => (
                <article className={`review-row${review.status === 'pending' ? ' pending' : ''}`} key={review.id}>
                  <div>
                    <strong>{review.product_name ?? 'Unknown product'}</strong>
                    <p className="stars">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className={i < review.rating ? '' : 'dim'}>
                          {star}
                        </span>
                      ))}
                    </p>
                    <p>{review.text}</p>
                    <small>
                      {review.name} · {new Date(review.created_at).toLocaleDateString('en-IN')} ·{' '}
                      <b>{review.status}</b>
                    </small>
                  </div>
                  <div className="review-actions">
                    {review.status === 'pending' ? (
                      <form action={approveReview}>
                        <input type="hidden" name="id" value={review.id} />
                        <button>Approve</button>
                      </form>
                    ) : null}
                    <form action={deleteReview}>
                      <input type="hidden" name="id" value={review.id} />
                      <button className="danger-button">Delete</button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
        </section>

        <section className="owner-panel" id="orders">
          <div className="panel-title">
            <p>Orders</p>
            <h2>Customer requests</h2>
          </div>
          <div className="order-list">
            {orders.length ? (
              orders.map((order) => (
                <article className="admin-order-card" key={order.id}>
                  <div>
                    <h3>{order.customer_name}</h3>
                    <p>
                      {order.phone} {order.email ? `· ${order.email}` : ''}
                    </p>
                    <p>{order.address}</p>
                    <p>{order.customer_note}</p>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <span key={`${order.id}-${item.name}-${index}`}>
                        {item.qty} x {item.name} — {money(item.price * item.qty)}
                      </span>
                    ))}
                  </div>
                  <form action={updateOrderStatus} className="order-status">
                    <input type="hidden" name="id" value={order.id} />
                    <strong>{money(order.total)}</strong>
                    <select name="status" defaultValue={order.status}>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button>Update</button>
                  </form>
                </article>
              ))
            ) : (
              <p>No orders yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
