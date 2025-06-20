
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';

type Note = {
  id?: string;
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High' | null;
  date: Date;
};

type NoteFormProps = {
  initialData?: Note;
  onSubmit: (note: Note) => void;
};

export default function NoteForm({ initialData, onSubmit }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [priority, setPriority] = useState<Note['priority']>(initialData?.priority || null);
  const [date, setDate] = useState<Date>(initialData?.date ? new Date(initialData.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSave = () => {
    if (!title || !content || !priority) {
      Alert.alert('Missing Information', 'Please fill in all fields before saving.');
      return;
    }

    onSubmit({
      id: initialData?.id || Date.now().toString(),
      title,
      content,
      priority,
      date,
    });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Note Title"
        placeholderTextColor="#7EE4EC"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Note Content"
        placeholderTextColor="#7EE4EC"
        multiline
        numberOfLines={6}
        value={content}
        onChangeText={setContent}
      />

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
              onPress={() => setPriority(label as Note['priority'])}
            >
              <Text style={styles.priorityText}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Save Note</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  label: {
    color: '#7EE4EC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
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
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
});
