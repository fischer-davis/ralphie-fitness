import { Link, useLocation } from "@tanstack/react-router"
import { useSession, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  Library,
  TrendingUp,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { ReactNode, useState } from "react"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: ReactNode
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Templates", href: "/templates", icon: ListChecks },
  { name: "Exercises", href: "/exercises", icon: Library },
  { name: "Progress", href: "/progress", icon: TrendingUp },
]

const secondaryNavigation: NavItem[] = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(href)
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">Ralphie Fitness</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1 px-2">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-center">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(session?.user.name, session?.user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session?.user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">Ralphie Fitness</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-card">
            <nav className="px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}

              <Separator className="my-2" />

              {secondaryNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                )
              })}

              <Separator className="my-2" />

              <button
                onClick={() => {
                  signOut()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Main content area */}
      <main className="flex-1 lg:pl-64 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
