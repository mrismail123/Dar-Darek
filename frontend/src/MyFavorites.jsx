import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToken } from './Contexts/TokenContext';
import { buildApiUrl, createAuthConfig } from './lib/api';
import Header from './Home components/Header';
import Footer from './Footer';
import { FaHeart, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaHome } from 'react-icons/fa';
import { MdOutlineExplore } from 'react-icons/md';

/* ─── helpers ─────────────────────────────────────────────────────────── */
const getImageSrc = (raw) => {
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return buildApiUrl(raw);
};

const propertyTypeLabel = (type) => {
    if (!type) return 'Property';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

/* ─── FavoriteCard ────────────────────────────────────────────────────── */
const FavoriteCard = ({ property, onNavigate, onRemove }) => {
    const imageSrc = getImageSrc(property.main_image);
    const [imgError, setImgError] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleRemove = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        await onRemove(property.id_property);
    };

    return (
        <article
            className="fav-card"
            onClick={() => onNavigate(property.id_property)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(property.id_property)}
        >
            {/* Image */}
            <div className="fav-card__img-wrap">
                {imageSrc && !imgError ? (
                    <img
                        src={imageSrc}
                        alt={property.title}
                        className="fav-card__img"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="fav-card__img-placeholder">
                        <FaHome size={38} color="#C4B89A" />
                    </div>
                )}

                {/* Remove button */}
                <button
                    className={`fav-card__remove${removing ? ' fav-card__remove--busy' : ''}`}
                    onClick={handleRemove}
                    disabled={removing}
                    aria-label="Remove from favorites"
                    title="Remove from favorites"
                >
                    <FaHeart size={15} />
                </button>

                {/* Type badge */}
                <span className="fav-card__badge">
                    {propertyTypeLabel(property.property_type)}
                </span>
            </div>

            {/* Body */}
            <div className="fav-card__body">
                <h3 className="fav-card__title">{property.title || 'Untitled Property'}</h3>

                <p className="fav-card__location">
                    <FaMapMarkerAlt size={11} />
                    {property.city_name || property.address || 'Morocco'}
                </p>

                <div className="fav-card__meta">
                    {property.guests_total && (
                        <span className="fav-card__meta-item">
                            <FaUsers size={11} />
                            {property.guests_total} guests
                        </span>
                    )}
                    {property.bedrooms > 0 && (
                        <span className="fav-card__meta-item">
                            <FaBed size={11} />
                            {property.bedrooms} bed
                        </span>
                    )}
                    {property.bathrooms > 0 && (
                        <span className="fav-card__meta-item">
                            <FaBath size={11} />
                            {property.bathrooms} bath
                        </span>
                    )}
                </div>

                <div className="fav-card__footer">
                    <p className="fav-card__price">
                        <span className="fav-card__price-amount">
                            {Number(property.price_per_day).toLocaleString('en-MA')} MAD
                        </span>
                        <span className="fav-card__price-unit"> / night</span>
                    </p>
                    <button
                        className="fav-card__cta"
                        onClick={(e) => { e.stopPropagation(); onNavigate(property.id_property); }}
                    >
                        View
                    </button>
                </div>
            </div>
        </article>
    );
};

/* ─── EmptyState ──────────────────────────────────────────────────────── */
const EmptyState = ({ onExplore }) => (
    <div className="fav-empty">
        <div className="fav-empty__icon-ring">
            <FaHeart size={38} color="#00A9B5" />
        </div>
        <h2 className="fav-empty__title">No saved favorites yet</h2>
        <p className="fav-empty__desc">
            Browse properties and tap the heart icon to save the ones you love — they'll all appear here.
        </p>
        <button className="fav-empty__cta" onClick={onExplore}>
            <MdOutlineExplore size={18} />
            Explore Properties
        </button>
    </div>
);

