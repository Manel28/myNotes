import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Composant principal de la page Formulaire (ajout ou édition de note)
export default function FormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // récupère l’ID si on est en mode édition

  // États locaux pour gérer les champs
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Si on est en édition, on charge la note existante
  useEffect(() => {
    if (id) {
      const loadNote = async () => {
        const storedNotes = await AsyncStorage.getItem('notes');
        const parsedNotes = storedNotes ? JSON.parse(storedNotes) : [];
        const existingNote = parsedNotes.find((n) => n.id === id);

        if (existingNote) {
          setTitle(existingNote.title);
          setContent(existingNote.content);
          setPriority(existingNote.priority);
          setDate(new Date(existingNote.date));
          setIsEditMode(true);
        }
      };
      loadNote();
    }
  }, [id]);

  // Gestion du changement de date (iOS/Android compatible)
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  // Sauvegarde de la note (en création ou en modification)
  const handleSave = async () => {
    if (!title || !content || !priority) {
      Alert.alert('Missing Information', 'Please fill in all fields before saving.');
      return;
    }

    try {
      const newNote = {
        id: isEditMode ? id : Date.now().toString(),
        title,
        content,
        priority,
        date: date.toISOString(),
      };

      const storedNotes = await AsyncStorage.getItem('notes');
      let notes = storedNotes ? JSON.parse(storedNotes) : [];

      // Si édition → remplacement, sinon → ajout
      if (isEditMode) {
        notes = notes.map((note) => (note.id === id ? newNote : note));
      } else {
        notes.push(newNote);
      }

      await AsyncStorage.setItem('notes', JSON.stringify(notes));
      router.push('/notes'); // Redirection
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save the note.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header avec retour et icône */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#7EE4EC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Note' : 'New Note'}</Text>
        <FontAwesome name="sticky-note" size={24} color="#7EE4EC" />
      </View>

      {/* Champ Titre */}
      <TextInput
        style={styles.input}
        placeholder="Note Title"
        placeholderTextColor="#7EE4EC"
        value={title}
        onChangeText={setTitle}
      />

      {/* Champ Contenu */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Note Content"
        placeholderTextColor="#7EE4EC"
        multiline
        numberOfLines={6}
        value={content}
        onChangeText={setContent}
      />

      {/* Sélection de la date */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: '#fff' }}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Sélection de la priorité */}
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {['Low', 'Medium', 'High'].map((label) => {
          const color = label === 'Low' ? '#7EE4EC' : label === 'Medium' ? '#FFD4CA' : '#F45B69';
          return (
            <TouchableOpacity
              key={label}
              style={[
                styles.priorityButton,
                { backgroundColor: priority === label ? color : '#163E4D' },
              ]}
              onPress={() => setPriority(label as 'Low' | 'Medium' | 'High')}
            >
              <Text style={styles.priorityText}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#114B5F',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    color: '#7EE4EC',
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    color: '#7EE4EC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#163E4D',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    marginBottom: 14,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#F45B69',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});
