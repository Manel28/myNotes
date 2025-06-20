// app/add.tsx
import { View, StyleSheet, Alert } from 'react-native';
import NoteForm from '../components/NoteForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AddNoteScreen() {
  const router = useRouter();

  const handleAddNote = async (note) => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      const notes = storedNotes ? JSON.parse(storedNotes) : [];
      notes.push(note);
      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      router.push('/notes');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note.');
    }
  };

  return (
    <View style={styles.container}>
      <NoteForm onSubmit={handleAddNote} />
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
