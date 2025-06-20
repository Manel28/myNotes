import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// page d'accueil de l'app
export default function HomeScreen() {
  const router = useRouter(); // Permet de naviguer entre les pages avec Expo Router

  return (
    <View style={styles.container}>
      {/*  Header  */}
      <View style={styles.header}>
        <Ionicons name="home" size={24} color="#FFF" />
        <Text style={styles.headerText}>Home</Text>
      </View>

      {/*  Icône centrale en gros plan */}
      <View style={styles.iconContainer}>
        <FontAwesome name="sticky-note" size={100} color="#FFD4CA" />
      </View>

      {/* Bouton vers la page liste de notes */}
      <TouchableOpacity
        style={[styles.button, styles.blueButton]}
        onPress={() => router.push('/notes')}
      >
        <FontAwesome name="file-text-o" size={20} color="#FFF" />
        <Text style={styles.buttonText}>My Notes</Text>
      </TouchableOpacity>

      {/* Bouton vers le formulaire d'ajout */}
      <TouchableOpacity
        style={[styles.button, styles.redButton]}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Add Note</Text>
      </TouchableOpacity>
    </View>
  );
}

// Style 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#114B5F', 
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    gap: 20, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#114B5F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#7EE4EC', 
  },
  headerText: {
    color: '#7EE4EC',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconContainer: {
    marginVertical: 40, 
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 50, 
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6, 
  },
  blueButton: {
    backgroundColor: '#456990', 
  },
  redButton: {
    backgroundColor: '#F45B69', 
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase', 
  },
});
