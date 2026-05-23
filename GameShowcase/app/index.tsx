import { Redirect } from "expo-router";
import { useAuthSession } from "@/hooks/useAuthSession";
import mobileAds from 'react-native-google-mobile-ads';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useEffect } from "react";

export default function Index() {
  const { user, loading } = useAuthSession();
  useEffect(() => {
    async function requestAdPermission() {
      const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      if (result === RESULTS.DENIED) {
        // The permission has not been requested, so request it.
        request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
      }
    }
    
    requestAdPermission();
  }, []);
  
  mobileAds()
    .initialize()
    .then(adapterStatuses => {
      console.log('AdMob initialized:', adapterStatuses);
    });

  if (loading) {
    return null;
  }

  return <Redirect href={user ? "/games" : "/account"} />;
}
