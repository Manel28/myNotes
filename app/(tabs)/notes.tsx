import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
};

const PRIORITY_COLORS = {
  Low: '#7EE4EC',
  Medium: '#FFD4CA',
  High: '#F45B69',
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  //  Recharge les notes à chaque fois qu'on arrive sur la page
  useFocusEffect(() => {
    const loadNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem('notes');
        const parsed = stored ? JSON.parse(stored) : [];
        setNotes(parsed.reverse()); // affiche les dernières notes d’abord
      } catch (error) {
        console.error('Failed to load notes', error);
      }
    };

    loadNotes();
  });

  const renderNote = ({ item }: { item: Note }) => (
    <View style={[styles.noteCard, { borderLeftColor: PRIORITY_COLORS[item.priority] }]}>
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.noteContent}>
        {item.content.length > 80 ? item.content.slice(0, 80) + '...' : item.content}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/*  Header cohérent avec le reste de l’app */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={22} color="#7EE4EC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Notes</Text>
        <TouchableOpacity onPress={() => router.push('/form')}>
          <FontAwesome name="plus-circle" size={24} color="#7EE4EC" />
        </TouchableOpacity>
      </View>

      {/*  Liste ou message vide */}
      {notes.length > 0 ? (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <FontAwesome name="sticky-note-o" size={60} color="#7EE4EC" />
          <Text style={styles.emptyText}>No notes yet. Tap "+" to add one!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#114B5F',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    color: '#7EE4EC',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 20,
  },
  noteCard: {
    backgroundColor: '#163E4D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 6,
  },
  noteTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noteDate: {
    color: '#7EE4EC',
    fontSize: 12,
    marginBottom: 8,
  },
  noteContent: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: '#7EE4EC',
    fontSize: 16,
    textAlign: 'center',
  },
});
