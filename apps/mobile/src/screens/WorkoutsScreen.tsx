import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTRPC } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';

export function WorkoutsScreen() {
  const trpc = useTRPC();
  const [activeTab, setActiveTab] = useState<'templates' | 'history'>('templates');

  // Fetch workout templates
  const templatesQuery = trpc.workoutTemplates.list.queryOptions();
  const {
    data: templates,
    isLoading: templatesLoading,
    refetch: refetchTemplates,
    isRefetching: templatesRefetching,
  } = useQuery(templatesQuery);

  // Fetch workout history
  const historyQuery = trpc.workoutInstances.list.queryOptions({ limit: 20 });
  const {
    data: history,
    isLoading: historyLoading,
    refetch: refetchHistory,
    isRefetching: historyRefetching,
  } = useQuery(historyQuery);

  const isLoading = activeTab === 'templates' ? templatesLoading : historyLoading;
  const isRefreshing = activeTab === 'templates' ? templatesRefetching : historyRefetching;

  const handleRefresh = () => {
    if (activeTab === 'templates') {
      refetchTemplates();
    } else {
      refetchHistory();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text
            style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}
          >
            Templates
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {activeTab === 'templates' ? (
            templates && templates.length > 0 ? (
              templates.map((template) => (
                <View key={template.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{template.name}</Text>
                  {template.description && (
                    <Text style={styles.cardDescription}>{template.description}</Text>
                  )}
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardMeta}>
                      {template.exercises?.length || 0} exercises
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No workout templates yet</Text>
                <Text style={styles.emptySubtext}>
                  Create your first template on the web app
                </Text>
              </View>
            )
          ) : history && history.length > 0 ? (
            history.map((workout) => (
              <View key={workout.id} style={styles.card}>
                <Text style={styles.cardTitle}>{workout.name}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardMeta}>
                    {new Date(workout.completedAt).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  {workout.duration && (
                    <Text style={styles.cardMeta}>{workout.duration} min</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No workout history yet</Text>
              <Text style={styles.emptySubtext}>
                Complete your first workout to see it here
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  cardMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
