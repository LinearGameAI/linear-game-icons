'use client'

import * as SvgComs from '@yoroll/react-icon'
import { useEffect, useMemo, useRef, useState } from 'react'

type IconEntry = [string, React.ComponentType<SvgComs.IconProps>]
type CategoryId = 'all' | 'interface' | 'game' | 'media' | 'social' | 'filled'
type Theme = 'light' | 'dark'

const COLORS = ['currentColor', '#ff5a36', '#6957e8', '#0f9f6e', '#2878ff']
const SIZES = [20, 24, 30, 32]
const INSTALL_COMMAND = 'pnpm add @yoroll/react-icon'

const CATEGORIES: Array<{
  id: CategoryId
  label: string
  keywords?: string[]
}> = [
  { id: 'all', label: 'All icons' },
  {
    id: 'interface',
    label: 'Interface',
    keywords: [
      'add', 'arrow', 'check', 'close', 'copy', 'cursor', 'delete', 'document',
      'download', 'edit', 'expand', 'filter', 'folder', 'home', 'layout', 'link',
      'lock', 'menu', 'more', 'search', 'setting', 'share', 'upload',
    ],
  },
  {
    id: 'game',
    label: 'Game',
    keywords: [
      'game', 'controller', 'battle', 'chapter', 'scene', 'map', 'trophy',
      'rank', 'reward', 'weapon', 'skill', 'target', 'role', 'team', 'player',
    ],
  },
  {
    id: 'media',
    label: 'Media',
    keywords: [
      'play', 'pause', 'volume', 'sound', 'music', 'video', 'camera', 'image',
      'record', 'mic', 'voice', 'screen', 'frame',
    ],
  },
  {
    id: 'social',
    label: 'Social',
    keywords: [
      'comment', 'chat', 'message', 'mail', 'user', 'people', 'friend', 'like',
      'heart', 'emoji', 'community', 'share', 'notification',
    ],
  },
  {
    id: 'filled',
    label: 'Filled',
    keywords: ['filled'],
  },
]

const iconEntries = Object.entries(SvgComs).filter(
  ([, component]) => typeof component === 'function',
) as IconEntry[]

