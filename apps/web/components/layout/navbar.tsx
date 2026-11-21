'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bus,
  Home,
  Calendar,
  BookOpen,
  ShoppingCart,
  Compass,
  Store,
  Shield,
  LogOut,
  Package,
  Clock,
  PhoneCall,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const isMerchant = user?.roles?.includes('merchant') || user?.roles?.includes('admin');
  const isAdmin = user?.roles?.includes('admin');
  const primaryRole = user?.roles?.[0]
    ? user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1)
    : 'Student';

  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Top Institutional Status & Emergency Bar */}
      <div className="bg-slate-900 text-white text-xs px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-slate-100">Haramaya University</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-300">Main Campus (Bate) &bull; Academic Term 2026/27</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="font-mono flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" /> 14:45 EAT
            </span>
            <span className="text-slate-600">|</span>
            <a
              href="tel:0255530112"
              className="text-rose-300 hover:text-white font-semibold flex items-center gap-1 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Clinic Hotline: 025-553-0112
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-2 transition hover:opacity-90"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-xs">
            C
          </span>
          <span>
            Campus<span className="text-indigo-600">Flow</span>
          </span>
        </Link>

        {/* Primary Navigation Links (Student-Focused) */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link
            href="/directory"
            className="hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Directory</span>
          </Link>
          <Link
            href="/transport"
            className="hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <Bus className="w-4 h-4 text-slate-400" />
            <span>Transport</span>
          </Link>
          <Link
            href="/housing"
            className="hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Housing</span>
          </Link>
          <Link
            href="/events"
            className="hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Events</span>
          </Link>
          <Link
            href="/learning"
            className="hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Academic</span>
          </Link>

          {/* Student Orders Link */}
          {user && (
            <Link
              href="/orders"
              className="hover:text-indigo-600 transition flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>My Orders</span>
            </Link>
          )}

          {/* Role-Gated: Merchant Portal (Only if merchant or admin) */}
          {isMerchant && (
            <Link
              href="/merchant/dashboard"
              className="text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition flex items-center gap-1.5 font-bold"
            >
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>Merchant</span>
            </Link>
          )}

          {/* Role-Gated: Admin Portal (Only if admin) */}
          {isAdmin && (
            <Link
              href="/admin/verifications"
              className="text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition flex items-center gap-1.5 font-bold"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Right Section: Cart + User Profile / Auth */}
        <div className="flex items-center gap-3">
          
          {/* Shopping Cart Trigger */}
          <Link
            href="/cart"
            className="relative p-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-bold"
            title="View Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <Badge
                variant="default"
                className="h-4 min-w-[16px] px-1 text-[10px] font-black rounded-full bg-indigo-600 text-white"
              >
                {itemCount}
              </Badge>
            )}
          </Link>

          {/* User Account / Auth Actions */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition group"
                title="View Profile & Digital ID"
              >
                <Avatar className="h-8 w-8 border border-slate-200 bg-indigo-50 group-hover:border-indigo-400 transition">
                  <AvatarFallback className="text-xs font-bold bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[130px]">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700">
                    {primaryRole}
                  </span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-8 px-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

        </div>
      </nav>
    </header>
  );
}
