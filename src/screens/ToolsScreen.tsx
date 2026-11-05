import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, Header, Screen } from '../components/ui';
import { colors } from '../theme';
import { ToolsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ToolsStackParamList, 'ToolsHome'>;

export default function ToolsScreen({ navigation }: Props) {
  const tools = [
    {
      key: 'GradeCalculator' as const,
      icon: 'calculator-outline' as const,
      title: 'Grade Calculator',
      text: 'Calculate your GPA and keep a history of past results',
    },
    {
      key: 'LibraryCard' as const,
      icon: 'card-outline' as const,
      title: 'Digital Library Card',
      text: 'View your ID and barcode for library access',
    },
  ];
  return (
    <Screen>
      <Header subtitle="UniVerse" title="Tools" />
      {tools.map((t) => (
        <Card key={t.key} onPress={() => navigation.navigate(t.key)} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 46, height: 46, borderRadius: 12, backgroundColor: colors.primaryLight,
              alignItems: 'center', justifyContent: 'center', marginRight: 14,
            }}
          >
            <Ionicons name={t.icon} size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{t.title}</Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 3 }}>{t.text}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Card>
      ))}
    </Screen>
  );
}
