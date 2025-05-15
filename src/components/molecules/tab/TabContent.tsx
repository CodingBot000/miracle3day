const TabContent = ({ component: Component }: { component: JSX.Element }) => {
  return <div className="max-w-[768px] mx-auto px-4">{Component}</div>;
};

export default TabContent;
