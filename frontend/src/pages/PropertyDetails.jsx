import "./PropertyDetails.css";
// Import de l'image depuis le dossier assets
import propertyImage from "../assets/chaouen-bg.jpg";

// c'est le composant de la page de "property details"
export default function PropertyDetails() {
  const property = {
    title: "Beautiful Apartement with Sea view",
    city: "Tangier",
    neighborhood: "Malabata",
    price: 750,
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    beds: 3,
    description:
      "A bright and modern apartment with a stunning sea view, located in a calm and secure area.",
    amenties: ["WiFi", "Air conditioning", "Kitchen", "Parking"],
    images: propertyImage,
  };

  return (
    <main className="property-details-page">
      <section className="property-hero">
        <img
          src={property.images}
          alt={property.title}
          className="property-hero__image"
        />

        <div className="property-hero__content">
          <h1>{property.title}</h1>

          <p>
            {property.city} • {property.neighborhood}
          </p>

          <strong>{property.price} MAD / night</strong>
        </div>
      </section>

      <section className="property-capacity">
        <div className="capacity-item">
          <span>{property.guests}</span>
          <p>Guests</p>
        </div>

        <div className="capacity-item">
          <span>{property.bedrooms}</span>
          <p>Bedrooms</p>
        </div>

        <div className="capacity-item">
          <span>{property.bathrooms}</span>
          <p>Bathrooms</p>
        </div>

        <div className="capacity-item">
          <span>{property.beds}</span>
          <p>Beds</p>
        </div>
      </section>
      <section className="property-description">
        <h2>About this property</h2>

        <p>{property.description}</p>
      </section>
    </main>
  );
}
