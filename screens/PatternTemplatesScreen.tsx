import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PatternTemplate, GarmentType } from '@/types';
import { withOpacity } from '@/utils/colorUtils';

type PatternStackParamList = {
  PatternTemplates: undefined;
  PatternGenerator: { templateId: string; customerId?: string; orderId?: string };
  PatternViewer: { patternInstanceId: string };
};

const GARMENT_ICONS: Record<GarmentType, keyof typeof Feather.glyphMap> = {
  blouse: 'grid',
  kurti: 'layout',
  salwar: 'scissors',
  frock: 'star',
  shirt: 'user',
  pants: 'menu',
  lehenga: 'layers',
  other: 'box',
};

const mockTemplates: PatternTemplate[] = [
  {
    id: '1',
    name: 'Basic Saree Blouse',
    garmentType: 'blouse',
    description: 'Traditional saree blouse pattern with front and back pieces, sleeves, and neckline options.',
    measurementFields: [
      { key: 'bust', label: 'Bust (inches)', required: true },
      { key: 'waist', label: 'Waist (inches)', required: true },
      { key: 'shoulderWidth', label: 'Shoulder Width (inches)', required: true },
      { key: 'frontLength', label: 'Front Length (inches)', required: true },
      { key: 'backLength', label: 'Back Length (inches)', required: true },
      { key: 'sleeveLength', label: 'Sleeve Length (inches)', required: true },
      { key: 'armhole', label: 'Armhole (inches)', required: true },
    ],
    optionsSchema: {
      sleeveType: { label: 'Sleeve Type', options: ['short', 'elbow', 'full', 'sleeveless'], default: 'short' },
      neckType: { label: 'Neck Type', options: ['round', 'boat', 'sweetheart', 'square'], default: 'round' },
      ease: { label: 'Ease (inches)', type: 'number', default: 2 },
    },
    formulaVersion: '1.0',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Kids Frock',
    garmentType: 'frock',
    description: 'Simple A-line kids frock pattern with bodice and gathered skirt.',
    measurementFields: [
      { key: 'chest', label: 'Chest (inches)', required: true },
      { key: 'waist', label: 'Waist (inches)', required: true },
      { key: 'shoulderWidth', label: 'Shoulder Width (inches)', required: true },
      { key: 'totalLength', label: 'Total Length (inches)', required: true },
      { key: 'bodiceLength', label: 'Bodice Length (inches)', required: true },
      { key: 'armhole', label: 'Armhole (inches)', required: true },
    ],
    optionsSchema: {
      sleeveType: { label: 'Sleeve Type', options: ['puff', 'short', 'sleeveless'], default: 'puff' },
      skirtStyle: { label: 'Skirt Style', options: ['gathered', 'aline', 'flared'], default: 'gathered' },
      ease: { label: 'Ease (inches)', type: 'number', default: 2 },
    },
    formulaVersion: '1.0',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Simple Kurti',
    garmentType: 'kurti',
    description: 'Straight-cut kurti pattern with side slits and sleeve options.',
    measurementFields: [
      { key: 'bust', label: 'Bust (inches)', required: true },
      { key: 'waist', label: 'Waist (inches)', required: true },
      { key: 'hips', label: 'Hips (inches)', required: true },
      { key: 'shoulderWidth', label: 'Shoulder Width (inches)', required: true },
      { key: 'totalLength', label: 'Total Length (inches)', required: true },
      { key: 'sleeveLength', label: 'Sleeve Length (inches)', required: true },
      { key: 'armhole', label: 'Armhole (inches)', required: true },
    ],
    optionsSchema: {
      sleeveType: { label: 'Sleeve Type', options: ['short', 'threequarter', 'full'], default: 'threequarter' },
      neckType: { label: 'Neck Type', options: ['round', 'vneck', 'collar', 'chinese'], default: 'round' },
      slitLength: { label: 'Slit Length (inches)', type: 'number', default: 8 },
    },
    formulaVersion: '1.0',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export default function PatternTemplatesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<PatternStackParamList>>();
  const [templates] = useState<PatternTemplate[]>(mockTemplates);

  const handleSelectTemplate = (template: PatternTemplate) => {
    navigation.navigate('PatternGenerator', { templateId: template.id });
  };

  return (
    <ScreenScrollView style={{ backgroundColor: theme.backgroundRoot }}>
      <View style={styles.container}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Choose a Pattern Template
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
          Select a garment type to generate a custom pattern based on measurements
        </ThemedText>

        {templates.map((template) => (
          <Pressable
            key={template.id}
            onPress={() => handleSelectTemplate(template)}
            style={[styles.templateCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.templateHeader}>
              <View style={[styles.iconContainer, { backgroundColor: withOpacity(theme.primary, 0.12) }]}>
                <Feather
                  name={GARMENT_ICONS[template.garmentType]}
                  size={24}
                  color={theme.primary}
                />
              </View>
              <View style={styles.templateInfo}>
                <ThemedText type="bodyMedium">{template.name}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, textTransform: 'capitalize' }}>
                  {template.garmentType}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
            {template.description ? (
              <ThemedText type="small" style={[styles.description, { color: theme.textSecondary }]}>
                {template.description}
              </ThemedText>
            ) : null}
            <View style={styles.tagContainer}>
              <View style={[styles.tag, { backgroundColor: withOpacity(theme.primary, 0.12) }]}>
                <ThemedText type="small" style={{ color: theme.primary }}>
                  {template.measurementFields.length} measurements
                </ThemedText>
              </View>
              <View style={[styles.tag, { backgroundColor: withOpacity(theme.accent, 0.12) }]}>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  v{template.formulaVersion}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  templateCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  templateInfo: {
    flex: 1,
  },
  description: {
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
});
