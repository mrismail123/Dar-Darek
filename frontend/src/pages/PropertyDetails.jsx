import { useState } from "react";
import "./PropertyDetails.css";

import chaouenImage from "../assets/chaouen-bg.jpg";
import tetouanImage from "../assets/tetouan-hero.webp";

const mockProperty = {
  brand: "Dar Darek",
  title: "Appartement lumineux avec vue sur mer",
  propertyType: "Logement entier",
  city: "Tanger",
  neighborhood: "Malabata",
  address: "Boulevard Mohamed VI, Malabata, Tanger",
  coordinates: {
    lat: 35.7767,
    lng: -5.8039,
  },
  guests: 4,
  bedrooms: 2,
  beds: 3,
  bathrooms: 1,
  pricePerNight: 750,
  cleaningFee: 150,
  serviceFee: 90,
  rating: 4.86,
  reviewCount: 32,
  images: [
    tetouanImage,
    "/dardarek-tangier-coast.jpeg",
    "/dardarek-chefchaouen.jpeg",
    "/nur-tetouan-hero.webp",
    chaouenImage,
  ],
  description:
    "Profitez d'un appartement calme, lumineux et soigneusement équipé, idéal pour découvrir Tanger tout en gardant le confort d'un vrai chez-soi. Le salon s'ouvre sur une belle lumière naturelle, les chambres sont préparées pour un séjour reposant, et le quartier permet de rejoindre facilement la plage, les restaurants et les lieux incontournables de la ville.",
  highlights: [
    {
      title: "Logement entier",
      text: "Vous aurez tout l'appartement pour vous.",
      icon: "home",
    },
    {
      title: "Vue exceptionnelle",
      text: "Un aperçu dégagé vers la mer et la ville.",
      icon: "view",
    },
    {
      title: "Arrivée autonome",
      text: "Entrée simple et flexible selon votre horaire.",
      icon: "key",
    },
    {
      title: "Très bien situé",
      text: "Proche de la corniche, des cafés et des transports.",
      icon: "pin",
    },
  ],
  amenities: [
    { label: "WiFi haut débit", icon: "wifi" },
    { label: "Cuisine équipée", icon: "kitchen" },
    { label: "Climatisation", icon: "snow" },
    { label: "Parking gratuit", icon: "parking" },
    { label: "Lave-linge", icon: "washer" },
    { label: "Espace de travail", icon: "desk" },
    { label: "Télévision", icon: "tv" },
    { label: "Eau chaude", icon: "shower" },
    { label: "Balcon avec vue", icon: "balcony" },
    { label: "Cafetière", icon: "coffee" },
    { label: "Draps et serviettes", icon: "linen" },
    { label: "Sèche-cheveux", icon: "dryer" },
  ],
  ratingBreakdown: [
    { label: "Cleanliness", score: 4.9 },
    { label: "Accuracy", score: 4.8 },
    { label: "Check-in", score: 4.9 },
    { label: "Communication", score: 4.9 },
    { label: "Location", score: 4.7 },
    { label: "Value", score: 4.8 },
  ],
  reviews: [
    {
      name: "Sarah",
      date: "Mars 2026",
      text: "Appartement très propre, lumineux et bien placé. La communication était rapide et l'arrivée s'est faite sans stress.",
    },
    {
      name: "Youssef",
      date: "Février 2026",
      text: "Séjour agréable à Malabata. Le logement est confortable, proche de la mer, et parfait pour quelques jours à Tanger.",
    },
  ],
  availability: {
    month: "Mai 2026",
    startBlankDays: 4,
    blockedDays: [3, 4, 12, 18, 25],
    selectedDays: [8, 9, 10, 11],
  },
  houseRules: [
    "Arrivée après 15:00",
    "Départ avant 11:00",
    "Non fumeur",
    "Pas de fêtes ni de soirées",
  ],
  cancellationPolicy:
    "Annulation flexible pendant la phase de réservation. Les conditions finales seront confirmées avant paiement.",
  thingsToKnow: [
    "Pièce d'identité demandée à l'arrivée",
    "Quartier calme en soirée",
    "Logement adapté aux séjours courts et moyens",
  ],
  host: {
    name: "Nadia",
    avatarInitials: "ND",
    rating: 4.9,
    yearsHosting: 3,
    reviews: 86,
    responseRate: "98%",
    responseTime: "Répond généralement dans l'heure",
    verified: true,
    bio: "Passionnée par l'hospitalité marocaine, je veille à ce que chaque séjour soit mémorable. Locale de Tanger, je connais les meilleures adresses de la ville.",
  },
  bookingDefaults: {
    checkIn: "2026-05-08",
    checkOut: "2026-05-12",
    guests: 2,
  },
};

