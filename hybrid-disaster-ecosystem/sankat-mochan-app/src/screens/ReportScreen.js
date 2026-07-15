import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertIncident } from '../db/database';

const THEME = {
  bg: '#0A0E1A', surface: '#111827', border: '#1E3A5F',
  accent: '#3B82F6', danger: '#EF4444', success: '#10B981',
  warning: '#F59E0B', text: '#F1F5F9', muted: '#64748B',
};

const INCIDENT_TYPES = [
  { id: 'flood',    emoji: '🌊', label: 'Flood' },
  { id: 'fire',     emoji: '🔥', label: 'Fire' },
  { id: 'collapse', emoji: '🏗️', label: 'Collapse' },
  { id: 'medical',  emoji: '🏥', label: 'Medical' },
  { id: 'missing',  emoji: '🔍', label: 'Missing' },
  { id: 'other',    emoji: '⚠️', label: 'Other' },
];

const DAMAGE_LEVELS = ['low', 'medium', 'high', 'critical'];
const DAMAGE_COLORS = {
  low: THEME.success, medium: THEME.warning, high: '#FF6B2B', critical: THEME.danger,
};

const INITIAL_FORM = {
  incidentType: '',
  description: '',
  landmark: '',
  casualtyCount: '',
  damageLevel: '',
  hasGPS: false,
  lat: '',
  lng: '',
};

