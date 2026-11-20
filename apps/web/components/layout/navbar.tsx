'use client';

import React from 'react';
import Link from 'next/link';
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
  Sparkles,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-black text-xl tracking-tight text-foreground flex items-center gap-1.5 transition-transform hover:scale-[1.01]"
        >
          <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-black shadow-sm">
            C
          </span>
          <span>
            Campus<span className="text-primary">Flow</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground">
          <Link
            href="/directory"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Directory</span>
          </Link>
          <Link
            href="/transport"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <Bus className="w-4 h-4 text-slate-400" />
            <span>Transport</span>
          </Link>
          <Link
            href="/housing"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Housing</span>
          </Link>
          <Link
            href="/events"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Events</span>
          </Link>
          <Link
            href="/learning"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Academic</span>
          </Link>
          <Link
            href="/cart"
            className="hover:text-foreground transition flex items-center gap-1.5 font-semibold text-foreground relative"
          >
            <ShoppingCart className="w-4 h-4 text-primary" />
            <span>Cart</span>
            {itemCount > 0 && (
              <Badge
                variant="default"
                className="h-5 px-1.5 text-[10px] font-black rounded-full"
              >
                {itemCount}
              </Badge>
            )}
          </Link>
          <Link
            href="/merchant/dashboard"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span>Merchant</span>
          </Link>
          <Link
            href="/admin/verifications"
            className="hover:text-foreground transition flex items-center gap-1"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Admin</span>
          </Link>
        </div>

        {/* User Account / Auth Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-border">
                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight text-foreground truncate max-w-[120px]">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    Student
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 px-2 text-destructive hover:bg-destructive/10 text-xs font-medium"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline ml-1">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="h-8 text-xs font-bold shadow-sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