// Emoji/symbol icon map — no external library needed
const iconMap = {
  home: "🏠",
  view: "🌊",
  key: "🗝️",
  pin: "📍",
  wifi: "📶",
  kitchen: "🍳",
  snow: "❄️",
  parking: "🅿️",
  washer: "🫧",
  desk: "💻",
  tv: "📺",
  shower: "🚿",
  balcony: "🌅",
  coffee: "☕",
  linen: "🛏️",
  dryer: "💨",
  rules: "📋",
  clock: "🕒",
  cancel: "↩️",
  info: "ℹ️",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(amount);

const getNightCount = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();

  if (!checkIn || !checkOut || Number.isNaN(diff) || diff <= 0) {
    return 1;
  }

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

function PropertyGallery({ property }) {
  return (
    <section className="pd-gallery">
      <div className="pd-gallery__main">
        <img src={property.images[0]} alt="Main" />
      </div>

      <div className="pd-gallery__grid">
        {property.images.slice(1, 5).map((img, index) => (
          <div key={index} className="pd-gallery__tile">
            <img src={img} alt={`Photo ${index + 2}`} />
          </div>
        ))}
      </div>

      <button className="pd-gallery__btn">Afficher toutes les photos</button>
    </section>
  );
}

const scrollToAvailability = () => {
  document
    .getElementById("availability-section")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function BookingCard({ property, dates, guests, onDateChange, onGuestChange }) {
  const nights = getNightCount(dates.checkIn, dates.checkOut);
  const nightsTotal = nights * property.pricePerNight;
  const total = nightsTotal + property.cleaningFee + property.serviceFee;

  return (
    <div className="pd-booking-wrap">
      <div className="pd-booking__actions">
        <button type="button" className="pd-action-btn">
          🔗 Partager
        </button>
        <button type="button" className="pd-action-btn">
          ❤️ Enregistrer
        </button>
      </div>
      <aside className="pd-booking pd-card" aria-label="Carte de réservation">
        <div className="pd-booking__top">
          <div>
            <strong>{formatCurrency(property.pricePerNight)}</strong>
            <span> par nuit</span>
          </div>
          <p>
            ★ {property.rating} · {property.reviewCount} avis
          </p>
        </div>

        <div className="pd-booking__box">
          <label className="pd-booking__field">
            <span>Arrivée</span>
            <input
              type="date"
              value={dates.checkIn}
              onFocus={scrollToAvailability}
              onChange={(event) => onDateChange("checkIn", event.target.value)}
            />
          </label>
          <label className="pd-booking__field">
            <span>Départ</span>
            <input
              type="date"
              value={dates.checkOut}
              onFocus={scrollToAvailability}
              min={dates.checkIn}
              onChange={(event) => onDateChange("checkOut", event.target.value)}
            />
          </label>
          <div className="pd-booking__guest-field">
            <div>
              <span>Voyageurs</span>
              <strong>
                {guests} {guests > 1 ? "voyageurs" : "voyageur"}
              </strong>
            </div>
            <div className="pd-stepper">
              <button
                type="button"
                onClick={() => onGuestChange(-1)}
                disabled={guests <= 1}
              >
                -
              </button>
              <span>{guests}</span>
              <button
                type="button"
                onClick={() => onGuestChange(1)}
                disabled={guests >= property.guests}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="pd-primary-btn">
          Réserver
        </button>

        <p className="pd-booking__note">Vous ne serez pas encore débité</p>

        <div className="pd-booking__total">
          <div>
            <span>
              {formatCurrency(property.pricePerNight)} x {nights} nuits
            </span>
            <strong>{formatCurrency(nightsTotal)}</strong>
          </div>
          <div>
            <span>Frais de ménage</span>
            <strong>{formatCurrency(property.cleaningFee)}</strong>
          </div>
          <div>
            <span>Frais de service</span>
            <strong>{formatCurrency(property.serviceFee)}</strong>
          </div>
          <div className="pd-booking__grand-total">
            <span>Total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>
      </aside>
    </div>
  );
}

function AmenitiesSection({ amenities }) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);
  const hasMoreAmenities = amenities.length > 6;

  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Ce que propose ce logement</h2>
        <p className="pd-section__hint">
          Les équipements principaux pour un séjour confortable.
        </p>
      </div>

      <div className="pd-amenities">
        {visibleAmenities.map((amenity) => (
          <div className="pd-amenity" key={amenity.label}>
            <span className="pd-amenity__icon" aria-hidden="true">
              {iconMap[amenity.icon]}
            </span>
            <span className="pd-amenity__label">{amenity.label}</span>
          </div>
        ))}
      </div>

      {hasMoreAmenities && (
        <button
          type="button"
          className="pd-secondary-btn"
          onClick={() => setShowAllAmenities((current) => !current)}
        >
          {showAllAmenities
            ? "✕ Masquer les équipements"
            : `Afficher les ${amenities.length - 6} équipements restants`}
        </button>
      )}
    </section>
  );
}

