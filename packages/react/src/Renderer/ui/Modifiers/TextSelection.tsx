import React from 'react';
import { EnvironmentStyleProvider, useEnvironmentStyle } from '../Style';
import { useLayout, LayoutNodeChildren } from '../Layout';

type TextSelectionValue = 'enabled' | 'disabled';

interface TextSelectionProps {
  rawValue: TextSelectionValue;
  children: React.ReactNode[];
}

export function TextSelection({ rawValue, children }: TextSelectionProps) {
  // Perform layout calculation
  const layout = useLayout({ rawValue, children }, TextSelection);
  
  const envStyle = {...useEnvironmentStyle()};
  envStyle.textSelection = rawValue;
  
  return (
    <EnvironmentStyleProvider style={envStyle}>
      <LayoutNodeChildren layout={layout}>
        {children}
      </LayoutNodeChildren>
    </EnvironmentStyleProvider>
  );
}