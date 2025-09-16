import React, { useState, useEffect, FC, ChangeEvent, SyntheticEvent } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Link, Stack as ExpoStack, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
// Assumindo que você já tem o FileCardMobile criado
import { FileCardMobile } from '../../components/FileCardMobile';

// --- Interfaces de Tipos ---
// (Reutilizadas da versão web)
interface FileData { id: string; title?: string; fileName?: string; courseCode: string; type: string; }
interface ProfileData { name: string; avatarUrl?: string; course?: string; faculty?: string; yearJoined?: string; bio?: string; badges?: string[]; stats?: any; }

// --- Modal de Edição para Mobile ---
const EditProfileModal: FC<{
  visible: boolean;
  onClose: () => void;
  profile: ProfileData;
  onSave: (data: Partial<ProfileData>, file: ImagePicker.ImagePickerAsset | null) => Promise<void>;
}> = ({ visible, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState(profile);
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    // Pede permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("É necessária a permissão para acessar suas fotos!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setAvatarAsset(result.assets[0]);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await onSave(formData, avatarAsset);
    setIsSaving(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Editar Perfil</Text>
          <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} /></TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          <Image source={{ uri: avatarAsset ? avatarAsset.uri : `http://192.168.15.14:8080${profile.avatarUrl}` }} style={styles.modalAvatar} />
          <TouchableOpacity style={styles.modalButtonOutline} onPress={pickImage}>
            <Text style={styles.modalButtonText}>Trocar Imagem</Text>
          </TouchableOpacity>
        </View>
        <TextInput style={styles.modalInput} value={formData.name} onChangeText={(text) => setFormData(p => ({...p, name: text}))} placeholder="Nome Completo" />
        <TextInput style={styles.modalInput} value={formData.course} onChangeText={(text) => setFormData(p => ({...p, course: text}))} placeholder="Curso" />
        <TextInput style={styles.modalInput} multiline value={formData.bio} onChangeText={(text) => setFormData(p => ({...p, bio: text}))} placeholder="Bio" />
        
        <TouchableOpacity style={styles.modalButton} onPress={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonTextSolid}>Salvar Alterações</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};


// --- Tela Principal do Perfil ---
export default function ProfilePage() {
  const [tabValue, setTabValue] = useState("uploads");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const { user: profile, refreshUser, loading: authLoading } = useAuth();
  const [uploads, setUploads] = useState<FileData[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  useEffect(() => {
    // Só executa se o perfil do usuário já foi carregado pelo AuthContext
    if (profile) {
      const fetchUserUploads = async () => {
        try {
          setLoadingUploads(true);
          // Chama o endpoint que retorna os materiais do usuário logado
          const response = await apiClient.get<FileData[]>('/api/my-uploads');
          setUploads(response.data || []);
        } catch (error) { 
          console.error("Failed to fetch uploads:", error); 
        } finally { 
          setLoadingUploads(false); 
        }
      };
      fetchUserUploads();
    }
  }, [profile]);
  
  const handleSaveProfile = async (updatedData: Partial<ProfileData>, avatarAsset: ImagePicker.ImagePickerAsset | null) => {
    try {
      await apiClient.put('/api/profile', updatedData);
      if (avatarAsset) {
        const formData = new FormData();
        formData.append('avatar', {
          uri: avatarAsset.uri,
          name: `avatar_${profile?.id}.jpg`,
          type: 'image/jpeg',
        } as any);
        await apiClient.post('/api/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await refreshUser();
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  if (authLoading || !profile) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <ExpoStack.Screen options={{ title: 'Meu Perfil', headerShown: true }} />

      {/* Cabeçalho do Perfil */}
      <View style={styles.profileHeader}>
        <Image source={{ uri: `http://192.168.15.14:8080${profile.avatarUrl}` }} style={styles.profileAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileInfo}>{profile.course || 'Curso não informado'}</Text>
          <Text style={styles.profileInfo}>Ingressante {profile.yearJoined || ''}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => setEditModalOpen(true)}>
          <Ionicons name="pencil" size={16} color="#333" />
        </TouchableOpacity>
      </View>
      <Text style={styles.profileBio}>"{profile.bio || 'Nenhuma bio adicionada.'}"</Text>

      {/* Stats e Tabs (simplificados para mobile) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meus Materiais</Text>
        
        {loadingUploads ? (
          // 1. Enquanto estiver carregando, exibe o spinner
          <ActivityIndicator size="large" color="#1976d2" style={{ marginVertical: 40 }} />
        ) : uploads.length > 0 ? (
          uploads.map(file => <FileCardMobile key={file.id} file={{
            id: file.id,
            title: file.title || file.fileName || '',
            type: file.type,
            courseCode: file.courseCode,
            semester: "",
            likes: 0,
            comments: 0
          }} />)
        ) : (
          <Text style={styles.emptyText}>Você ainda não compartilhou materiais.</Text>
        )}
      </View>
      
      {/* O Modal de Edição */}
      <EditProfileModal
        visible={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </ScrollView>
  );
}

// --- ESTILIZAÇÃO NATIVA ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { flexDirection: 'row', padding: 16, alignItems: 'center', gap: 16 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40 },
  profileName: { fontSize: 22, fontWeight: 'bold' },
  profileInfo: { fontSize: 14, color: '#555' },
  editButton: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 20 },
  profileBio: { fontStyle: 'italic', color: '#666', paddingHorizontal: 16, marginBottom: 16 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 24 },
  
  // Estilos do Modal
  modalContainer: { flex: 1, paddingTop: 40, paddingHorizontal: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  modalAvatar: { width: 80, height: 80, borderRadius: 40 },
  modalInput: { height: 48, borderColor: '#ccc', borderWidth: 1, marginBottom: 16, paddingHorizontal: 12, borderRadius: 8 },
  modalButton: { backgroundColor: '#1976d2', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  modalButtonOutline: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1976d2' },
  modalButtonText: { color: '#1976d2', fontWeight: '600' },
  modalButtonTextSolid: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});