export default function ReportScreen() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = useCallback((key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSubmitted(false);
  }, []);

  const isValid = form.incidentType && form.description.trim().length >= 10 && form.damageLevel;

  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert('Incomplete Report', 'Please fill all required fields (type, description, damage level).');
      return;
    }

    setSubmitting(true);
    try {
      const incident = {
        id: uuidv4(),
        incidentType: form.incidentType,
        description: form.description.trim(),
        lat: form.hasGPS && form.lat ? parseFloat(form.lat) : null,
        lng: form.hasGPS && form.lng ? parseFloat(form.lng) : null,
        landmark: form.landmark.trim() || null,
        casualtyCount: parseInt(form.casualtyCount) || 0,
        damageLevel: form.damageLevel,
        createdAt: Date.now(),
      };

      await insertIncident(incident);

      setForm(INITIAL_FORM);
      setSubmitted(true);
      Alert.alert(
        '✅ Report Saved',
        'Incident saved locally. It will be uploaded when any mesh node detects internet connectivity.'
      );
    } catch (e) {
      Alert.alert('Error saving report', e.message);
    } finally {
      setSubmitting(false);
    }
  }, [form, isValid]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INCIDENT REPORT</Text>
          <Text style={styles.subtitle}>Saved offline · Auto-syncs when online</Text>
        </View>
        <Text style={{ fontSize: 28 }}>⚠️</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }} keyboardShouldPersistTaps="handled">

        {/* Incident Type */}
        <View>
          <Text style={styles.label}>INCIDENT TYPE <Text style={styles.required}>*</Text></Text>
          <View style={styles.typeGrid}>
            {INCIDENT_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeBtn,
                  form.incidentType === type.id && {
                    borderColor: THEME.danger + '80',
                    backgroundColor: THEME.danger + '15',
                  },
                ]}
                onPress={() => updateField('incidentType', type.id)}
              >
                <Text style={{ fontSize: 22 }}>{type.emoji}</Text>
                <Text style={{ color: THEME.text, fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View>
          <Text style={styles.label}>
            DESCRIPTION <Text style={styles.required}>*</Text>
            <Text style={{ color: THEME.muted }}> (min. 10 chars)</Text>
          </Text>
          <TextInput
            style={[styles.textArea, { minHeight: 100 }]}
            value={form.description}
            onChangeText={v => updateField('description', v)}
            placeholder="Describe the situation in detail. Include number of people affected, nature of damage, and any specific needs..."
            placeholderTextColor={THEME.muted}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={[styles.hint, { color: form.description.length < 10 ? THEME.danger : THEME.muted }]}>
            {form.description.length}/2000 characters
          </Text>
        </View>

        {/* Damage Level */}
        <View>
          <Text style={styles.label}>DAMAGE LEVEL <Text style={styles.required}>*</Text></Text>
          <View style={styles.levelRow}>
            {DAMAGE_LEVELS.map(level => {
              const color = DAMAGE_COLORS[level];
              const selected = form.damageLevel === level;
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelBtn,
                    selected && { borderColor: color, backgroundColor: color + '20' },
                  ]}
                  onPress={() => updateField('damageLevel', level)}
                >
                  <Text style={[styles.levelText, { color: selected ? color : THEME.muted }]}>
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Casualty Count */}
        <View>
          <Text style={styles.label}>CASUALTIES / AFFECTED PERSONS</Text>
          <TextInput
            style={styles.input}
            value={form.casualtyCount}
            onChangeText={v => updateField('casualtyCount', v)}
            placeholder="0"
            placeholderTextColor={THEME.muted}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>

        {/* Landmark */}
        <View>
          <Text style={styles.label}>LANDMARK / LOCATION DESCRIPTION</Text>
          <TextInput
            style={styles.input}
            value={form.landmark}
            onChangeText={v => updateField('landmark', v)}
            placeholder="e.g. Shivaji Nagar water tank junction"
            placeholderTextColor={THEME.muted}
          />
        </View>

        {/* GPS Coordinates toggle */}
        <View style={styles.gpsRow}>
          <View>
            <Text style={styles.label}>INCLUDE GPS COORDINATES</Text>
            <Text style={styles.hint}>If GPS is available, include for map accuracy</Text>
          </View>
          <Switch
            value={form.hasGPS}
            onValueChange={v => updateField('hasGPS', v)}
            trackColor={{ false: THEME.border, true: THEME.accent + '80' }}
            thumbColor={form.hasGPS ? THEME.accent : THEME.muted}
          />
        </View>

        {form.hasGPS && (
          <View style={styles.gpsFields}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={form.lat}
              onChangeText={v => updateField('lat', v)}
              placeholder="Latitude (e.g. 22.3072)"
              placeholderTextColor={THEME.muted}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={form.lng}
              onChangeText={v => updateField('lng', v)}
              placeholder="Longitude (e.g. 73.1812)"
              placeholderTextColor={THEME.muted}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { opacity: (!isValid || submitting) ? 0.4 : 1 }]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? '⏳ Saving...' : '📋 SAVE REPORT OFFLINE'}
          </Text>
        </TouchableOpacity>

        {submitted && (
          <View style={styles.successBanner}>
            <Text style={{ color: THEME.success, fontFamily: 'monospace', fontSize: 12 }}>
              ✅ Report saved. Will auto-upload when mesh connects to internet.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: THEME.border, backgroundColor: THEME.surface,
  },
  title: { color: THEME.text, fontSize: 18, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 2 },
  subtitle: { color: THEME.muted, fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  label: { color: THEME.muted, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.5, marginBottom: 8 },
  required: { color: THEME.danger },
  hint: { color: THEME.muted, fontFamily: 'monospace', fontSize: 10, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    borderRadius: 10, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.surface,
    minWidth: '30%', flex: 1,
  },
  input: {
    backgroundColor: THEME.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: THEME.border, color: THEME.text, fontSize: 14,
  },
  textArea: {
    backgroundColor: THEME.surface, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: THEME.border, color: THEME.text,
    fontSize: 14, lineHeight: 22,
  },
  levelRow: { flexDirection: 'row', gap: 8 },
  levelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.surface,
  },
  levelText: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  gpsRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  gpsFields: { flexDirection: 'row', gap: 8 },
  submitBtn: {
    backgroundColor: THEME.danger, borderRadius: 12, padding: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { color: 'white', fontWeight: '800', fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 },
  successBanner: {
    padding: 12, borderRadius: 10,
    backgroundColor: THEME.success + '15', borderWidth: 1, borderColor: THEME.success + '40',
  },
});
