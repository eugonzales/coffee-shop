import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Clock3, Coffee, MapPin } from 'lucide-react';
import { Coffee as CoffeeItem, IngredientOption } from '../types';
import { getCoffees, getIngredientOptions } from '../services/shopData';
import './HomePage.css';

interface HomePageProps {
  onOrder: () => void;
}

const SHOP_INFO = {
  name: 'mia.kape',
  neighborhood: 'Philippines',
  // Add the verified address and opening hours (for example, "Mo-Fr 08:00-17:00") before launch.
  streetAddress: '',
  city: '',
  region: '',
  postalCode: '',
  openingHours: [] as string[],
  mapsSearch: 'mia.kape coffee Philippines',
};

const MENU_PHOTOS: Record<string, string> = {
  Espresso: '/images/nathan-dumlao-nBJHO6wmRWw-unsplash.jpg',
  Coffee: '/images/spec.jpg',
  Specialty: '/images/nameless-3791-5nYLHK68TLM-unsplash.jpg',
  Latte: '/images/espresoo.jpg',
  'Cold Brew': '/images/jarek-ceborski-IhqDpFz7I8Q-unsplash.jpg',
};

const HomePage: React.FC<HomePageProps> = ({ onOrder }) => {
  const [coffees, setCoffees] = useState<CoffeeItem[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getCoffees(), getIngredientOptions()])
      .then(([menu, availableIngredients]) => {
        if (!active) return;
        setCoffees(menu);
        setIngredients(availableIngredients);
      })
      .catch(error => {
        if (active) setLoadError(error instanceof Error ? error.message : 'Unable to load the menu.');
      });
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(coffees.map(coffee => coffee.category)))],
    [coffees],
  );
  const visibleCoffees = useMemo(
    () => activeCategory === 'All'
      ? coffees
      : coffees.filter(coffee => coffee.category === activeCategory),
    [activeCategory, coffees],
  );
  const hasOatMilk = ingredients.some(ingredient => ingredient.name.toLowerCase() === 'oat milk');
  const address = [SHOP_INFO.streetAddress, SHOP_INFO.city, SHOP_INFO.region, SHOP_INFO.postalCode]
    .filter(Boolean)
    .join(', ');
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: SHOP_INFO.name,
    url: window.location.origin,
    image: `${window.location.origin}/images/coffee.jpg`,
    servesCuisine: 'Coffee',
    areaServed: SHOP_INFO.neighborhood,
    ...(address ? {
      address: {
        '@type': 'PostalAddress',
        streetAddress: SHOP_INFO.streetAddress || undefined,
        addressLocality: SHOP_INFO.city || undefined,
        addressRegion: SHOP_INFO.region || undefined,
        postalCode: SHOP_INFO.postalCode || undefined,
        addressCountry: 'PH',
      },
    } : {}),
    ...(SHOP_INFO.openingHours.length ? { openingHours: SHOP_INFO.openingHours } : {}),
  };

  return (
    <div className="home-page">
      <script type="application/ld+json">{JSON.stringify(businessSchema)}</script>

      <header className="home-header">
        <a className="home-brand" href="#home" aria-label="mia.kape home">
          <span className="home-brand-mark" aria-hidden="true"><Coffee size={20} /></span>
          <span>mia.kape</span>
        </a>
        <nav className="home-nav" aria-label="Main navigation">
          <a href="#menu">Our menu</a>
          <a href="#story">Our story</a>
          <a href="#visit">Find us</a>
        </nav>
        <button className="home-header-cta" onClick={onOrder}>
          Order pickup <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </header>

      <main>
        <section className="home-hero" id="home">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><span /> Your neighborhood coffee stop</p>
            <h1>A little pause.<br />A <em>really good</em> cup.</h1>
            <p className="home-hero-description">
              Thoughtfully made coffee, familiar faces, and something good to take with you.
            </p>
            <div className="home-hero-actions">
              <button className="home-button home-button-dark" onClick={onOrder}>
                Order for pickup <ArrowRight size={17} aria-hidden="true" />
              </button>
              <a className="home-button home-button-light" href="#menu">
                Explore the menu <ArrowDown size={16} aria-hidden="true" />
              </a>
            </div>
            <a className="home-hero-location" href="#visit">
              <MapPin size={15} aria-hidden="true" /> Serving the Philippines <span>·</span> Find us
            </a>
          </div>
          <div className="home-hero-image-wrap">
            <img
              className="home-hero-image"
              src="/images/coffee.jpg"
              alt="Freshly brewed coffee poured at a sunlit cafe table"
            />
            <div className="home-image-note">
              <span className="home-note-dot" />
              <span>Made fresh, just for you</span>
            </div>
            <span className="home-image-index" aria-hidden="true">01 / YOUR DAILY RITUAL</span>
          </div>
        </section>

        <section className="home-values" aria-label="What makes us special">
          <p>Good coffee, no fuss.</p>
          <span aria-hidden="true">✳</span>
          <p>Made with care, every cup.</p>
          <span aria-hidden="true">✳</span>
          <p>Always room for one more.</p>
        </section>

        <section className="home-menu-section" id="menu">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">Something for your cup</p>
              <h2>The good stuff.</h2>
            </div>
            <p className="home-section-intro">
              Your next favorite is right here. Make it yours with a choice of milk and extras.
            </p>
          </div>

          <div className="home-menu-tools">
            <div className="home-category-list" aria-label="Filter menu by category">
              {categories.map(category => (
                <button
                  className={`home-category${activeCategory === category ? ' is-active' : ''}`}
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="home-menu-note">Prices in Philippine pesos</span>
          </div>

          {visibleCoffees.length ? (
            <div className="home-menu-grid">
              {visibleCoffees.map((coffee, index) => (
                <article className="home-menu-card" key={coffee.id}>
                  <div className="home-menu-photo-wrap">
                    <img
                      className="home-menu-photo"
                      src={MENU_PHOTOS[coffee.category] || '/images/coffee.jpg'}
                      alt=""
                      loading="lazy"
                    />
                    <span className="home-menu-number">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="home-menu-card-heading">
                    <div>
                      <p className="home-menu-category">{coffee.category}</p>
                      <h3>{coffee.name}</h3>
                    </div>
                    <span className="home-menu-price">₱{coffee.basePrice.toFixed(2)}</span>
                  </div>
                  <p className="home-menu-description">{coffee.description}</p>
                  <div className="home-menu-card-footer">
                    <span className="home-menu-tag">{coffee.customizable ? 'Made your way' : 'House favorite'}</span>
                    {coffee.customizable && hasOatMilk && <span className="home-menu-tag">Oat milk available</span>}
                    <button className="home-menu-order" onClick={onOrder}>
                      Add to order <ArrowUpRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="home-menu-empty" role={loadError ? 'alert' : undefined}>
              {loadError || 'Our menu is being prepared. Please check back soon.'}
            </p>
          )}
          <div className="home-menu-bottom">
            <p>See something you love? Get it ready before you arrive.</p>
            <button className="home-text-link" onClick={onOrder}>
              Browse the full menu <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="home-story-section" id="story">
          <div className="home-story-image-wrap">
            <img
              src="/images/spec.jpg"
              alt="A freshly prepared cup of coffee with delicate latte art"
              loading="lazy"
              className="home-story-image"
            />
            <span className="home-story-caption">A good cup, made with intention.</span>
          </div>
          <div className="home-story-copy">
            <p className="home-eyebrow">A little about us</p>
            <h2>Good things take a little <em>care.</em></h2>
            <p>
              We believe the best coffee is the kind that brings you back. We start with
              quality beans, make each drink to order, and keep the welcome warm and the
              menu easy to love.
            </p>
            <p>
              Whether it’s your first cup of the day or a well-earned afternoon break,
              there’s a place for you at our table.
            </p>
            <a href="#menu" className="home-text-link">
              Find your usual <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="home-visit-section" id="visit">
          <div className="home-visit-heading">
            <p className="home-eyebrow">Come on by</p>
            <h2>Your next cup is closer than you think.</h2>
            <p>We’re looking forward to seeing you.</p>
          </div>
          <div className="home-visit-details">
            <div className="home-visit-detail">
              <span className="home-visit-icon"><MapPin size={19} aria-hidden="true" /></span>
              <div>
                <h3>Find the shop</h3>
                <p>{address || `mia.kape · ${SHOP_INFO.neighborhood}`}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_INFO.mapsSearch)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="home-text-link"
                >
                  Get directions <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="home-visit-detail">
              <span className="home-visit-icon"><Clock3 size={19} aria-hidden="true" /></span>
              <div>
                <h3>Opening hours</h3>
                {SHOP_INFO.openingHours.length ? (
                  <ul className="home-hours-list">
                    {SHOP_INFO.openingHours.map(hours => <li key={hours}>{hours}</li>)}
                  </ul>
                ) : (
                  <p>Hours to be confirmed. Please check before visiting.</p>
                )}
              </div>
            </div>
          </div>
          <div className="home-visit-footnote">
            <p>Drop in, stay awhile. Wi-Fi and seating details coming soon.</p>
            <button className="home-button home-button-cream" onClick={onOrder}>
              Order ahead <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <a className="home-brand home-footer-brand" href="#home">
          <span className="home-brand-mark" aria-hidden="true"><Coffee size={18} /></span>
          <span>mia.kape</span>
        </a>
        <p>Good coffee. Good company. See you soon.</p>
        <a href="#home" className="home-footer-top">Back to top ↑</a>
      </footer>
    </div>
  );
};

export default HomePage;