function ReviewsSection({ property }) {
  return (
    <section className="pd-section pd-reviews">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Avis des voyageurs</h2>
        <p className="pd-section__hint">
          Les évaluations détaillées des voyageurs après leur séjour.
        </p>
      </div>

      <div className="pd-reviews__overview">
        {/* Improved score card */}
        <div className="pd-reviews__score-card">
          <div className="pd-reviews__score-badge">Excellent</div>
          <div className="pd-reviews__score-main">
            <span className="pd-reviews__score">{property.rating}</span>
            <span className="pd-reviews__score-star" aria-hidden="true">
              ★
            </span>
          </div>
          <div className="pd-reviews__score-copy">
            <p>Basé sur {property.reviewCount} avis</p>
          </div>
          <div className="pd-reviews__score-foot">
            <span>✓ Voyageurs satisfaits</span>
          </div>
        </div>

        <div className="pd-rating-grid">
          {property.ratingBreakdown.map((item) => (
            <div className="pd-rating-row" key={item.label}>
              <div>
                <span>{item.label}</span>
                <strong>{item.score}/5</strong>
              </div>
              <span className="pd-rating-bar">
                <span style={{ width: `${(item.score / 5) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pd-comments">
        {property.reviews.slice(0, 2).map((review) => (
          <article className="pd-comment" key={review.name}>
            <div className="pd-comment__head">
              <span>{review.name.slice(0, 1)}</span>
              <div>
                <h3>{review.name}</h3>
                <p>{review.date}</p>
              </div>
            </div>
            <p>{review.text}</p>
          </article>
        ))}
      </div>
      {property.reviews.length > 2 && (
        <button type="button" className="pd-secondary-btn">
          Afficher tous les avis
        </button>
      )}
    </section>
  );
}

function LocationSection({ property }) {
  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Où se trouve le logement</h2>
        <p className="pd-section__hint">
          {property.neighborhood}, {property.city}
        </p>
      </div>

      <div className="pd-location">
        <div className="pd-location__map" aria-label="Carte du logement">
          <iframe
            title="Carte du logement"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${
              property.coordinates.lng - 0.01
            }%2C${property.coordinates.lat - 0.01}%2C${
              property.coordinates.lng + 0.01
            }%2C${property.coordinates.lat + 0.01}&layer=mapnik&marker=${
              property.coordinates.lat
            }%2C${property.coordinates.lng}`}
            loading="lazy"
          />
        </div>

        <div className="pd-location__address pd-card">
          <span className="pd-location__addr-icon" aria-hidden="true">
            🗺️
          </span>

          <div>
            <h3>{property.address}</h3>
            <p>
              À quelques minutes de la corniche, avec un accès pratique aux
              restaurants, cafés et transports.
            </p>

            <div className="pd-location__tags">
              <span>🚶 Corniche</span>
              <span>☕ Cafés</span>
              <span>🚌 Transports</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HostSection({ host }) {
  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Votre hôte</h2>
        <p className="pd-section__hint">
          Un accueil local, attentif et simple à contacter.
        </p>
      </div>

      <div className="pd-host pd-card">
        {/* Top row: profile + stats */}
        <div className="pd-host__top">
          <div className="pd-host__profile">
            <div className="pd-host__avatar-wrap">
              <span className="pd-host__avatar">{host.avatarInitials}</span>
              {host.verified && (
                <span
                  className="pd-host__verified-badge"
                  aria-label="Hôte vérifié"
                >
                  ✓
                </span>
              )}
            </div>
            <div className="pd-host__profile-info">
              <h3>{host.name}</h3>
              <p>Hôte Dar Darek · {host.yearsHosting} ans d'expérience</p>
              {host.verified && (
                <span className="pd-host__verified-text">
                  Identité vérifiée
                </span>
              )}
            </div>
          </div>

          <div className="pd-host__stats">
            <div className="pd-host__stat">
              <strong>⭐ {host.rating}</strong>
              <span>Note</span>
            </div>
            <div className="pd-host__stat">
              <strong>{host.reviews}</strong>
              <span>Avis</span>
            </div>
            <div className="pd-host__stat">
              <strong>{host.responseRate}</strong>
              <span>Réponse</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {host.bio && <p className="pd-host__bio">{host.bio}</p>}

        {/* Response time */}
        <div className="pd-host__response">
          <span className="pd-host__response-icon" aria-hidden="true">
            ⏱️
          </span>
          <div>
            <strong>Temps de réponse</strong>
            <p>{host.responseTime}</p>
          </div>
        </div>

        <button type="button" className="pd-primary-btn pd-host__contact-btn">
          Contacter l'hôte
        </button>
      </div>
    </section>
  );
}

function HighlightsSection({ highlights }) {
  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Points forts</h2>
        <p className="pd-section__hint">Ce qui rend ce logement unique.</p>
      </div>

      <div className="pd-highlights">
        {highlights.map((highlight) => (
          <article className="pd-highlight pd-card" key={highlight.title}>
            <span className="pd-highlight__icon" aria-hidden="true">
              {iconMap[highlight.icon]}
            </span>
            <div className="pd-highlight__content">
              <h3>{highlight.title}</h3>
              <p>{highlight.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const getMonthDays = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getStartBlankDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
};

const formatDate = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
};

function AvailabilitySection({ availability, dates, onDateChange }) {
  const [currentMonth, setCurrentMonth] = useState(4); // Mai
  const year = 2026;

  const visibleMonths = [currentMonth, currentMonth + 1];

  const handleDayClick = (month, day) => {
    const selectedDate = formatDate(year, month, day);

    if (!dates.checkIn || (dates.checkIn && dates.checkOut)) {
      onDateChange("checkIn", selectedDate);
      onDateChange("checkOut", "");
      return;
    }

    const firstDate = new Date(dates.checkIn);
    const secondDate = new Date(selectedDate);

    if (secondDate > firstDate) {
      onDateChange("checkOut", selectedDate);
    } else {
      onDateChange("checkIn", selectedDate);
      onDateChange("checkOut", dates.checkIn);
    }
  };

  const isInRange = (month, day) => {
    if (!dates.checkIn || !dates.checkOut) return false;

    const date = new Date(formatDate(year, month, day));

    return date >= new Date(dates.checkIn) && date <= new Date(dates.checkOut);
  };

  return (
    <section className="pd-section" id="availability-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">Disponibilités</h2>
        <p className="pd-section__hint">Sélectionnez vos dates de séjour.</p>
      </div>

      <div className="pd-calendar pd-card">
        <div className="pd-calendar__head">
          <button
            type="button"
            onClick={() => setCurrentMonth((m) => Math.max(0, m - 1))}
          >
            ‹
          </button>

          <strong>
            {monthNames[currentMonth]} - {monthNames[currentMonth + 1]} {year}
          </strong>

          <button
            type="button"
            onClick={() => setCurrentMonth((m) => Math.min(10, m + 1))}
          >
            ›
          </button>
        </div>

        <div className="pd-calendar__months">
          {visibleMonths.map((month) => {
            const days = Array.from(
              { length: getMonthDays(year, month) },
              (_, index) => index + 1,
            );

            return (
              <div className="pd-calendar__month" key={month}>
                <h3>
                  {monthNames[month]} {year}
                </h3>

                <div className="pd-calendar__weekdays">
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>

                <div className="pd-calendar__grid">
                  {Array.from({
                    length: getStartBlankDays(year, month),
                  }).map((_, index) => (
                    <span
                      className="pd-calendar__day pd-calendar__day--empty"
                      key={`empty-${month}-${index}`}
                    />
                  ))}

                  {days.map((day) => {
                    const isSelected = isInRange(month, day);

                    return (
                      <button
                        type="button"
                        className={[
                          "pd-calendar__day",
                          isSelected ? "pd-calendar__day--selected" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={`${month}-${day}`}
                        onClick={() => handleDayClick(month, day)}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutPlaceSection({ property }) {
  return (
    <section className="pd-section">
      <div className="pd-section__head">
        <h2 className="pd-section__title">À propos du logement</h2>
        <p className="pd-section__hint">
          Informations importantes avant de réserver.
        </p>
      </div>

      <div className="pd-about-grid">
        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              📋
            </span>
            <h3>Règlement intérieur</h3>
          </div>
          <ul>
            {property.houseRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>

        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              🕒
            </span>
            <h3>Arrivée / Départ</h3>
          </div>
          <div className="pd-about-card__check">
            <div className="pd-about-card__check-item">
              <span className="pd-about-card__check-label">Check-in</span>
              <strong>À partir de 15:00</strong>
            </div>
            <div className="pd-about-card__check-divider" />
            <div className="pd-about-card__check-item">
              <span className="pd-about-card__check-label">Check-out</span>
              <strong>Avant 11:00</strong>
            </div>
          </div>
          <p>
            Arrivée flexible selon votre horaire. Départ dans les délais pour
            préparer le logement sereinement.
          </p>
        </article>

        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              ↩️
            </span>
            <h3>Politique d'annulation</h3>
          </div>
          <div className="pd-about-card__policy">
            <span className="pd-about-card__policy-badge">Flexible</span>
            <p>{property.cancellationPolicy}</p>
          </div>
        </article>

        <article className="pd-about-card pd-card">
          <div className="pd-about-card__header">
            <span className="pd-about-card__icon" aria-hidden="true">
              ℹ️
            </span>
            <h3>À savoir</h3>
          </div>
          <ul>
            {property.thingsToKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default function PropertyDetails() {
  const [dates, setDates] = useState({
    checkIn: mockProperty.bookingDefaults.checkIn,
    checkOut: mockProperty.bookingDefaults.checkOut,
  });
  const [guests, setGuests] = useState(mockProperty.bookingDefaults.guests);

  const updateDate = (field, value) => {
    setDates((currentDates) => ({
      ...currentDates,
      [field]: value,
    }));
  };

  const updateGuests = (change) => {
    setGuests((currentGuests) =>
      Math.min(mockProperty.guests, Math.max(1, currentGuests + change)),
    );
  };

  return (
    <main className="pd-page">
      <header className="pd-topbar">
        <a className="pd-brand" href="/" aria-label="Dar Darek">
          <span className="pd-brand__mark">D</span>
          <span>{mockProperty.brand}</span>
        </a>
      </header>

      <section className="pd-section pd-title-card">
        <h1>{mockProperty.title}</h1>
        <p className="pd-title-card__location">
          {mockProperty.neighborhood}, {mockProperty.city}
        </p>
      </section>

      <PropertyGallery property={mockProperty} />

      <section className="pd-layout">
        <div className="pd-content">
          {/* Summary card */}
          <section className="pd-summary" aria-label="Résumé du logement">
            <div className="pd-summary__content">
              <h2 className="pd-summary__headline">
                {mockProperty.propertyType} à {mockProperty.city}
              </h2>
              <div className="pd-summary__details">
                <span>👥 {mockProperty.guests} voyageurs</span>
                <span>🛏️ {mockProperty.bedrooms} chambres</span>
                <span>🛌 {mockProperty.beds} lits</span>
                <span>🚿 {mockProperty.bathrooms} salle de bain</span>
              </div>
              <div className="pd-summary__rating">
                <strong>⭐ {mockProperty.rating}</strong>
                <span>·</span>
                <button type="button">{mockProperty.reviewCount} avis</button>
              </div>
            </div>
          </section>

          <HighlightsSection highlights={mockProperty.highlights} />

          {/* Description */}
          <section className="pd-section">
            <div className="pd-section__head">
              <h2 className="pd-section__title">Description</h2>
              <p className="pd-section__hint">
                Un aperçu clair de l'ambiance, du confort et du quartier.
              </p>
            </div>
            <p className="pd-description">{mockProperty.description}</p>
          </section>

          <AmenitiesSection amenities={mockProperty.amenities} />

          <AvailabilitySection
            availability={mockProperty.availability}
            dates={dates}
            onDateChange={updateDate}
          />

          <ReviewsSection property={mockProperty} />

          <LocationSection property={mockProperty} />

          <AboutPlaceSection property={mockProperty} />

          <HostSection host={mockProperty.host} />
        </div>

        <BookingCard
          property={mockProperty}
          dates={dates}
          guests={guests}
          onDateChange={updateDate}
          onGuestChange={updateGuests}
        />
      </section>
    </main>
  );
}
