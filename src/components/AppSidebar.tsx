
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Home,
  Search,
  Users,
  Settings,
  Menu,
  Newspaper,
  ListChecks,
} from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { FileText } from 'lucide-react';

export const AppSidebar = () => {
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  const pathName = window.location.pathname;
  const { pathname } = useLocation();

  const navigation = [
    {
      name: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/',
      current: pathName === '/',
    },
    {
      name: 'Search',
      icon: <Search className="h-5 w-5" />,
      href: '/search/bronx',
      current: pathName.startsWith('/search'),
    },
    {
      name: 'Voter Lists',
      icon: <ListChecks className="h-5 w-5" />,
      href: '/voter-lists',
      current: pathName === '/voter-lists',
    },
    {
      name: 'Surveys',
      icon: <Newspaper className="h-5 w-5" />,
      href: '/surveys',
      current: pathName === '/surveys',
    },
    {
      name: 'Petitions',
      icon: <FileText className="h-5 w-5" />,
      href: '/petitions',
      current: pathName === '/petitions',
    },
    {
      name: 'Users',
      icon: <Users className="h-5 w-5" />,
      href: '/users',
      current: pathName === '/users',
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
      current: pathName === '/settings',
    },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-2xl px-2">BallotBase</span>
        </Link>
      </div>
      <div className="flex-1">
        <Accordion type="single" collapsible className="w-full">
          {navigation.map((item) => (
            <AccordionItem value={item.name} key={item.name}>
              <AccordionTrigger
                onClick={() => {
                  navigate(item.href);
                }}
                className={`data-[state=open]:bg-secondary text-lg font-medium hover:underline px-4 py-3 ${item.current ? 'bg-secondary' : ''
                  }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-8 pb-4">
                This is the content for {item.name}.
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <Separator />
      <div className="p-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} BallotBase
        </p>
      </div>
    </div>
  );

  if (!isMobile) {
    return (
      <aside className="w-60 border-r flex-shrink-0 hidden md:block">
        {renderSidebarContent()}
      </aside>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-60 p-0">
        <SheetHeader className="text-left px-4 pt-4">
          <SheetTitle>BallotBase</SheetTitle>
          <SheetDescription>
            Navigate the application.
          </SheetDescription>
        </SheetHeader>
        {renderSidebarContent()}
      </SheetContent>
    </Sheet>
  );
};
