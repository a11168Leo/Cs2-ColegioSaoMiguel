export default function SectionCard({ title, subtitle, actions, children }) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