/* ─── MyFavorites page ────────────────────────────────────────────────── */
const MyFavorites = () => {
    const { user, token } = useToken();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    /* fetch */
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const res = await axios.get(
                    buildApiUrl('/api/favorites'),
                    createAuthConfig(token),
                );
                setFavorites(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Error fetching favorites:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user && token) fetchFavorites();
    }, [user, token]);

    /* remove a favorite optimistically */
    const handleRemove = async (propertyId) => {
        setFavorites((prev) => prev.filter((p) => p.id_property !== propertyId));
        try {
            await axios.post(
                buildApiUrl('/api/favorites/toggle'),
                { id_property: propertyId },
                createAuthConfig(token),
            );
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    return (
        <>
            {/* ── Global styles (scoped) ─────────────────────────────── */}
            <style>{`
                /* Page shell */
                .fav-page {
                    min-height: 100vh;
                    background: #F7F4EB;
                    font-family: 'Inter', sans-serif;
                }

                /* Hero banner */
                .fav-hero {
                    background: linear-gradient(135deg, #0A2540 0%, #00A9B5 100%);
                    padding: 52px 5% 48px;
                    position: relative;
                    overflow: hidden;
                }
                .fav-hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 80% 50%, rgba(255,255,255,0.07) 0%, transparent 55%),
                        radial-gradient(circle at 20% 80%, rgba(0,169,181,0.15) 0%, transparent 45%);
                    pointer-events: none;
                }
                .fav-hero__inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    position: relative;
                    z-index: 1;
                }
                .fav-hero__eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 100px;
                    padding: 5px 14px;
                    color: rgba(255,255,255,0.9);
                    font-size: 0.78rem;
                    font-weight: 600;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 18px;
                }
                .fav-hero__title {
                    font-family: 'Playfair Display', serif;
                    font-size: clamp(2rem, 5vw, 3rem);
                    color: #fff;
                    margin: 0 0 10px;
                    line-height: 1.1;
                }
                .fav-hero__subtitle {
                    color: rgba(255,255,255,0.72);
                    font-size: 1rem;
                    margin: 0;
                    max-width: 440px;
                    line-height: 1.6;
                }
                .fav-hero__count {
                    margin-top: 20px;
                    display: inline-block;
                    background: rgba(255,255,255,0.15);
                    border-radius: 8px;
                    padding: 6px 16px;
                    color: #fff;
                    font-size: 0.88rem;
                    font-weight: 600;
                }

                /* Content area */
                .fav-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 5% 80px;
                }

                /* Grid */
                .fav-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                /* ── Card ── */
                .fav-card {
                    background: #fff;
                    border-radius: 18px;
                    overflow: hidden;
                    box-shadow: 0 2px 12px rgba(10, 37, 64, 0.06);
                    border: 1px solid rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: transform 0.22s ease, box-shadow 0.22s ease;
                    display: flex;
                    flex-direction: column;
                    outline: none;
                }
                .fav-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 32px rgba(10, 37, 64, 0.13);
                }
                .fav-card:focus-visible {
                    box-shadow: 0 0 0 3px rgba(0,169,181,0.45);
                }

                /* Image */
                .fav-card__img-wrap {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                    background: #EEE8DA;
                    flex-shrink: 0;
                }
                .fav-card__img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.4s ease;
                }
                .fav-card:hover .fav-card__img {
                    transform: scale(1.04);
                }
                .fav-card__img-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #EEE8DA 0%, #DDD4BA 100%);
                }

                /* Remove heart button */
                .fav-card__remove {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.92);
                    backdrop-filter: blur(4px);
                    color: #E53E3E;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.2s;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                }
                .fav-card__remove:hover {
                    background: #E53E3E;
                    color: #fff;
                    transform: scale(1.1);
                }
                .fav-card__remove--busy {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Badge */
                .fav-card__badge {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    background: rgba(10, 37, 64, 0.75);
                    backdrop-filter: blur(4px);
                    color: #fff;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 4px 10px;
                    border-radius: 100px;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                /* Body */
                .fav-card__body {
                    padding: 18px 18px 16px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .fav-card__title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #0A2540;
                    margin: 0 0 6px;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .fav-card__location {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 0.82rem;
                    color: #6B7280;
                    margin: 0 0 12px;
                }
                .fav-card__location svg {
                    color: #00A9B5;
                    flex-shrink: 0;
                }

                /* Meta row */
                .fav-card__meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .fav-card__meta-item {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #F7F4EB;
                    border-radius: 100px;
                    padding: 3px 10px;
                    font-size: 0.78rem;
                    color: #4B5563;
                    font-weight: 500;
                }
                .fav-card__meta-item svg {
                    color: #7A7034;
                }

                /* Footer */
                .fav-card__footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: auto;
                    padding-top: 14px;
                    border-top: 1px solid #F3F0E9;
                }
                .fav-card__price {
                    margin: 0;
                    line-height: 1;
                }
                .fav-card__price-amount {
                    font-size: 1.05rem;
                    font-weight: 700;
                    color: #0A2540;
                }
                .fav-card__price-unit {
                    font-size: 0.78rem;
                    color: #9CA3AF;
                }
                .fav-card__cta {
                    background: linear-gradient(135deg, #00A9B5 0%, #0d8a93 100%);
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 8px 18px;
                    font-size: 0.84rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                    letter-spacing: 0.01em;
                }
                .fav-card__cta:hover {
                    opacity: 0.88;
                    transform: translateY(-1px);
                }

                /* ── Empty state ── */
                .fav-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    padding: 80px 20px 60px;
                }
                .fav-empty__icon-ring {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    background: rgba(0,169,181,0.10);
                    border: 2px solid rgba(0,169,181,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                    animation: favPulse 2.5s ease-in-out infinite;
                }
                @keyframes favPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(0,169,181,0.2); }
                    50%       { box-shadow: 0 0 0 12px rgba(0,169,181,0); }
                }
                .fav-empty__title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.7rem;
                    color: #0A2540;
                    margin: 0 0 12px;
                }
                .fav-empty__desc {
                    color: #6B7280;
                    font-size: 0.97rem;
                    line-height: 1.65;
                    max-width: 400px;
                    margin: 0 0 28px;
                }
                .fav-empty__cta {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    background: linear-gradient(135deg, #00A9B5 0%, #0d8a93 100%);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 13px 28px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.2s;
                    box-shadow: 0 6px 20px rgba(0,169,181,0.30);
                }
                .fav-empty__cta:hover {
                    opacity: 0.88;
                    transform: translateY(-2px);
                }

                /* ── Skeleton loader ── */
                .fav-skeleton-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }
                .fav-skeleton-card {
                    background: #fff;
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .fav-skeleton-card__img {
                    height: 200px;
                    background: linear-gradient(90deg, #EEE8DA 25%, #E2DBCC 50%, #EEE8DA 75%);
                    background-size: 200% 100%;
                    animation: skeletonShimmer 1.4s infinite;
                }
                .fav-skeleton-card__body {
                    padding: 18px;
                }
                .fav-skeleton-card__line {
                    border-radius: 6px;
                    background: linear-gradient(90deg, #EEE8DA 25%, #E2DBCC 50%, #EEE8DA 75%);
                    background-size: 200% 100%;
                    animation: skeletonShimmer 1.4s infinite;
                    margin-bottom: 10px;
                }
                @keyframes skeletonShimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                /* Responsive */
                @media (max-width: 600px) {
                    .fav-hero { padding: 36px 6% 32px; }
                    .fav-content { padding: 28px 5% 60px; }
                    .fav-grid { grid-template-columns: 1fr; }
                    .fav-skeleton-grid { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="fav-page">
                <Header />

                {/* Hero banner */}
                <section className="fav-hero">
                    <div className="fav-hero__inner">
                        <span className="fav-hero__eyebrow">
                            <FaHeart size={11} /> My Saved Properties
                        </span>
                        <h1 className="fav-hero__title">My Favorites</h1>
                        <p className="fav-hero__subtitle">
                            All the properties you've saved in one place — revisit, compare, and book when you're ready.
                        </p>
                        {!loading && favorites.length > 0 && (
                            <span className="fav-hero__count">
                                {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
                            </span>
                        )}
                    </div>
                </section>

                {/* Main content */}
                <main className="fav-content">
                    {loading ? (
                        /* Skeleton */
                        <div className="fav-skeleton-grid">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="fav-skeleton-card">
                                    <div className="fav-skeleton-card__img" />
                                    <div className="fav-skeleton-card__body">
                                        <div className="fav-skeleton-card__line" style={{ height: 18, width: '75%' }} />
                                        <div className="fav-skeleton-card__line" style={{ height: 13, width: '50%' }} />
                                        <div className="fav-skeleton-card__line" style={{ height: 13, width: '60%', marginBottom: 0 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : favorites.length === 0 ? (
                        <EmptyState onExplore={() => navigate('/')} />
                    ) : (
                        <div className="fav-grid">
                            {favorites.map((property) => (
                                <FavoriteCard
                                    key={property.id_property}
                                    property={property}
                                    onNavigate={(id) => navigate(`/property-details/${id}`)}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    )}
                </main>

                {/* <Footer /> */}
            </div>
        </>
    );
};

export default MyFavorites;
