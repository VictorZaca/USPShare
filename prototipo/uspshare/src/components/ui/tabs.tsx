import * as React from 'react';
import { createContext, useContext, useState, forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react';
import { Box, Tabs as MuiTabs, Tab as MuiTab } from '@mui/material';

// --- Parte 1: O Contexto (O "Cérebro" do Sistema) ---
// Este contexto irá compartilhar o estado da aba ativa entre todos os componentes filhos.

interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

// Hook customizado para facilitar o uso do contexto
const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a <Tabs> component');
  }
  return context;
};


// --- Parte 2: Os Componentes Exportados ---

// 1. O Componente Raiz <Tabs>
// Sua única função é criar o estado e fornecer para os filhos via Context.
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


// 2. O Componente <TabsList>
// É um wrapper para o <MuiTabs> que se conecta ao nosso contexto.
export const TabsList = forwardRef<
  ElementRef<typeof MuiTabs>,
  ComponentPropsWithoutRef<typeof MuiTabs>
>(({ children, className, ...props }, ref) => {
  const { activeTab, setActiveTab } = useTabs();

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
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


// 3. O Componente <TabsTrigger>
// É um wrapper para o <MuiTab>.
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


// 4. O Componente <TabsContent>
// Ele usa o contexto para saber se deve ou não ser renderizado.
interface TabsContentProps {
    value: string;
    children: React.ReactNode;
}
export const TabsContent = ({ value, children }: TabsContentProps) => {
  const { activeTab } = useTabs();

  // Renderiza os filhos apenas se o 'value' deste componente for igual ao 'activeTab' do contexto.
  return activeTab === value ? <Box sx={{ p: 3 }}>{children}</Box> : null;
};
TabsContent.displayName = "TabsContent";