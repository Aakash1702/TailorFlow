import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useData } from '@/contexts/DataContext';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PatternTemplate, Customer } from '@/types';
import { generatePattern } from '@/utils/patternGenerator';
import { withOpacity } from '@/utils/colorUtils';

type PatternStackParamList = {
  PatternTemplates: undefined;
  PatternGenerator: { templateId: string; customerId?: string; orderId?: string };
  PatternViewer: { svg: string; templateName: string };
};

const mockTemplates: PatternTemplate[] = [
  {
    id: '1',
    name: 'Basic Saree Blouse',
    garmentType: 'blouse',
    description: 'Traditional saree blouse pattern',
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
    description: 'Simple A-line kids frock pattern',
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
    description: 'Straight-cut kurti pattern',
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

export default function PatternGeneratorScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<PatternStackParamList>>();
  const route = useRoute<RouteProp<PatternStackParamList, 'PatternGenerator'>>();
  const { getCustomers } = useData();

  const { templateId, customerId } = route.params;

  const [template, setTemplate] = useState<PatternTemplate | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [options, setOptions] = useState<Record<string, string | number>>({});
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const foundTemplate = mockTemplates.find(t => t.id === templateId);
    if (foundTemplate) {
      setTemplate(foundTemplate);
      const defaultOptions: Record<string, string | number> = {};
      Object.entries(foundTemplate.optionsSchema).forEach(([key, schema]) => {
        defaultOptions[key] = schema.default;
      });
      setOptions(defaultOptions);
    }
  }, [templateId]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const customerList = await getCustomers();
    setCustomers(customerList);
    if (customerId) {
      const customer = customerList.find(c => c.id === customerId);
      if (customer) {
        setSelectedCustomer(customer);
        prefillMeasurements(customer);
      }
    }
  };

  const prefillMeasurements = (customer: Customer) => {
    if (customer.measurements && template) {
      const prefilled: Record<string, string> = {};
      template.measurementFields.forEach(field => {
        const value = (customer.measurements as Record<string, number>)[field.key];
        if (value !== undefined) {
          prefilled[field.key] = String(value);
        }
      });
      setMeasurements(prefilled);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    prefillMeasurements(customer);
    setShowCustomerPicker(false);
  };

  const handleMeasurementChange = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionChange = (key: string, value: string | number) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const validateMeasurements = (): boolean => {
    if (!template) return false;
    for (const field of template.measurementFields) {
      if (field.required && !measurements[field.key]) {
        Alert.alert('Missing Measurement', `Please enter ${field.label}`);
        return false;
      }
      const value = parseFloat(measurements[field.key]);
      if (field.required && (isNaN(value) || value <= 0)) {
        Alert.alert('Invalid Measurement', `${field.label} must be a positive number`);
        return false;
      }
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!template || !validateMeasurements()) return;

    setIsGenerating(true);
    try {
      const numericMeasurements: Record<string, number> = {};
      Object.entries(measurements).forEach(([key, value]) => {
        numericMeasurements[key] = parseFloat(value) || 0;
      });

      const result = generatePattern(template.name, numericMeasurements, options);

      if (result) {
        navigation.navigate('PatternViewer', {
          svg: result.svg,
          templateName: template.name,
        });
      } else {
        Alert.alert('Error', 'Pattern generation not available for this template yet.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate pattern. Please check measurements and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!template) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading template...</ThemedText>
      </View>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView style={{ backgroundColor: theme.backgroundRoot }}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="bodyMedium">{template.name}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {template.description}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="bodyMedium" style={styles.sectionTitle}>
            Customer (Optional)
          </ThemedText>
          <Pressable
            style={[styles.customerPicker, { backgroundColor: theme.backgroundDefault, borderColor: theme.borderLight }]}
            onPress={() => setShowCustomerPicker(!showCustomerPicker)}
          >
            <Feather name="user" size={20} color={theme.textSecondary} />
            <ThemedText style={{ flex: 1, marginLeft: Spacing.sm }}>
              {selectedCustomer ? selectedCustomer.name : 'Select customer to prefill measurements'}
            </ThemedText>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>

          {showCustomerPicker ? (
            <View style={[styles.customerList, { backgroundColor: theme.backgroundDefault }]}>
              <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                {customers.map(customer => (
                  <Pressable
                    key={customer.id}
                    style={[
                      styles.customerItem,
                      { borderBottomColor: theme.borderLight },
                      selectedCustomer?.id === customer.id && { backgroundColor: withOpacity(theme.primary, 0.1) },
                    ]}
                    onPress={() => handleSelectCustomer(customer)}
                  >
                    <ThemedText>{customer.name}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {customer.phone}
                    </ThemedText>
                  </Pressable>
                ))}
                {customers.length === 0 ? (
                  <ThemedText type="small" style={{ color: theme.textSecondary, padding: Spacing.md }}>
                    No customers found
                  </ThemedText>
                ) : null}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText type="bodyMedium" style={styles.sectionTitle}>
            Measurements
          </ThemedText>
          {template.measurementFields.map(field => (
            <View key={field.key} style={styles.inputRow}>
              <ThemedText style={styles.inputLabel}>
                {field.label}
                {field.required ? ' *' : ''}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.borderLight,
                    color: theme.text,
                  },
                ]}
                value={measurements[field.key] || ''}
                onChangeText={(value) => handleMeasurementChange(field.key, value)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <ThemedText type="bodyMedium" style={styles.sectionTitle}>
            Options
          </ThemedText>
          {Object.entries(template.optionsSchema).map(([key, schema]) => (
            <View key={key} style={styles.optionRow}>
              <ThemedText style={styles.inputLabel}>{schema.label}</ThemedText>
              {schema.options ? (
                <View style={styles.optionButtons}>
                  {schema.options.map(option => (
                    <Pressable
                      key={option}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: options[key] === option
                            ? theme.primary
                            : theme.backgroundDefault,
                          borderColor: options[key] === option
                            ? theme.primary
                            : theme.borderLight,
                        },
                      ]}
                      onPress={() => handleOptionChange(key, option)}
                    >
                      <ThemedText
                        type="small"
                        style={{
                          color: options[key] === option ? '#fff' : theme.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {option}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.borderLight,
                      color: theme.text,
                      width: 80,
                    },
                  ]}
                  value={String(options[key] || '')}
                  onChangeText={(value) => handleOptionChange(key, parseFloat(value) || 0)}
                  keyboardType="decimal-pad"
                  placeholderTextColor={theme.textSecondary}
                />
              )}
            </View>
          ))}
        </View>

        <Pressable
          style={[
            styles.generateButton,
            { backgroundColor: theme.primary, opacity: isGenerating ? 0.7 : 1 },
          ]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          <Feather name="cpu" size={20} color="#fff" />
          <ThemedText style={styles.generateButtonText}>
            {isGenerating ? 'Generating...' : 'Generate Pattern'}
          </ThemedText>
        </Pressable>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  customerPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  customerList: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  customerItem: {
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    flex: 1,
  },
  input: {
    width: 100,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  optionRow: {
    marginBottom: Spacing.md,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
