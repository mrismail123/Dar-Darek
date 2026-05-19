import { Link } from "react-router-dom";
import "./PrivacyPolicy.css";

function PrivacyPolicy() {
  return (
    <main className="privacy-policy-page">
      <div className="privacy-policy-container">
        <header className="privacy-policy-header">
          <Link to="/" className="privacy-policy-brand">
            DarDarek
          </Link>
          <p className="privacy-policy-date">Last updated: May 2026</p>
          <h1>Privacy Policy</h1>
          <p className="privacy-policy-intro">
            At DarDarek, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, process, use, and share information about you when you access our platform, use our services to book accommodations, or list your properties in Northern Morocco. Please read this document carefully to understand our practices regarding your personal data.
          </p>
        </header>

        <article className="privacy-policy-content">
          <section>
            <h2>1. Information We Collect</h2>
            <p>We collect information in three primary ways: information you voluntarily provide to us, information collected automatically through your use of the platform, and information obtained from third parties.</p>
            <ul>
              <li><strong>Account and Profile Data:</strong> When you create an account, we collect your first and last name, email address, phone number, and account credentials. You may also choose to provide a profile photo, bio, emergency contact, and preferred languages.</li>
              <li><strong>Booking and Listing Data:</strong> If you are a guest, we collect details regarding your reservations, dates of travel, and payment preferences. If you are a host, we collect property addresses, descriptions, pricing, calendar availability, and compliance documentation.</li>
              <li><strong>Communications:</strong> We collect information when you communicate with our customer support team or exchange messages with other users on the DarDarek platform.</li>
              <li><strong>Technical and Usage Data:</strong> We automatically collect data regarding your device, browser type, IP address, operating system, pages visited, and interaction history to ensure platform functionality and security.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>The information we collect is strictly used to operate, improve, and secure the DarDarek platform. The primary legal bases for processing your data include the fulfillment of our terms of service and our legitimate business interests.</p>
            <ul>
              <li><strong>To Provide Services:</strong> Facilitating your bookings, processing payments, establishing communication between hosts and guests, and delivering customer support.</li>
              <li><strong>To Maintain Safety and Trust:</strong> Verifying identities, detecting and preventing fraudulent activities, enforcing our terms of service, and ensuring physical and digital security.</li>
              <li><strong>Platform Improvement:</strong> Analyzing user behavior, conducting research, and optimizing the design and features of DarDarek to better serve the Northern Moroccan community and travelers.</li>
              <li><strong>Legal Compliance:</strong> Complying with applicable legal requirements, responding to valid legal requests, and resolving disputes.</li>
            </ul>
          </section>

          <section>
            <h2>3. Information Sharing and Disclosure</h2>
            <p>We do not sell your personal data. We may share your information only in specific, necessary circumstances:</p>
            <ul>
              <li><strong>Between Users:</strong> To facilitate a booking, we share necessary information between guests and hosts (such as your name, profile photo, and booking dates). Contact information is shared only once a reservation is confirmed.</li>
              <li><strong>Service Providers:</strong> We may share data with trusted third-party vendors who assist us in operating our platform, such as payment processors, cloud hosting services, and SMS delivery systems. These providers are strictly bound by confidentiality agreements.</li>
              <li><strong>Legal and Regulatory Authorities:</strong> We may disclose information if required by law, subpoena, or other legal processes, or if necessary to protect the rights, property, and safety of DarDarek, our users, or the public.</li>
            </ul>
          </section>

          <section>
            <h2>4. Cookies and Tracking Technologies</h2>
            <p>
              DarDarek utilizes cookies, local storage, and similar technologies to maintain your authenticated sessions, remember your site preferences (such as language and currency), and measure platform performance. These are essential for the core functionality of the website. By continuing to use DarDarek, you consent to our use of these essential technologies. You maintain the right to disable non-essential cookies via your browser settings, though this may impact your user experience.
            </p>
          </section>

          <section>
            <h2>5. Data Retention and Security</h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures to safeguard your personal information against unauthorized access, destruction, or alteration. These measures include strict password encryption, protected API routes, and regular security audits.
            </p>
            <p>
              We retain your personal data only for as long as is necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Once an account is permanently deleted, your personal data is securely erased or anonymized.
            </p>
          </section>

          <section>
            <h2>6. Your User Rights</h2>
            <p>Subject to applicable data protection laws, you hold specific rights regarding your personal information. DarDarek is committed to helping you exercise these rights:</p>
            <ul>
              <li><strong>Access and Correction:</strong> You can access, review, and update your profile information and contact details at any time via your Account Settings.</li>
              <li><strong>Data Portability:</strong> You may request a copy of the personal data you have provided to us in a structured, commonly used format.</li>
              <li><strong>Account Deactivation and Deletion:</strong> You have the right to request the suspension or permanent deletion of your account. Upon a valid deletion request, we will remove your personal data, save for information we are legally required to retain.</li>
            </ul>
          </section>

          <section className="privacy-policy-contact">
            <h2>7. Contact Us</h2>
            <p>
              We welcome your questions, comments, and concerns about this Privacy Policy. If you wish to exercise your data rights or require further clarification on how DarDarek handles your information, please contact our dedicated support team:
            </p>
            <p>
              <strong>Email:</strong> <a href="mailto:support@dardarek.ma">testingalles123@gmail.com</a><br />
              <strong>Office Address:</strong> Tangier, Morocco
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}

export default PrivacyPolicy;
