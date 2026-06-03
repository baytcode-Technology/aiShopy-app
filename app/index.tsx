import { AppLogo } from "@/components/brand/AppLogo";
import { useAuth } from "@src/contexts/auth-context";
import Colors from "@src/theme/colors";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isLoading, isAuthenticated, googleAuthInProgress } = useAuth();

  if (isLoading || googleAuthInProgress) {
    return (
      <View className="flex-1 items-center justify-center bg-surface gap-6">
        <AppLogo variant="wordmark" align="center" className="mb-6" />
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/store-check" />;
  }

  return <Redirect href="/(auth)/login" />;
}
