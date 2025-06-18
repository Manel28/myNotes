import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

//   découpage et usage des hooks
export default function FormScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | null>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ici je  gères la compatibilité iOS/Android
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  //  Fonction propre, logique, et bien protégée contre les champs vides
  const handleSave = async () => {
    if (!title || !content || !priority) {
      Alert.alert('Missing Information', 'Please fill in all fields before saving.');
      return;
    }

    try {
      const newNote = {
        id: Date.now().toString(), //  j’utilise l’horodatage comme ID unique
        title,
        content,
        priority,
        date: date.toISOString(), // c un Format universel et fiable
      };

      // Récupération de l’existant
      const existingNotes = await AsyncStorage.getItem('notes');
      const notes = existingNotes ? JSON.parse(existingNotes) : [];

      //  Ajout
      notes.push(newNote);
      await AsyncStorage.setItem('notes', JSON.stringify(notes));

      //  Redirection vers la page des notes
      router.push('/notes');
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save the note.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header  */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#7EE4EC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
        <FontAwesome name="sticky-note" size={24} color="#7EE4EC" />
      </View>

      {/*  Champ titre */}
      <TextInput
        style={styles.input}
        placeholder="Note Title"
        placeholderTextColor="#7EE4EC"
        value={title}
        onChangeText={setTitle}
      />

      {/* Champ contenu */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Note Content"
        placeholderTextColor="#7EE4EC"
        multiline
        numberOfLines={6}
        value={content}
        onChangeText={setContent}
      />

      {/*  Date */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
        <Text style={{ color: '#fff' }}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>

      {/*  Picker si activé */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/*  Priorité */}
      <Text style={styles.label}>Priority</Text>
      <View style={styles.priorityContainer}>
        {/*  sortir ce tableau en constante plus haut */}
        {[
          { label: 'Low', color: '#7EE4EC' },
          { label: 'Medium', color: '#FFD4CA' },
          { label: 'High', color: '#F45B69' },
        ].map(({ label, color }) => (
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
        ))}
      </View>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}

// StyleSheet  !
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
