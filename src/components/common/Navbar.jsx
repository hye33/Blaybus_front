import './Navbar.css'
import logo from '../../assets/logo.png'

export default function Navbar({ tab, setTab }) {
  const items = ['HOME', 'STUDY', 'WORKFLOW', 'QUIZ']

  return (
    <nav className="nav">
      <div className="nav__brand">
        <img className="nav__logo" src={logo} alt="Logo" />
        <span className="nav__title">SIMVEX</span>
      </div>

      <div className="nav__menu">
        {items.map((label, idx) => (
          <button
            key={label}
            className={`nav__item ${tab === idx ? 'is-active' : ''}`}
            onClick={() => setTab(idx)}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}