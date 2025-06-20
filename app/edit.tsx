// app/edit.tsx
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import NoteForm from '../components/NoteForm';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      const storedNotes = await AsyncStorage.getItem('notes');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      const note = notes.find((n) => n.id === id);
      if (note) {
        setInitialData({ ...note, date: new Date(note.date) });
      }
    };

    fetchNote();
  }, [id]);

  const handleUpdateNote = async (updatedNote) => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      let notes = storedNotes ? JSON.parse(storedNotes) : [];
      notes = notes.map((n) => (n.id === id ? updatedNote : n));
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      router.push('/notes');
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note.');
    }
  };

  if (!initialData) return null;

  return (
    <View style={styles.container}>
      <NoteForm initialData={initialData} onSubmit={handleUpdateNote} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#114B5F',
    padding: 20,
    paddingTop: 60,
  },
});
