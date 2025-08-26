'use client'

import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMe } from '@/features/auth/hooks'
import { clearTokens } from '@/lib/token'


// Example user data (swap with your store/auth)

const HeaderNavbar: React.FC = () => {
  const { data: me } = useMe();
  const isVerified = me?.is_verified ?? false
  const userName = me?.first_name + " " + me?.last_name
  const avatarSrc = '/default.jpg'
  const isLoggedIn = !!me?.first_name
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const handleSignOut = () => {
    clearTokens();
    router.replace("/");
    setTimeout(() => router.refresh(), 0);
  }

  // Active when exact match or on a sub-route. Handle '/' safely.
  const isActive = (target: string) => {
    if (target === '/') return pathname === '/'
    return pathname === target || pathname.startsWith(`${target}/`)
  }

  const linkClass = (target: string) => {
    const active =
      'text-[#004899] border border-[#004899] rounded-full py-[10px] px-[16px] cursor-pointer'
    const inactive =
      'border border-transparent hover:underline rounded-full py-[10px] px-[16px] cursor-pointer'
    return isActive(target) ? active : inactive
  }

  const goto = (href: string) => () => {
    router.push(href)
    setOpen(false) // only affects mobile
  }

  // --- Mobile UX niceties: click outside, ESC to close, focus management, scroll lock
  useEffect(() => {
    if (!open) return
    const restore = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)

      // simple focus trap
      if (e.key === 'Tab' && menuRef.current) {
        const focusables = menuRef.current.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // focus first item on open
    setTimeout(() => {
      const first = menuRef.current?.querySelector<HTMLElement>('a,button')
      first?.focus()
    }, 0)

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = restore
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <nav className="sticky top-0 left-0 right-0 flex items-center bg-white/70 text-[#002353] px-4 md:px-[46px] h-[80px] md:h-[96px] justify-between border-b-2 border-[#ECF4FF] backdrop-blur-[3px] z-50">
      {/* Logo */}
      <div className="flex gap-2 items-center cursor-pointer" onClick={goto('/')}>
        <Image src="/logo.svg" alt="Logo" width={40} height={40} className="inline-block" />
        <h1 className="text-[18px] md:text-[20px] font-bold">Hiraya Homes</h1>
      </div>

      {/* Desktop menu */}
      <ul className="hidden md:flex list-none gap-2 text-[16px] font-medium">
        <li><a onClick={goto('/')} className={linkClass('/')}>Home</a></li>
        <li><a onClick={goto('/browse/rent')} className={linkClass('/browse/rent')}>Rent</a></li>
        <li><a onClick={goto('/browse/buy')} className={linkClass('/browse/buy')}>Buy</a></li>
        <li><a onClick={goto('/sell')} className={linkClass('/sell')}>Sell</a></li>
      </ul>

      {/* Right side (desktop): show auth buttons OR profile menu */}
      {!isLoggedIn ? (
        <div className="hidden md:flex border border-[#E6E8EE] rounded-full items-center gap-[15px] h-14 px-[7px] py-[9px]">
          <a
            onClick={goto('/auth?login')}
            className="text-[#002353] text-[18px] px-[15px] inline-flex items-center h-full leading-none cursor-pointer"
          >
            Login
          </a>
          <button
            onClick={goto('/auth?register')}
            className="text-white text-[18px] font-medium rounded-full bg-[#004899] px-[15px] inline-flex items-center justify-center h-full leading-none cursor-pointer hover:brightness-105"
          >
            Get started
          </button>
        </div>
      ) : (
        <UserMenu
          name={userName}
          avatarSrc={avatarSrc}
          isVerified={isVerified}
          onSignOut={handleSignOut}
          onDashboard={() => router.push('/dashboard')}
        />
      )}

      {/* Mobile hamburger */}
      <button
        ref={buttonRef}
        className="md:hidden text-[#002353] focus:outline-none text-[18px]"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-haspopup="menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        ☰
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          className="absolute top-full right-0 mt-2 bg-white/95 backdrop-blur-md shadow-md border border-[#ECF4FF] rounded-xl
               flex flex-col items-end text-right pl-4 pr-4 pt-4 pb-4 gap-3 md:hidden max-h:[calc(100vh-100px)] max-h-[calc(100vh-100px)] overflow-y-auto overscroll-contain z-50
               transition"
          role="menu"
          aria-label="Mobile menu"
        >
          {/* Nav links */}
          <a onClick={goto('/')} className={`${linkClass('/')} focus-visible:outline-2 focus-visible:outline-[#004899] focus-visible:outline-offset-2 self-end`} role="menuitem">
            Home
          </a>
          <a onClick={goto('/browse/rent')} className={`${linkClass('/browse/rent')} focus-visible:outline-2 focus-visible:outline-[#004899] focus-visible:outline-offset-2 self-end`} role="menuitem">
            Rent
          </a>
          <a onClick={goto('/browse/buy')} className={`${linkClass('/browse/buy')} focus-visible:outline-2 focus-visible:outline-[#004899] focus-visible:outline-offset-2 self-end`} role="menuitem">
            Buy
          </a>
          <a onClick={goto('/sell')} className={`${linkClass('/sell')} focus-visible:outline-2 focus-visible:outline-[#004899] focus-visible:outline-offset-2 self-end`} role="menuitem">
            Sell
          </a>

          {/* Divider */}
          <div className="h-px w-full bg-[#ECF4FF] my-1" />

          {/* Account actions (mobile): conditional */}
          {isLoggedIn ? (
            <>
              <button onClick={() => { goto('/dashboard')(); }} className="text-[#0B1F3A] text-[16px] px-[15px] py-[7px] rounded-lg hover:bg-[#F5F8FF] focus-visible:outline-2 focus-visible:outline-[#004899] focus-visible:outline-offset-2" role="menuitem">
                Dashboard
              </button>
              <button onClick={() => { handleSignOut(); setOpen(false); }} className="text-[#D12B2B] text-[16px] px-[15px] py-[7px] rounded-lg hover:bg-[#FFF2F2] focus-visible:outline-2 focus-visible:outline-[#D12B2B]/40 focus-visible:outline-offset-2" role="menuitem" aria-label="Sign out">
                Sign out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { goto('/auth?login')(); }} className="text-[#0B1F3A] text-[16px] px-[15px] py-[7px] rounded-lg hover:bg-[#F5F8FF] focus-visible:outline-2 focus-visible:outline-[#004899] focus-visible:outline-offset-2" role="menuitem">
                Login
              </button>
              <button onClick={() => { goto('/auth?register')(); }} className="text-white bg-[#004899] text-[16px] px-[15px] py-[7px] rounded-lg hover:brightness-105 focus-visible:outline-2 focus-visible:outline-[#004899]/40 focus-visible:outline-offset-2" role="menuitem">
                Get started
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

export default HeaderNavbar

/* ---------- Menu component (unchanged) ---------- */
function UserMenu({
  name,
  avatarSrc,
  isVerified,
  onSignOut,
  onDashboard: onProfile,
}: {
  name: string
  avatarSrc: string
  isVerified: boolean
  onSignOut: () => void
  onDashboard: () => void
}) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return
      const t = e.target as Node
      if (menuRef.current?.contains(t)) return
      if (btnRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(v => !v)}
        className="
          group items-center gap-2 rounded-full
          border border-[#E8EEF8] bg-white px-2.5 sm:px-3 py-1.5
          hover:bg-[#F5F8FF] hidden lg:inline-flex 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]/40
        "
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <div className="relative h-10 w-10">
          <Image
            src={avatarSrc}
            alt=""
            fill
            sizes="40px"
            className={['rounded-full object-cover ring-2', isVerified ? 'ring-[#CAEAD7]' : 'ring-[#E8EEF8]'].join(' ')}
            priority
          />
          <span
            className={[
              'absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center',
              'w-4 h-4 rounded-full border border-white shadow-sm',
              isVerified ? 'bg-[#0B8F55]' : 'bg-[#D12B2B]',
            ].join(' ')}
            title={isVerified ? 'Account verified' : 'Account not verified'}
          >
            <svg viewBox="0 0 20 20" className="w-3 h-3 text-white" aria-hidden>
              {isVerified ? (
                <path fill="currentColor" d="M8.5 13.3 5.7 10.5l1.1-1.1 1.7 1.7 4-4 1.1 1.1-5.1 5.1z" />
              ) : (
                <path fill="currentColor" d="M10 6.5 6.5 10 10 13.5 13.5 10 10 6.5z" />
              )}
            </svg>
            <span className="sr-only">{isVerified ? 'Verified' : 'Unverified'}</span>
          </span>
        </div>

        <span className="hidden lg:block text-sm font-medium text-[#0B1F3A] max-w-[160px] truncate">
          {name}
        </span>
        <svg viewBox="0 0 24 24" className="hidden lg:block w-4 h-4 text-[#5C7188] transition-transform group-aria-expanded:rotate-180" aria-hidden>
          <path d="M7 10l5 5 5-5" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className="
            absolute right-0 mt-2 w-56 origin-top-right
            rounded-xl border border-[#E8EEF8] bg-white shadow-lg
            p-1.5
          "
        >
          <MenuItem onClick={() => { setOpen(false); onProfile(); }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path fill="currentColor" d="M3 3h9v7H3zM12 3h9v7h-9zM3 12h18v9H3z" />
            </svg>
            Dashboard
          </MenuItem>
          <div className="my-1 h-px bg-[#E8EEF8]" />
          <MenuItem destructive onClick={() => { setOpen(false); onSignOut(); }}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
              <path fill="currentColor" d="M16 17l5-5-5-5v3H9v4h7v3zM4 5h7V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7v-2H4V5z" />
            </svg>
            Sign out
          </MenuItem>
        </div>
      )}
    </div>
  )
}

function MenuItem({
  children,
  onClick,
  destructive = false,
}: {
  children: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
        'hover:bg-[#F5F8FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3871C1]/40',
        destructive ? 'text-[#D12B2B] hover:bg-[#FFF2F2]' : 'text-[#0B1F3A]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}
