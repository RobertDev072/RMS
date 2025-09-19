import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  Car, 
  Users, 
  Calendar,
  PackageIcon,
  CreditCard,
  Bell,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface MobileProfileHeaderProps {
  userName: string;
  userRole: 'admin' | 'instructor' | 'student';
  onLogout: () => void;
}

export const MobileProfileHeader: React.FC<MobileProfileHeaderProps> = ({
  userName,
  userRole,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'instructor': return 'bg-blue-500';
      case 'student': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Beheerder';
      case 'instructor': return 'Instructeur';
      case 'student': return 'Leerling';
      default: return role;
    }
  };

  const menuItems = {
    admin: [
      { icon: Users, label: 'Leerlingen', path: '/students' },
      { icon: User, label: 'Instructeurs', path: '/instructors' },
      { icon: Car, label: 'Auto\'s', path: '/cars' },
      { icon: PackageIcon, label: 'Pakketten', path: '/packages' },
      { icon: CreditCard, label: 'Betalingen', path: '/payments' },
      { icon: Calendar, label: 'Agenda', path: '/calendar' },
    ],
    instructor: [
      { icon: Calendar, label: 'Mijn Agenda', path: '/schedule' },
      { icon: Users, label: 'Mijn Leerlingen', path: '/my-students' },
      { icon: Bell, label: 'Aanvragen', path: '/requests' },
      { icon: Clock, label: 'Schema', path: '/availability' },
    ],
    student: [
      { icon: Calendar, label: 'Mijn Lessen', path: '/my-lessons' },
      { icon: PackageIcon, label: 'Pakketten', path: '/packages' },
      { icon: CreditCard, label: 'Betalingen', path: '/my-payments' },
    ]
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-primary hidden sm:block">
              Rijschool Pro
            </span>
          </div>
        </div>

        {/* Mobile Menu + Profile */}
        <div className="flex items-center space-x-2">
          {/* Mobile Navigation Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle>Navigatie</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-1">
                {menuItems[userRole].map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start text-sm py-3"
                    onClick={() => {
                      navigate(item.path);
                      setIsMenuOpen(false);
                    }}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuItems[userRole].slice(0, 4).map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm" 
                onClick={() => navigate(item.path)}
                className="hover-scale text-sm"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 hover-scale"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${getRoleColor(userRole)} text-white font-medium`}>
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`${getRoleColor(userRole)} text-white`}>
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{userName}</p>
                  <Badge variant="outline" className="text-xs w-fit">
                    {getRoleLabel(userRole)}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Mijn Profiel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Instellingen</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Uitloggen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};