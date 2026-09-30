import { Redirect, type Href } from "expo-router";

export default function PlatformAdminUsersRedirect() {
  return <Redirect href={"/platform-admin-workspace/users" as Href} />;
}
