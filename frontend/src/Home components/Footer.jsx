import Logo from "../assets/Logo2.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__shell">
        <div className="site-footer__brand">
          <img src={Logo} alt="Dar Darek logo" className="site-footer__logo" />
          <div>
            <h2 className="font-luxury site-footer__title">Dar Darek</h2>
            <p className="site-footer__tagline">
              Find calm stays across northern Morocco with a local spirit and a
              warm welcome.
            </p>
          </div>
        </div>

        <div className="site-footer__links">
          <div className="site-footer__column">
            <h3 className="site-footer__heading">Explore</h3>
            <a href="/" className="site-footer__link">
              Latest stays
            </a>
            <a href="/" className="site-footer__link">
              Tangier homes
            </a>
            <a href="/" className="site-footer__link">
              Tetouan homes
            </a>
            <a href="/" className="site-footer__link">
              Chefchaouen stays
            </a>
          </div>

          <div className="site-footer__column">
            <h3 className="site-footer__heading">Hosting</h3>
            <a href="/" className="site-footer__link">
              List your property
            </a>
            <a href="/" className="site-footer__link">
              Host guide
            </a>
            <a href="/" className="site-footer__link">
              Trust & safety
            </a>
            <a href="/" className="site-footer__link">
              Support
            </a>
          </div>

          <div className="site-footer__column">
            <h3 className="site-footer__heading">Contact</h3>
            <p className="site-footer__meta">Tangier, Morocco</p>
            <p className="site-footer__meta">contact@dardarek.ma</p>
            <p className="site-footer__meta">+212 6 00 00 00 00</p>
          </div>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>© 2026 Dar Darek</span>
        <span
          className="site-footer__dot"
          style={{ backgroundColor: "#e2e8f0" }}
        />
        <span>Feel at home in the north</span>
      </div>
    </footer>
  );
}
