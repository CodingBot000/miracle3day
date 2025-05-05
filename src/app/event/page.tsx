import PageHeader from "@/components/molecules/header/page-header";

import { Metadata } from "next";
import { ItemList } from "./itemList";

export const metadata: Metadata = {
  title: "BeautyLink | Event",
};

const AllEventPage = () => {
  return (
    <>
      <PageHeader name="All Event" />
      <ItemList />
    </>
  );
};

export default AllEventPage;
