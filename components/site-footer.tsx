import Link from 'next/link';
import { InstagramIcon } from './icons';
import { INSTAGRAM, footerExplore, waLink } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand">
              <img className="mark" src="/logo.jpg" alt="Noor e Kala logo" /> Noor e Kala
            </div>
            <p>
              Handcrafted crochet, resin art, fashion jewellery, bouquets &amp; gifts. Little pieces of art, made with
              heart.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              {footerExplore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Say Hi</h4>
            <ul>
              <li>
                <a href={INSTAGRAM} target="_blank" rel="noopener">
                  <InstagramIcon /> @noor.e.kala
                </a>
              </li>
              <li>
                <a href={waLink()} target="_blank" rel="noopener">
                  WhatsApp
                </a>
              </li>
              <li>
                <Link href="/#order">Custom Orders</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Noor e Kala. All things handmade.</span>
          <span>
            Crafted with <span className="heart">♡</span> &amp; a lot of yarn.
          </span>
        </div>
      </div>
    </footer>
  );
}
