import * as React from 'react';
import { createContext, useContext, useState, forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import { Box, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material';

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a <Tabs> component');
  }
  return context;
};

interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
}

export const Tabs = ({ children, defaultValue }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <Box>{children}</Box>
    </TabsContext.Provider>
  );
};

export const TabsList = forwardRef<
  ElementRef<typeof MuiTabs>,
  ComponentPropsWithoutRef<typeof MuiTabs>
>(({ children, className, ...props }, ref) => {
  const { activeTab, setActiveTab } = useTabs();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <MuiTabs
        ref={ref}
        value={activeTab}
        onChange={handleChange}
        {...props}
      >
        {children}
      </MuiTabs>
    </Box>
  );
});
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof MuiTab> {
    value: string;
}
export const TabsTrigger = forwardRef<
  ElementRef<typeof MuiTab>,
  TabsTriggerProps
>(({ value, children, ...props }, ref) => {
  return (
    <MuiTab
      ref={ref}
      value={value}
      label={children}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
}
export const TabsContent = ({ value, children }: TabsContentProps) => {
  const { activeTab } = useTabs();

  return activeTab === value ? <Box sx={{ p: 3 }}>{children}</Box> : null;
};
TabsContent.displayName = "TabsContent";