'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, clearToken, isLoggedIn } from '@/lib/api';
import { adminNav, navGroups } from '@/lib/nav-config';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeSwitcher } from '@/components/custom/theme-switcher';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [adminName, setAdminName] = useState('Админ');

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }
    api
      .me()
      .then((res) => setAdminName(res.data.user.name))
      .catch(() => {
        clearToken();
        router.replace('/login');
      })
      .finally(() => setReady(true));
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">
              V
            </div>
            <div>
              <p className="font-semibold">VitalMen</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.key}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNav
                    .filter((item) => item.group === group.key)
                    .map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={<Link href={item.href} />}
                          isActive={pathname === item.href}
                          className="rounded-lg data-active:bg-[#e8f8f5] data-active:text-[#1abc9c] data-active:font-semibold [&_svg]:data-active:text-[#1abc9c]"
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-4">
          <p className="truncate text-sm font-medium">{adminName}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground"
            onClick={() => {
              clearToken();
              router.push('/login');
            }}
          >
            <LogOut className="size-4" />
            Гарах
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">VitalMen апп бүрэн удирдлага</span>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex-1 bg-background p-6 md:p-8 [&_.rounded-lg.border]:shadow-none">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
