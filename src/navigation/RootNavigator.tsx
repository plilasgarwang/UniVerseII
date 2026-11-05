import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import { AuthStackParamList, MainTabParamList, ToolsStackParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import NoticeFeedScreen from '../screens/NoticeFeedScreen';
import TimetableScreen from '../screens/TimetableScreen';
import ToolsScreen from '../screens/ToolsScreen';
import GradeCalculatorScreen from '../screens/GradeCalculatorScreen';
import LibraryCardScreen from '../screens/LibraryCardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ToolsStack = createNativeStackNavigator<ToolsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bgScreen, primary: colors.primary },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

// Tools is its own stack so Grade Calculator / Library Card keep the bottom tabs
// and get a back button, like the Project I app.
function ToolsNavigator() {
  return (
    <ToolsStack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.bgScreen },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.bgScreen },
      }}
    >
      <ToolsStack.Screen name="ToolsHome" component={ToolsScreen} options={{ headerShown: false }} />
      <ToolsStack.Screen name="GradeCalculator" component={GradeCalculatorScreen} options={{ title: '', headerBackTitle: 'Tools' }} />
      <ToolsStack.Screen name="LibraryCard" component={LibraryCardScreen} options={{ title: '', headerBackTitle: 'Tools' }} />
    </ToolsStack.Navigator>
  );
}

const ICONS: Record<keyof MainTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ['home', 'home-outline'],
  Timetable: ['calendar', 'calendar-outline'],
  Tools: ['apps', 'apps-outline'],
  Profile: ['person', 'person-outline'],
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: { height: 60 + insets.bottom, paddingBottom: insets.bottom + 6, paddingTop: 6 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={NoticeFeedScreen} />
      <Tab.Screen name="Timetable" component={TimetableScreen} />
      <Tab.Screen name="Tools" component={ToolsNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgScreen }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>{user ? <MainTabs /> : <AuthNavigator />}</NavigationContainer>
  );
}
