import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToken } from './Contexts/TokenContext';
import { buildApiUrl, createAuthConfig } from './lib/api';
import Header from './Home components/Header';
import { FaHeart, FaMapMarkerAlt, FaBed, FaBath, FaUsers, FaHome, FaEye, FaTrash } from 'react-icons/fa';
import { MdOutlineExplore } from 'react-icons/md';
import './MyFavorites.css';

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

/* ─── FavoriteRow ────────────────────────────────────────────────────── */
const FavoriteRow = ({ property, onNavigate, onRemove }) => {
    const imageSrc = getImageSrc(property.main_image);
    const [imgError, setImgError] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleRemove = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        await onRemove(property.id_property);
    };

    return (
        <div 
            className="fav-row"
            onClick={() => onNavigate(property.id_property)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate(property.id_property)}
        >
            <div className="fav-row__property">
                <div className="fav-row__img-wrap">
                    {imageSrc && !imgError ? (
                        <img
                            src={imageSrc}
                            alt={property.title}
                            className="fav-row__img"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE8DA'}}>
                            <FaHome size={24} color="#C4B89A" />
                        </div>
                    )}
                </div>
                <div className="fav-row__prop-info">
                    <h4>{property.title || 'Untitled Property'}</h4>
                    <p><FaMapMarkerAlt size={12} /> {property.city_name || property.address || 'Morocco'}</p>
                    <span className="fav-row__meta-badge" style={{marginTop: 6}}>
                        {propertyTypeLabel(property.property_type)}
                    </span>
                </div>
            </div>

            <div className="fav-row__meta">
                {property.guests_total > 0 && (
                    <span className="fav-row__meta-badge">
                        <FaUsers size={12} /> {property.guests_total} guests
                    </span>
                )}
                {property.bedrooms > 0 && (
                    <span className="fav-row__meta-badge">
                        <FaBed size={12} /> {property.bedrooms} bed
                    </span>
                )}
                {property.bathrooms > 0 && (
                    <span className="fav-row__meta-badge">
                        <FaBath size={12} /> {property.bathrooms} bath
                    </span>
                )}
            </div>

            <div className="fav-row__price">
                <h4>{Number(property.price_per_day).toLocaleString('en-MA')} MAD</h4>
                <p>per night</p>
            </div>

            <div className="fav-row__actions">
                <button 
                    className="action-btn action-btn--primary" 
                    onClick={(e) => { e.stopPropagation(); onNavigate(property.id_property); }}
                >
                    <FaEye /> View
                </button>
                <button 
                    className={`action-btn action-btn--danger${removing ? ' action-btn--busy' : ''}`}
                    onClick={handleRemove}
                    disabled={removing}
                >
                    <FaTrash /> Remove
                </button>
            </div>
        </div>
    );
};

/* ─── EmptyState ──────────────────────────────────────────────────────── */
const EmptyState = ({ onExplore }) => (
    <div className="fav-empty">
        <div className="fav-empty__icon-ring">
            <FaHeart size={30} />
        </div>
        <h3>No saved favorites yet</h3>
        <p>Browse properties and tap the heart icon to save the ones you love — they'll all appear here.</p>
        <button className="action-btn action-btn--primary" onClick={onExplore} style={{width: 'auto', padding: '12px 24px'}}>
            <MdOutlineExplore size={18} /> Explore Properties
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
        <div className="fav-page">
            <Header />
            <div className="fav-wrapper">
                <div className="fav-header">
                    <h1 className="fav-title">My Favorites</h1>
                    <p className="fav-subtitle">All the properties you've saved in one place — revisit, compare, and book when you're ready.</p>
                </div>

                <div className="fav-content-section">
                    <div className="fav-list-toolbar">
                        <h2>Saved Properties</h2>
                        {!loading && favorites.length > 0 && (
                            <span className="fav-count-badge">
                                {favorites.length} {favorites.length === 1 ? 'Property' : 'Properties'}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="fav-skeleton-list">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="fav-skeleton-row">
                                    <div className="fav-skeleton-img" />
                                    <div style={{flex: 1}}>
                                        <div className="fav-skeleton-line" style={{width: '60%'}} />
                                        <div className="fav-skeleton-line" style={{width: '40%'}} />
                                    </div>
                                    <div style={{flex: 1}}>
                                        <div className="fav-skeleton-line" style={{width: '80%'}} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : favorites.length === 0 ? (
                        <EmptyState onExplore={() => navigate('/')} />
                    ) : (
                        <div className="fav-list">
                            {favorites.map((property) => (
                                <FavoriteRow
                                    key={property.id_property}
                                    property={property}
                                    onNavigate={(id) => navigate(`/property-details/${id}`)}
                                    onRemove={handleRemove}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyFavorites;
