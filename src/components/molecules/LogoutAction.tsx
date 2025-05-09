import Button from "@/components/atoms/button";
import { ROUTE } from "@/router";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const LogoutAction = async () => {
  const handleLogout = async () => {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();

    revalidatePath("/", "layout");
    redirect(ROUTE.HOME);
  };

  return (
    <form action={handleLogout}>
      <Button color="red" variant="outline">
        LOGOUT
      </Button>
    </form>
  );
};

export default LogoutAction;
