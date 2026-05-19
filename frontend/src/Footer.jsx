import Logo from "./assets/dardarek-logo.png";
import { useThemeGlobal } from "./Contexts/ThemeContext";
import { Link } from "react-router-dom";

export default function Footer() {
    const themeGlobal = useThemeGlobal();

    return (
        <footer className="site-footer">
            <div className="site-footer__shell">
                <div className="site-footer__brand">
                    <img src={Logo} alt="Dar Darek logo" className="site-footer__logo" />
                    <div>
                        <h2 className="font-luxury site-footer__title">Dar Darek</h2>
                        <p className="site-footer__tagline">
                            Find calm stays across northern Morocco with a local spirit and a warm welcome.
                        </p>
                    </div>
                </div>

                <div className="site-footer__links">
                    <div className="site-footer__column">
                        <h3 className="site-footer__heading">Explore</h3>
                        <Link to="/properties" className="site-footer__link">Latest stays</Link>
                        <Link to="/properties?city=Tangier" className="site-footer__link">Tangier homes</Link>
                        <Link to="/properties?city=Tetouan" className="site-footer__link">Tetouan homes</Link>
                        <Link to="/properties?city=Chefchaouen" className="site-footer__link">Chefchaouen stays</Link>
                    </div>

                    <div className="site-footer__column">
                        <h3 className="site-footer__heading">Hosting & Account</h3>
                        <Link to="/account-settings" className="site-footer__link">Account Settings</Link>
                        <Link to="/publish" className="site-footer__link">List your property</Link>
                        <Link to="/my-properties" className="site-footer__link">My properties</Link>
                        <Link to="/privacy-policy" className="site-footer__link">Privacy Policy</Link>
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
                    style={{ backgroundColor: themeGlobal.colors.lineSeparetor }}
                />
                <span>Feel at home in the north</span>
            </div>
        </footer>
    );
}
