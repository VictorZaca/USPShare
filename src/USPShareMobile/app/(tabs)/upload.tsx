import React, { useState, useEffect, FC } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Switch, Image } from 'react-native';
import { Stack as ExpoStack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

import { API_URL } from '../../api/axios';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';

import apiClient from '../../api/axios';
import useDebounce from '../../hooks/useDebounce';

// --- Interfaces de Tipos ---
interface CourseOption { id: string; code: string; name: string; }
interface ProfessorOption { id: string; name: string; avatarUrl?: string; }
interface TagOption { id: string; name: string; }
interface SemesterOption { label: string; value: string; }

// --- Componente de Upload de Arquivo ---
const FilePicker: FC<{
  selectedFile: DocumentPicker.DocumentPickerAsset | null;
  onFileSelect: (file: DocumentPicker.DocumentPickerAsset | null) => void;
}> = ({ selectedFile, onFileSelect }) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      });
      if (!result.canceled) { onFileSelect(result.assets[0]); }
    } catch (err) { Alert.alert("Erro", "Não foi possível abrir o seletor de arquivos."); }
  };

  return (
    <TouchableOpacity onPress={pickDocument} style={styles.dropzone}>
      {selectedFile ? (
        <View style={styles.fileInfo}>
          <Ionicons name="document-attach" size={24} color="#1976d2" />
          <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
          <TouchableOpacity onPress={() => onFileSelect(null)}><Ionicons name="close-circle" size={24} color="#888" /></TouchableOpacity>
        </View>
      ) : (
        <View style={styles.dropzoneContent}>
          <Ionicons name="cloud-upload-outline" size={48} color="#888" />
          <Text style={styles.dropzoneText}>Toque para selecionar um arquivo</Text>
          <Text style={styles.formatsText}>PDF, DOCX, JPG, PNG (máx. 10MB)</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const renderProfessorItem = (item: ProfessorOption) => {
  return (
    <View style={styles.dropdownItemContainer}>
      <Image 
        source={{ uri: item.avatarUrl ? `${API_URL}${item.avatarUrl}` : undefined }}
        style={styles.dropdownItemImage}
      />
      <Text style={styles.dropdownItemText}>{item.name}</Text>
    </View>
  );
};

// --- Tela Principal de Upload ---
export default function UploadPage() {
  const router = useRouter();

  // Estados do Formulário
  const [title, setTitle] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorOption | null>(null);
  const [fileType, setFileType] = useState("");
  const [semester, setSemester] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  
  // Estados de Controle da UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para as Opções dos Seletores
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [professorOptions, setProfessorOptions] = useState<ProfessorOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const description = useDebounce(descriptionInput, 500);

  const semesterOptions = [
    { label: '2025/1', value: '2025-1' }, { label: '2024/2', value: '2024-2' },
    { label: '2024/1', value: '2024-1' }, { label: '2023/2', value: '2023-2' },
    { label: '2023/1', value: '2023-1' }, { label: '2022/2', value: '2022-2' },
    { label: '2022/1', value: '2022-1' }, { label: '2021/2', value: '2021-2' },
    { label: '2021/1', value: '2021-1' }, { label: '2020/2', value: '2020-2' },
    { label: '2020/1', value: '2020-1' }, { label: '2019/2', value: '2019-2' },
    { label: '2019/1', value: '2019-1' }, 
  ];

  // Busca os dados para os seletores ao carregar a tela
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [coursesRes, profsRes, tagsRes] = await Promise.all([
          apiClient.get('/api/data/courses'),
          apiClient.get('/api/data/professors'),
          apiClient.get('/api/data/tags'),
        ]);
        setCourseOptions(coursesRes.data || []);
        setProfessorOptions(profsRes.data || []);
        setTagOptions(tagsRes.data || []);
      } catch (err) { console.error("Falha ao buscar opções:", err); } 
      finally { setIsLoadingOptions(false); }
    };
    fetchOptions();
  }, []);

  const handleSubmit = async () => {
    if (!file || !title || !fileType || !selectedCourse || !semester) {
      setError("Os campos com * são obrigatórios.");
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    
    formData.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as any);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("course", selectedCourse.name);
    formData.append("courseCode", selectedCourse.code);
    formData.append("fileType", fileType);
    formData.append("semester", semester);
    formData.append("isAnonymous", String(isAnonymous));
    formData.append("tags", JSON.stringify(tags));
    if (selectedProfessor) {
      formData.append("professorId", selectedProfessor.id);
    }
    
    try {
      const response = await apiClient.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert("Sucesso!", "Seu material foi enviado e estará disponível para a comunidade.", [
        { text: "OK", onPress: () =>  {
                                        router.replace(`/(tabs)/explore`)
                                        router.navigate(`/file/${response.data.id}`) 
                                      }
        }
      ]);
    } catch (err: any) { setError(err.response?.data?.error || "Ocorreu um erro ao enviar o material."); }
    finally { setIsLoading(false); }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ExpoStack.Screen options={{ title: 'Compartilhar Material' }} />
      <Text style={styles.title}>Compartilhar Material</Text>
      <Text style={styles.subtitle}>Contribua com a comunidade USP.</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.formSection}>

        <View style={styles.formSection}>
          <Text style={styles.label}>Arquivo*</Text>
          <FilePicker selectedFile={file} onFileSelect={setFile}/>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Título do Material*</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ex: P1 de Cálculo I - 2024" placeholderTextColor='#808080'/>
        </View>


        <Text style={styles.label}>Tipo de Material*</Text>
        <Dropdown
          style={styles.dropdown}
          data={[{label: 'Prova', value: 'prova'}, {label: 'Lista de Exercícios', value: 'lista'}, {label: 'Resumo', value: 'resumo'}]}
          labelField="label" valueField="value" 
          placeholder="Selecione um tipo"
          placeholderStyle={{ color: '#808080' }}
          value={fileType} 
          onChange={item => setFileType(item.value)}
          // --- CORREÇÃO APLICADA ---
          disable={isLoadingOptions}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.label}>Disciplina*</Text>
        <Dropdown
          style={styles.dropdown} data={courseOptions} search
          labelField="name" valueField="id"
          value={selectedCourse?.id} onChange={item => setSelectedCourse(item)}
          searchPlaceholder="Buscar disciplina..."
          // --- CORREÇÃO APLICADA ---
          disable={isLoadingOptions}
          placeholder={isLoadingOptions ? "Carregando..." : "Selecione uma disciplina"}
          placeholderStyle={{ color: '#808080' }}
        />
      </View>
      
      <View style={styles.formSection}>
        <Text style={styles.label}>Professor</Text>
        <Dropdown
          style={styles.dropdown} data={professorOptions} search
          labelField="name" valueField="id"
          value={selectedProfessor?.id} onChange={item => setSelectedProfessor(item)}
          searchPlaceholder="Buscar professor..."
          disable={isLoadingOptions}
          placeholder={isLoadingOptions ? "Carregando..." : "Selecione um professor"}
          placeholderStyle={{ color: '#808080' }}
          renderItem={renderProfessorItem}
        />
      </View>

      <View style={styles.formSection}>
          <Text style={styles.label}>Semestre*</Text>
          <Dropdown
            style={styles.dropdown}
            data={semesterOptions} 
            labelField="label" valueField="value"
            placeholder="Selecione o semestre"
            placeholderStyle={{ color: '#808080' }}
            value={semester} 
            onChange={item => setSemester(item.value)}
          />
        </View>


      <View style={styles.formSection}>
        <Text style={styles.label}>Tags</Text>
        <MultiSelect
          style={styles.dropdown} data={tagOptions}
          labelField="name" valueField="id"
          value={tags} onChange={item => setTags(item)}
          search searchPlaceholder="Buscar tags..."
          disable={isLoadingOptions}
          placeholder={isLoadingOptions ? "Carregando..." : "Selecione tags"}
          placeholderStyle={{ color: '#808080' }}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Compartilhar Anonimamente</Text>
        <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
      </View>

      <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar Material</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- ESTILIZAÇÃO NATIVA ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { paddingVertical: 20, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  formSection: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '500', color: '#333' },
  input: { backgroundColor: '#f5f5f5', paddingHorizontal: 14, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#eee', fontSize: 16 },
  dropdown: { backgroundColor: '#f5f5f5', height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#eee', paddingHorizontal: 14 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  button: { backgroundColor: '#1976d2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10, fontWeight: '500' },
  dropzone: { height: 120, borderRadius: 8, borderWidth: 2, borderColor: '#ccc', borderStyle: 'dashed', backgroundColor: '#fafafa', justifyContent: 'center', alignItems: 'center', padding: 10 },
  dropzoneContent: { alignItems: 'center', gap: 8 },
  dropzoneText: { color: '#888' },
  formatsText: { color: '#aaa', fontSize: 12, marginTop: 4 },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  fileName: { flex: 1, fontSize: 14, color: '#333' },

  dropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownItemImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
  },
});