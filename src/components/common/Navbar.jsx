import './Navbar.css'
import logoSimvex from '../../assets/logo_simvex.png'

export default function Navbar({ tab, setTab, onClickLogo }) {
  const items = [
  { label: 'HOME', tab: 1 },
  { label: 'STUDY', tab: 2 },
  { label: 'WORKFLOW', tab: 3 },
  { label: 'QUIZ', tab: 4 },
]

  return (
    <nav className="nav">
      <div
        className="nav__brand"
        onClick={onClickLogo}
        role='button'
        tabIndex={0}
      >
        <img className="nav__logo" src={logoSimvex} alt="Logo" />
        <span className="nav__title">SIMVEX</span>
      </div>

      <div className="nav__menu">
        {items.map(({ label, tab: tabIdx }) => (
          <button
            key={label}
            className={`nav__item ${tab === tabIdx ? 'is-active' : ''}`}
            onClick={() => setTab(tabIdx)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}