import { useLocation, Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";

export type BreadcrumbLink = {
  title: string;
  path?: string;
};

type Props = {
  links?: BreadcrumbLink[];
  customLabels?: Record<string, string>;
};

const generateBreadcrumbsFromPath = (
  pathname: string,
  customLabels: Record<string, string> = {}
): BreadcrumbLink[] => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbLink[] = [
    { title: "Home", path: "/" }
  ];

  let currentPath = "";
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    const isLast = index === segments.length - 1;
    const title = customLabels[segment] || 
                  customLabels[currentPath] || 
                  segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbs.push({
      title,
      path: isLast ? undefined : currentPath
    });
  });

  return breadcrumbs;
};

const SiteBreadcrumb = ({ links, customLabels = {} }: Props) => {
  const location = useLocation();
  
  const breadcrumbs = links || generateBreadcrumbsFromPath(location.pathname, customLabels);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          
          {index === 0 && <Home className="h-4 w-4 mr-1" />}
          
          {crumb.path ? (
            <Link 
              to={crumb.path} 
              className="hover:text-foreground transition-colors"
            >
              {crumb.title}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {crumb.title}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default SiteBreadcrumb;
