import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ActivitySquare,
  LogOut,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  Dumbbell,
  GitCompare,
  Calendar,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from './ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';

interface MenuItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  permission: string | null;
  showFor: string[];
  submenu?: MenuItem[];
}

export function Layout() {
  const { user, signOut } = useAuth();
  const { can, role } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const isParent = role === 'parent';

  const navigationItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ActivitySquare,
      permission: null,
      showFor: ['admin', 'lead_coach', 'academy_coach', 'fitness_trainer', 'parent'],
    },
    {
      name: 'Athletes',
      icon: Users,
      permission: 'manage_athletes',
      showFor: ['admin', 'lead_coach', 'academy_coach'],
      submenu: [
        {
          name: 'Athletes List',
          href: '/athletes',
          icon: Users,
          permission: 'manage_athletes',
          showFor: ['admin', 'lead_coach', 'academy_coach'],
        },
        {
          name: 'Comparison',
          href: '/comparison',
          icon: GitCompare,
          permission: 'manage_assessments',
          showFor: ['admin', 'lead_coach'],
        },
        {
          name: 'Reports',
          href: '/reports',
          icon: BarChart3,
          permission: 'view_reports',
          showFor: ['admin', 'lead_coach'],
        },
      ],
    },
    {
      name: 'Assessments',
      icon: ClipboardList,
      permission: 'manage_assessments',
      showFor: ['admin', 'lead_coach', 'academy_coach', 'fitness_trainer'],
      submenu: [
        {
          name: 'Record Assessments',
          href: '/assessments',
          icon: ClipboardList,
          permission: 'manage_assessments',
          showFor: ['admin', 'lead_coach', 'academy_coach', 'fitness_trainer'],
        },
        {
          name: 'Test Protocols',
          href: '/protocols',
          icon: Dumbbell,
          permission: 'manage_assessments',
          showFor: ['admin', 'lead_coach'],
        },
      ],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: Calendar,
      permission: 'manage_assessments',
      showFor: ['admin', 'lead_coach', 'academy_coach', 'fitness_trainer'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      permission: 'manage_users',
      showFor: ['admin'],
    },
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const renderMenuItem = (item: MenuItem, isSubmenuItem = false) => {
    if (!item.showFor.includes(role) || (item.permission && !can(item.permission))) {
      return null;
    }

    const isActive = item.href ? location.pathname === item.href : false;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus.includes(item.name);

    return (
      <div key={item.name} className={cn("relative", !isSubmenuItem && "mb-1")}>
        {item.href ? (
          <Link
            to={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-900 hover:bg-gray-50 hover:text-blue-600",
              isSubmenuItem && "pl-10"
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.name}
          </Link>
        ) : (
          <button
            onClick={() => toggleSubmenu(item.name)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isExpanded ? "bg-gray-50 text-blue-600" : "text-gray-900 hover:bg-gray-50 hover:text-blue-600"
            )}
          >
            <span className="flex items-center">
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </span>
            {hasSubmenu && (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            )}
          </button>
        )}
        {hasSubmenu && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.submenu.map(subItem => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <Link to="/dashboard" className="flex items-center">
                <ActivitySquare className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  6.fitness athlete manager
                </span>
              </Link>
            </div>

            <div className="flex items-center ml-4">
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize whitespace-nowrap">
                  {user?.role.replace('_', ' ')}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center whitespace-nowrap"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-4">
          <div className="space-y-1">
            {navigationItems.map(item => renderMenuItem(item))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}