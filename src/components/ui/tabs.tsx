// © 2025 Joseph MULÉ – M1SSION™
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Tabs = ({ value, onValueChange, children, className, ...props }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(value || "");

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            onTabChange: handleTabChange,
          });
        }
        return child;
      })}
    </div>
  );
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children: React.ReactNode;
}

const TabsList = ({ className, activeTab, onTabChange, children, ...props }: TabsListProps) => (
  <div
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          activeTab,
          onTabChange,
        });
      }
      return child;
    })}
  </div>
);

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
  children: React.ReactNode;
}

const TabsTrigger = ({ className, value, activeTab, onTabChange, children, ...props }: TabsTriggerProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value
        ? "bg-background text-foreground shadow"
        : "text-muted-foreground hover:text-foreground",
      className
    )}
    onClick={() => onTabChange?.(value)}
    {...props}
  >
    {children}
  </button>
);

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  activeTab?: string;
  children: React.ReactNode;
}

const TabsContent = ({ className, value, activeTab, children, ...props }: TabsContentProps) => {
  if (activeTab !== value) return null;

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };