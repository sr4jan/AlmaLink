'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function RoleBasedNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const studentLinks = [
    { href: '/ideahub', label: 'IdeaHub' },
    { href: '/questions', label: 'Questions' },
    { href: '/jobportal', label: 'Jobs' },
    { href: '/donationportal', label: 'Donations' },
    { href: '/events', label: 'Events' },
    { href: '/livesessions', label: 'Live Sessions' },
    { href: '/connections', label: 'Connections' },
  ];

  const alumniLinks = [
    { href: '/ideahub', label: 'IdeaHub' },
    { href: '/jobportal/post', label: 'Post Jobs' },
    { href: '/events/create', label: 'Create Event' },
    { href: '/livesessions/host', label: 'Host Session' },
    { href: '/donationportal', label: 'Donations' },
    { href: '/connections', label: 'Connections' },
  ];

  const links = session?.user?.role === 'alumni' ? alumniLinks : studentLinks;

  if (!session) return null;

  return (
    <>
      {/* Desktop Navigation */}
      <div className="linksContainer">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`navLink ${pathname === link.href ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation */}
      <button
        className="md:hidden p-2 text-white hover:text-blue-400 transition-colors"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[64px] left-0 right-0 bg-[#0f0f23]/95 backdrop-blur-md border-b border-white/10 p-4 space-y-2 animate-slideDown">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-[#00c6ff] hover:bg-white/5 transition-all ${
                pathname === link.href ? 'text-[#00c6ff] bg-white/5' : ''
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}