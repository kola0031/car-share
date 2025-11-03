const SectionLoader = () => {
  return (
    <section style={{ padding: '48px 0', display: 'grid', gap: 16 }} aria-busy="true" aria-live="polite">
      <div style={{ height: 28, width: 220, background: 'rgba(0,0,0,0.08)', borderRadius: 6 }} />
      <div style={{ height: 18, width: 380, background: 'rgba(0,0,0,0.06)', borderRadius: 6 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: 120, background: 'rgba(0,0,0,0.05)', borderRadius: 10 }} />)
        )}
      </div>
    </section>
  );
};

export default SectionLoader;


