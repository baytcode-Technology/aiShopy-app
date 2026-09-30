import { Redirect, type Href } from "expo-router";

export default function PlatformAdminWorkspaceIndex() {
  return <Redirect href={"/platform-admin-workspace/support" as Href} />;
}
