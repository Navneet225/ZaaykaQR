export default function CategoryBar({ categories, active, onSelect }) {
  return (
    <div className="cats">
      {categories.map(cat => (
        <button
          key={cat}
          className={`cat-pill${active === cat ? ' active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
