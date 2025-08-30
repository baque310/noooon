import { cookies } from "next/headers";
import ComponentPage from "./_components/componentPage";

const page = () => {
  const token_refresh = cookies().get("token_refresh");
  const token_access = cookies().get("token_access");
  return (
    <>
      <ComponentPage
        token_refresh={token_refresh?.value as string}
        token_access={token_access?.value as string}
      />
    </>
  );
};

export default page;
