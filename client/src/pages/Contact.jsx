export default function Contact() {
  return (
    <section className="content-section">
      <div className="section-heading">
        <p className="pill">Contact</p>
        <h2>Get in touch with Edgepoint</h2>
      </div>
      <div className="card">
        <p>
          Looking for reliable IT support? Edgepoint provides responsive, professional IT services
          for businesses across New Zealand, with proactive support that keeps your team productive.
        </p>
        <p>
          Whether you need help with troubleshooting, network support, cybersecurity, or ongoing IT
          management, the team is ready to help you build a seamless technology experience.
        </p>
        <p>
          Email: <a href="mailto:support@edgepoint.co.nz">support@edgepoint.co.nz</a>
        </p>
      </div>
      <div className="split-grid">
        <div className="card accent">
          <h3>Auckland CBD</h3>
          <p>501 Mt Wellington Highway, Auckland</p>
          <p>Located within Commercial Realty Building, serving Auckland CBD.</p>
          <a className="secondary" href="https://goo.gl/maps/3qjuq3aNnmJj28647" target="_blank" rel="noreferrer">
            Show on map
          </a>
        </div>
        <div className="card accent">
          <h3>South Auckland</h3>
          <p>2 London Street, Pukekohe, Auckland</p>
          <p>Edgepoint Head Office, serving South Auckland.</p>
          <a className="secondary" href="https://goo.gl/maps/MWpv9nMD3DbLXrSB6" target="_blank" rel="noreferrer">
            Show on map
          </a>
        </div>
        <div className="card accent">
          <h3>Palmerston North</h3>
          <p>140 The Square, Palmerston North Central</p>
          <p>Located within RD Techshop Building, serving Manawatu areas.</p>
          <a className="secondary" href="https://goo.gl/maps/75P73UPTxgJx7gES8" target="_blank" rel="noreferrer">
            Show on map
          </a>
        </div>
      </div>
    </section>
  );
}