import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';



// Définition du type de données pour chaque note
type Note = {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'Low' | 'Medium' | 'High';
};

// Association d'une couleur à chaque niveau de priorité
const PRIORITY_COLORS = {
  Low: '#7EE4EC',
  Medium: '#FFD4CA',
  High: '#F45B69',
};

export default function NotesScreen() {
  // State pour stocker les notes
  const [notes, setNotes] = useState<Note[]>([]);

  // State pour gérer l'ID de la note sélectionnée pour suppression
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // State pour afficher ou non la modale de confirmation de suppression
  const [modalVisible, setModalVisible] = useState(false);

  // Router de navigation (expo-router)
  const router = useRouter();
  const [filter, setFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

  // Rechargement des notes à chaque fois que l’écran est affiché
  useFocusEffect(() => {
    const loadNotes = async () => {
      try {
        const stored = await AsyncStorage.getItem('notes');
        const parsed = stored ? JSON.parse(stored) : [];
        setNotes(parsed.reverse()); // On affiche les notes les plus récentes en premier
      } catch (error) {
        console.error('Erreur lors du chargement des notes', error);
      }
    };
    loadNotes();
  });

  // Fonction pour supprimer une note
  const handleDeleteNote = async () => {
    try {
      const updated = notes.filter(note => note.id !== selectedNoteId); // On retire la note ciblée
      await AsyncStorage.setItem('notes', JSON.stringify(updated)); // Mise à jour du stockage
      setNotes(updated); // Mise à jour du state
      setSelectedNoteId(null);
      setModalVisible(false); // Fermeture de la modale
    } catch (error) {
      console.error('Erreur lors de la suppression de la note', error);
    }
  };

  // Fonction pour afficher chaque note
  const renderNote = ({ item }: { item: Note }) => (
    <View style={[styles.noteCard, { borderLeftColor: PRIORITY_COLORS[item.priority] }]}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <View style={styles.actions}>
          {/* Bouton de modification : redirige vers /form avec les données de la note */}
          <TouchableOpacity onPress={() => router.push({ pathname: '/form', params: item })}>
            <FontAwesome name="pencil" size={20} color="#FFD4CA" />
          </TouchableOpacity>

          {/* Bouton de suppression : déclenche l'ouverture de la modale */}
          <TouchableOpacity
            onPress={() => {
              setSelectedNoteId(item.id);
              setModalVisible(true);
            }}
          >
            <FontAwesome name="trash" size={20} color="#F45B69" style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Affichage de la date */}
      <Text style={styles.noteDate}>{new Date(item.date).toLocaleDateString()}</Text>
      {/* Aperçu du contenu (limité à 80 caractères) */}
      <Text style={styles.noteContent}>
        {item.content.length > 80 ? item.content.slice(0, 80) + '...' : item.content}
      </Text>
    </View>
  );
  const filteredNotes = filter === 'All' ? notes : notes.filter(note => note.priority === filter);
const exportToPDF = async () => {
  try {
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #114B5F; }
            .note { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; color: #114B5F; }
            .date, .priority { color: #555; font-size: 12px; }
            .content { margin-top: 8px; font-size: 14px; color: #222; }
          </style>
        </head>
        <body>
          <h1>My Notes</h1>
          ${filteredNotes.map(note => `
            <div class="note">
              <div class="title">${note.title}</div>
              <div class="date">📅 ${new Date(note.date).toLocaleDateString()}</div>
              <div class="priority">🎯 Priority: ${note.priority}</div>
              <div class="content">${note.content.replace(/\n/g, '<br>')}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri);
  } catch (error) {
    console.error('PDF export failed', error);
  }
};


  return (
    <View style={styles.container}>
      {/* En-tête avec bouton retour et bouton d’ajout */}
      <View style={styles.header}>
        <TouchableOpacity onPress={exportToPDF}>
  <FontAwesome name="file-pdf-o" size={22} color="#7EE4EC" />
</TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={22} color="#7EE4EC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Notes</Text>
        <TouchableOpacity onPress={() => router.push('/form')}>
          <FontAwesome name="plus-circle" size={24} color="#7EE4EC" />
        </TouchableOpacity>
      </View>

      {/* Liste des notes OU message si vide */}
      {filteredNotes.length > 0 ? (
  <>
    <View style={styles.filterBar}>
      {['All', 'Low', 'Medium', 'High'].map((level) => (
        <TouchableOpacity
          key={level}
          onPress={() => setFilter(level as typeof filter)}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                filter === level ? PRIORITY_COLORS[level] || '#ccc' : '#163E4D',
            },
          ]}
        >
          <Text style={styles.filterText}>{level}</Text>
        </TouchableOpacity>
      ))}
    </View>

    <FlatList
      data={filteredNotes}
      keyExtractor={(item) => item.id}
      renderItem={renderNote}
      contentContainerStyle={styles.list}
    />
  </>
) : (
  <View style={styles.emptyState}>
    <FontAwesome name="sticky-note-o" size={60} color="#7EE4EC" />
    <Text style={styles.emptyText}>No notes yet. Tap "+" to add one!</Text>
  </View>
)}


      {/* Modale de confirmation de suppression */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this note?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteNote} style={styles.deleteButton}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// styles
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
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
  },
  noteTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  noteDate: {
    color: '#7EE4EC',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 4,
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
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#CCC',
    borderRadius: 6,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F45B69',
    borderRadius: 6,
  },
  cancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterBar: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 20,
  gap: 6,
},
filterButton: {
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
},
filterText: {
  color: '#fff',
  fontWeight: 'bold',
},

});
