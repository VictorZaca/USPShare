import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Stack as ExpoStack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../api/axios';
import { useFocusEffect } from 'expo-router';

// --- Interfaces de Tipos ---
interface Tag { id: string; name: string; }
interface Course { id: string; code: string; name: string; }
interface Professor { id: string; name: string; avatarUrl?: string; }


// --- Tela Principal de Administração ---
export default function AdminPage() {
  const [activeSection, setActiveSection] = useState<'courses' | 'professors' | 'tags'>('courses');
  const [loading, setLoading] = useState(true);
  
  // Estados para os dados
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Estados para os formulários de adição
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newProfessorName, setNewProfessorName] = useState("");
  const [newProfessorAvatar, setNewProfessorAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [newTagName, setNewTagName] = useState("");

  const fetchData = async () => {
    try {
      // Para uma melhor UX, só mostramos o loading grande na primeira vez.
      // Nas atualizações de foco, a atualização pode ser em segundo plano.
      if (courses.length === 0 && professors.length === 0 && tags.length === 0) { // Ou qualquer outra verificação se os dados já foram carregados uma vez
         setLoading(true);
      }
      
      // A lógica de busca de dados permanece a mesma
      const [coursesRes, profsRes, tagsRes] = await Promise.all([
        apiClient.get('/api/data/courses'),
        apiClient.get('/api/data/professors'),
        apiClient.get('/api/data/tags'),
      ]);
      setCourses(coursesRes.data || []);
      setProfessors(profsRes.data || []);
      setTags(tagsRes.data || []);
    } catch (error) { 
        console.error("Failed to fetch admin data:", error);
        setError("Não foi possível carregar os dados."); // Seta um estado de erro para o usuário
    } finally { 
        setLoading(false); 
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // 1. A função async é definida DENTRO do callback do efeito.

      // 2. E então a função é chamada imediatamente.
      fetchData();

      // 3. Opcional: você pode retornar uma função de limpeza se precisar
      // cancelar alguma coisa quando o usuário sair da tela.
      return () => {
        console.log("Saindo da tela, efeito de foco limpo.");
      };
    }, [])  
) 

  // --- Handlers de Ações ---
  const handleDelete = async (entity: string, id: string) => {
    Alert.alert("Confirmar Exclusão", "Tem certeza que deseja excluir este item?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => {
        try {
          await apiClient.delete(`/api/admin/${entity}/${id}`);
          fetchData(); // Recarrega os dados
        } catch (error) { Alert.alert("Erro", "Não foi possível excluir o item."); }
      }}
    ]);
  };

  const handleAddProfessor = async () => {
    if (!newProfessorName) return;
    const formData = new FormData();
    formData.append('name', newProfessorName);
    if (newProfessorAvatar) {
      formData.append('avatar', {
        uri: newProfessorAvatar.uri, name: `prof_${newProfessorName}.jpg`, type: 'image/jpeg'
      } as any);
    }
    try {
      await apiClient.post('/api/admin/professors', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setNewProfessorName("");
      setNewProfessorAvatar(null);
      fetchData();
    } catch (error) { Alert.alert("Erro", "Não foi possível adicionar o professor."); }
  };
  
  const handleAddCourse = async () => {
    if (!newCourseName || !newCourseCode) return;
    try {
      await apiClient.post('/api/admin/courses', { name: newCourseName, code: newCourseCode });
      setNewCourseName("");
      setNewCourseCode("");
      fetchData();
    } catch (error) { Alert.alert("Erro", "Não foi possível adicionar a matéria."); }
  };

  const handleAddTag = async () => {
    if (!newTagName) return;
    try {
      await apiClient.post('/api/admin/tags', { name: newTagName });
      setNewTagName("");
      fetchData();
    } catch (error) { Alert.alert("Erro", "Não foi possível adicionar a tag."); }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("É necessária a permissão para acessar suas fotos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) {
      setNewProfessorAvatar(result.assets[0]);
    }
  };



  return (
    <ScrollView style={styles.container}>
      <ExpoStack.Screen options={{ title: 'Painel de Admin' }} />
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setActiveSection('courses')} style={[styles.tab, activeSection === 'courses' && styles.activeTab]}>
          <Text style={[styles.tabText, activeSection === 'courses' && styles.activeTabText]}>Matérias</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveSection('professors')} style={[styles.tab, activeSection === 'professors' && styles.activeTab]}>
          <Text style={[styles.tabText, activeSection === 'professors' && styles.activeTabText]}>Professores</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveSection('tags')} style={[styles.tab, activeSection === 'tags' && styles.activeTab]}>
          <Text style={[styles.tabText, activeSection === 'tags' && styles.activeTabText]}>Tags</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" style={{marginTop: 40}} /> :
        <View style={styles.content}>
          
          {/* --- SEÇÃO DE MATÉRIAS --- */}
          {activeSection === 'courses' && (
            <View>
              <Text style={styles.sectionTitle}>Adicionar Matéria</Text>
              <TextInput style={styles.input} placeholder="Nome da Matéria (ex: Cálculo I)" placeholderTextColor='#808080' value={newCourseName} onChangeText={setNewCourseName} />
              <TextInput style={styles.input} placeholder="Código (ex: MAT0111)" placeholderTextColor='#808080' value={newCourseCode} onChangeText={setNewCourseCode} />
              <TouchableOpacity style={styles.button} onPress={handleAddCourse}><Text style={styles.buttonText}>Adicionar Matéria</Text></TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Matérias Existentes</Text>
              {courses.map(course => (
                <View key={course.id} style={styles.listItem}>
                  <Text style={styles.listItemText}>{course.code} - {course.name}</Text>
                  <TouchableOpacity onPress={() => handleDelete('courses', course.id)}>
                    <Ionicons name="trash-bin-outline" size={22} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* --- SEÇÃO DE PROFESSORES --- */}
          {activeSection === 'professors' && (
            <View>
              <Text style={styles.sectionTitle}>Adicionar Professor</Text>
              <TextInput style={styles.input} placeholder="Nome do Professor" placeholderTextColor='#808080' value={newProfessorName} onChangeText={setNewProfessorName} />
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                <Text style={styles.imagePickerText}>{newProfessorAvatar ? `Imagem: ${newProfessorAvatar.fileName}` : "Selecionar Foto"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleAddProfessor}><Text style={styles.buttonText}>Adicionar Professor</Text></TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Professores Existentes</Text>
              {professors.map(prof => (
                <View key={prof.id} style={styles.listItem}>
                  <Image source={{uri: prof.avatarUrl ? `http://192.168.15.14:8080${prof.avatarUrl}` : undefined}} style={styles.avatar} />
                  <Text style={styles.listItemText}>{prof.name}</Text>
                  <TouchableOpacity onPress={() => handleDelete('professors', prof.id)}>
                    <Ionicons name="trash-bin-outline" size={22} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* --- SEÇÃO DE TAGS --- */}
          {activeSection === 'tags' && (
            <View>
              <Text style={styles.sectionTitle}>Adicionar Tag</Text>
              <TextInput style={styles.input} placeholder="Nome da Tag" placeholderTextColor='#808080' value={newTagName} onChangeText={setNewTagName} />
              <TouchableOpacity style={styles.button} onPress={handleAddTag}><Text style={styles.buttonText}>Adicionar Tag</Text></TouchableOpacity>
              
              <Text style={styles.sectionTitle}>Tags Existentes</Text>
              {tags.map(tag => (
                <View key={tag.id} style={styles.listItem}>
                  <Text style={styles.listItemText}>{tag.name}</Text>
                  <TouchableOpacity onPress={() => handleDelete('tags', tag.id)}>
                    <Ionicons name="trash-bin-outline" size={22} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      }
    </ScrollView>
  );
}

// --- ESTILIZAÇÃO ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabsContainer: { flexDirection: 'row', margin: 16, backgroundColor: '#e0e0e0', borderRadius: 8, padding: 4 },
  tab: { flex: 1, padding: 10, borderRadius: 6, alignItems: 'center' },
  activeTab: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
  tabText: { fontWeight: '600', color: '#555' },
  activeTabText: { color: '#1976d2' },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 24 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 12 },
  imagePicker: { alignItems: 'center', padding: 12, backgroundColor: '#eee', borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: '#1976d2', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  listItemText: { flex: 1, fontSize: 16 },
  imagePickerText: { color: '#555' },
});

function setError(arg0: string) {
    throw new Error('Function not implemented.');
}
