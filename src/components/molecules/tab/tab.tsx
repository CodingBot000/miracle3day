import React from 'react';

interface TabProps {
  label: string;
  activeTab: string;
  onClick: (label: string) => void;
}

const Tab: React.FC<TabProps> = ({ label, activeTab, onClick }) => {
  const handleClick = () => {
    onClick(label);
  };

  return (
    <div
      className={`tab ${activeTab === label ? 'active' : ''}`}
      onClick={handleClick}
    >
      {label}
    </div>
  );
};

export default Tab;