const displayName = (name: string) =>
  name
    .replace(/^Icon/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')

const matchesCategory = (name: string, category: CategoryId) => {
  if (category === 'all') return true
  const keywords = CATEGORIES.find((item) => item.id === category)?.keywords ?? []
  const normalized = name.toLowerCase()
  return keywords.some((keyword) => normalized.includes(keyword))
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.2A8.2 8.2 0 0 1 8.8 4a8.2 8.2 0 1 0 11.2 11.2Z" />
    </svg>
  )
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light',
  )
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(24)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryId>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const featuredIcons = iconEntries.slice(0, 15)
  const filteredIcons = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return iconEntries.filter(([name]) => {
      const matchesSearch =
        !normalizedSearch ||
        name.toLowerCase().includes(normalizedSearch) ||
        displayName(name).toLowerCase().includes(normalizedSearch)
      return matchesSearch && matchesCategory(name, category)
    })
  }, [category, search])

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusSearch)
    return () => {
      window.removeEventListener('keydown', focusSearch)
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const showCopied = (label: string) => {
    setCopied(label)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(null), 1800)
  }

  const copyText = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    showCopied(label)
  }

  const copyIcon = (name: string) => {
    const snippet = `import { ${name} } from '@yoroll/react-icon'\n\n<${name} size={${size}} color="${color}" />`
    void copyText(snippet, name)
  }

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem('lg-icons-theme', nextTheme)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Linear Game Icons home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>Linear Game Icons</span>
        </a>

        <nav className="site-nav" aria-label="Main navigation">
          <a href="#icons">Icons</a>
          <a href="#install">Install</a>
          <a
            href="https://github.com/LinearGameAI/linear-game-icons"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            suppressHydrationWarning
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="theme-icon theme-icon-sun"><SunIcon /></span>
            <span className="theme-icon theme-icon-moon"><MoonIcon /></span>
            <span className="theme-toggle-knob" />
          </button>
          <a
            className="header-cta"
            href="https://www.npmjs.com/package/@yoroll/react-icon"
            target="_blank"
            rel="noreferrer"
          >
            View on npm
            <ArrowIcon />
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero page-width">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Open source · React &amp; React Native
            </div>
            <h1>
              Icons made for
              <span> game interfaces.</span>
            </h1>
            <p className="hero-description">
              A focused icon set for games, creative tools, and interactive products.
              Consistent, lightweight, and ready to drop into your next interface.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#icons">
                Explore {iconEntries.length} icons
                <ArrowIcon />
              </a>
              <button
                className="install-command"
                type="button"
                onClick={() => void copyText(INSTALL_COMMAND, 'install')}
                aria-label="Copy install command"
              >
                <span className="terminal-caret">›</span>
                <code>{INSTALL_COMMAND}</code>
                <span className="command-copy">
                  {copied === 'install' ? <CheckIcon /> : <CopyIcon />}
                </span>
              </button>
            </div>

            <div className="hero-meta" aria-label="Library highlights">
              <div>
                <strong>{iconEntries.length}</strong>
                <span>carefully drawn icons</span>
              </div>
              <div>
                <strong>2</strong>
                <span>platform packages</span>
              </div>
              <div>
                <strong>SVG</strong>
                <span>crisp at every size</span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-label="A sample of icons from the library">
            <div className="visual-glow visual-glow-one" />
            <div className="visual-glow visual-glow-two" />
            <div className="visual-toolbar">
              <span className="visual-logo">LG</span>
              <div>
                <strong>Interface kit</strong>
                <span>{iconEntries.length} assets</span>
              </div>
              <span className="visual-status">Ready</span>
            </div>
            <div className="featured-grid">
              {featuredIcons.map(([name, Icon], index) => (
                <div
                  className={`featured-icon featured-icon-${(index % 5) + 1}`}
                  key={name}
                  title={name}
                >
                  <Icon size={index % 4 === 0 ? 30 : 25} color="currentColor" />
                </div>
              ))}
            </div>
            <div className="visual-footer">
              <div className="visual-avatars">
                <span>R</span>
                <span>RN</span>
              </div>
              <span>Built for product teams</span>
              <div className="visual-pulse" />
            </div>
          </div>
        </section>

        <section className="marquee-band" aria-label="Library qualities">
          <div className="marquee-track page-width">
            <span>Pixel perfect</span>
            <i />
            <span>Tree shakeable</span>
            <i />
            <span>TypeScript ready</span>
            <i />
            <span>React Native</span>
            <i />
            <span>Open source</span>
          </div>
        </section>

        <section className="icon-section page-width" id="icons">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Icon explorer</span>
              <h2>Find the right symbol, fast.</h2>
            </div>
            <p>
              Search by name, tune the preview, then click any icon to copy a
              ready-to-use React snippet.
            </p>
          </div>

          <div className="explorer">
            <div className="explorer-toolbar">
              <label className="search-field">
                <SearchIcon />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search icons…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search ? (
                  <button type="button" onClick={() => setSearch('')}>
                    Clear
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
              </label>

              <div className="preview-controls">
                <div className="control-group" aria-label="Icon color">
                  <span className="control-label">Color</span>
                  <div className="color-options">
                    {COLORS.map((swatch) => (
                      <button
                        type="button"
                        key={swatch}
                        className={color === swatch ? 'active' : ''}
                        style={{ '--swatch': swatch } as React.CSSProperties}
                        onClick={() => setColor(swatch)}
                        aria-label={swatch === 'currentColor' ? 'Use theme color' : `Use ${swatch}`}
                        aria-pressed={color === swatch}
                      />
                    ))}
                  </div>
                </div>

                <div className="control-group size-control" aria-label="Icon size">
                  <span className="control-label">Size</span>
                  <div className="size-options">
                    {SIZES.map((option) => (
                      <button
                        type="button"
                        key={option}
                        className={size === option ? 'active' : ''}
                        onClick={() => setSize(option)}
                        aria-pressed={size === option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="category-row">
              <div className="category-tabs" role="tablist" aria-label="Icon categories">
                {CATEGORIES.map((item) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={category === item.id}
                    className={category === item.id ? 'active' : ''}
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <span className="result-count">
                <strong>{filteredIcons.length}</strong> results
              </span>
            </div>

            {filteredIcons.length > 0 ? (
              <div className="icon-grid">
                {filteredIcons.map(([name, Icon]) => {
                  const isCopied = copied === name
                  return (
                    <button
                      type="button"
                      className={`icon-card${isCopied ? ' copied' : ''}`}
                      onClick={() => copyIcon(name)}
                      key={name}
                      title={`Copy ${name}`}
                    >
                      <span className="icon-stage">
                        <Icon size={size} color={color} />
                      </span>
                      <span className="icon-name">
                        {isCopied ? 'Copied!' : displayName(name)}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-mark">?</span>
                <h3>No icons found</h3>
                <p>Try another keyword or switch back to all icons.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setCategory('all')
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="install-section" id="install">
          <div className="install-inner page-width">
            <div className="install-copy">
              <span className="section-kicker light">Quick start</span>
              <h2>From install to interface in a minute.</h2>
              <p>
                Pick the package for your platform. Every icon is typed, customizable,
                and individually importable.
              </p>
              <div className="platform-pills">
                <span>React</span>
                <span>Next.js</span>
                <span>React Native</span>
                <span>Expo</span>
              </div>
            </div>

            <div className="code-card">
              <div className="code-card-header">
                <div>
                  <span className="window-dot red" />
                  <span className="window-dot amber" />
                  <span className="window-dot green" />
                </div>
                <span>Example.tsx</span>
              </div>
              <pre>
                <code>
                  <span className="code-purple">import</span>{' { '}
                  <span className="code-yellow">IconGame</span>
                  {' } '}<span className="code-purple">from</span>{' '}
                  <span className="code-green">&apos;@yoroll/react-icon&apos;</span>
                  {'\n\n'}
                  <span className="code-muted">{'// Built to match your interface'}</span>
                  {'\n'}
                  <span className="code-blue">&lt;IconGame</span>{' '}
                  <span className="code-yellow">size</span>=&#123;24&#125;{' '}
                  <span className="code-yellow">color</span>=
                  <span className="code-green">&quot;currentColor&quot;</span>{' '}
                  <span className="code-blue">/&gt;</span>
                </code>
              </pre>
              <button
                type="button"
                className="code-install"
                onClick={() => void copyText(INSTALL_COMMAND, 'install-bottom')}
              >
                <code>$ {INSTALL_COMMAND}</code>
                {copied === 'install-bottom' ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-inner">
          <div className="brand footer-brand">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span>Linear Game Icons</span>
          </div>
          <p>Open-source icons for playful, expressive interfaces.</p>
          <div className="footer-links">
            <a href="https://github.com/LinearGameAI/linear-game-icons" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@yoroll/react-icon" target="_blank" rel="noreferrer">
              npm
            </a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </footer>

      <div className={`copy-toast${copied ? ' visible' : ''}`} role="status" aria-live="polite">
        <span><CheckIcon /></span>
        {copied?.startsWith('Icon') ? `${copied} snippet copied` : 'Install command copied'}
      </div>
    </div>
  )
}
