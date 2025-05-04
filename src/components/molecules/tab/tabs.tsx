import React, { useState, ReactNode } from 'react';
import Tab from './tab';

interface TabsProps {
  children: ReactNode[];
}
const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const firstChild = React.Children.toArray(children)[0];
    if (firstChild && React.isValidElement(firstChild)) {
      return firstChild.props.label;
    }
    return '';
  });

  const handleTabClick = (tabLabel: string) => {
    setActiveTab(tabLabel);
  };

  return (
    <div className="tabs">
      {children.map((child: any) => (
        <Tab
          key={child.props.label}
          label={child.props.label}
          onClick={handleTabClick}
          activeTab={activeTab}
        />
      ))}
      <div className="tab-content">
        {children.map((child: any) =>
          child.props.label === activeTab ? child.props.children : null
        )}
      </div>
    </div>
  );
};

export default Tabs;