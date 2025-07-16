import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Platform,
  Alert,
  SafeAreaView,
  StatusBar
} from "react-native";
import { MotiView } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import CommandCenterHome from "@/components/command-center/CommandCenterHome";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfileImage } from "@/hooks/useProfileImage";
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import NotificationsBanner from "@/components/notifications/NotificationsBanner";
import BottomNavigation from "@/components/layout/BottomNavigation";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import DeveloperAccess from "@/components/auth/DeveloperAccess";

const AppHome = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { profileImage } = useProfileImage();
  const isMobile = useIsMobile();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCapacitor, setIsCapacitor] = useState(false);
  const insets = useSafeAreaInsets();
  
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
    notificationsBannerOpen,
    openNotificationsBanner,
    closeNotificationsBanner
  } = useNotificationManager();

  const { isConnected } = useRealTimeNotifications();

  // Check for developer access and mobile environment
  useEffect(() => {
    const checkAccess = () => {
      // Always allow access for React Native app
      setHasAccess(true);
      setIsCapacitor(false);
      
      console.log('AppHome access check:', { isMobile: true, isCapacitor: false });
    };
    
    checkAccess();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Real-time notification connection status:", isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (error) {
      Alert.alert("Errore", error, [{ text: "OK" }]);
    }
  }, [error]);

  // Show developer access screen for mobile users without access
  if (isMobile && !hasAccess) {
    return <DeveloperAccess />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#070818" />
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Errore</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              // Restart the app or reset state
            }}
          >
            <LinearGradient
              colors={['#dc2626', '#b91c1c']}
              style={styles.retryButtonGradient}
            >
              <Text style={styles.retryButtonText}>Riprova</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070818" />
      
      {/* Unified Header - same as other pages */}
      <UnifiedHeader profileImage={profileImage} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 119, paddingBottom: insets.bottom + 80 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoaded && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500 }}
            style={styles.mainContent}
          >
            {notificationsBannerOpen && (
              <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -20 }}
                transition={{ type: 'timing', duration: 300 }}
                style={[
                  styles.notificationBanner,
                  { top: insets.top + 119 }
                ]}
              >
                <NotificationsBanner
                  notifications={notifications}
                  open={notificationsBannerOpen}
                  unreadCount={unreadCount}
                  onClose={closeNotificationsBanner}
                  onMarkAllAsRead={markAllAsRead}
                  onDeleteNotification={deleteNotification}
                />
              </MotiView>
            )}

            <View style={styles.headerContainer}>
              <MotiView
                from={{ opacity: 0, translateY: -10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500, delay: 200 }}
                style={styles.titleContainer}
              >
                <View style={styles.titleRow}>
                  <Text style={styles.titleM1}>M1</Text>
                  <Text style={styles.titleSSION}>SSION</Text>
                  <Text style={styles.trademark}>™</Text>
                </View>
                <Text style={styles.subtitle}>Centro di Comando Agente</Text>
              </MotiView>
            </View>

            <View style={styles.mainContainer}>
              <CommandCenterHome />
            </View>
          </MotiView>
        )}
      </ScrollView>
      
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070818',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  notificationBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 40,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginVertical: 24,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  titleM1: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00D1FF',
    textShadowColor: 'rgba(0, 209, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleSSION: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trademark: {
    fontSize: 14,
    color: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  mainContainer: {
    flex: 1,
    paddingBottom: 80,
  },
  // Error screen styles
  errorContainer: {
    flex: 1,
    backgroundColor: '#070818',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorContent: {
    padding: 32,
    backgroundColor: 'rgba(153, 27, 27, 0.3)',
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCA5A5',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AppHome;

// Copyright © 2025 Joseph M1SSION KFT