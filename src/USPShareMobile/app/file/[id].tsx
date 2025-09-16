import React, { useEffect, useState, FC, SyntheticEvent, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert as RNAlert, TextInput, Alert, Platform } from 'react-native';
import { Link, useLocalSearchParams, Stack as ExpoStack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Contextos e API Client
import apiClient from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useLikes } from '../../context/LikesContext';
import { CommentThread } from '../../components/CommentThread'; 

import * as IntentLauncher from 'expo-intent-launcher';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


// --- Interfaces de Tipos (essenciais para o TypeScript) ---
interface FileData {
  id: string;
  title: string;
  type: string;
  tags?: string[];
  fileUrl: string;
  likes: number;
  fileName: string;
  description?: string;
  course: string;
  courseCode: string;
  semester: string;
  uploadDate: string;
  uploaderName?: string;
  uploaderAvatar?: string;
  professorName?: string;
  professorAvatar?: string; 
}

interface CommentData {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorAvatar?: string;
  replies?: CommentData[]; 
  likes: number;
}

import { FilePreviewerMobile } from '../../components/FilePreviewerMobile';


// --- Tela Principal do Arquivo ---
export default function FilePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { hasLiked, toggleLike } = useLikes();

  // Lógica de Estado e Fetch (transferida da versão web)
  const [file, setFile] = useState<FileData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [relatedFiles, setRelatedFiles] = useState<any[]>([]); // Simplificado por enquanto
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [comment, setComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  useEffect(() => {
    if (!id) {
      setError("ID do arquivo inválido.");
      setLoading(false);
      return;
    };
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [fileRes, commentsRes, relatedRes] = await Promise.all([
          apiClient.get(`/api/resource/${id}`),
          apiClient.get(`/api/resource/${id}/comments`),
          apiClient.get(`/api/resource/${id}/related`),
        ]);
        setFile(fileRes.data);
        setComments(commentsRes.data || []);
        setRelatedFiles(relatedRes.data || []);
      } catch (err) { setError("Falha ao carregar o material."); } 
      finally { setLoading(false); }
    };
    fetchAllData();
  }, [id]);

  const handleLike = async () => {
    try {
      const { likes } = await toggleLike(id!);
      setFile(prev => prev ? { ...prev, likes } : null);
    } catch (err) { console.error("Failed to toggle like", err); }
  };
  
  // A lógica de comentários e respostas é idêntica à da web
  const handleComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim()) return;
    setIsPostingComment(true);
    try {
      const response = await apiClient.post(`/api/resource/${id}/comments`, { content, parentId });
      const newComment = response.data;

      if (parentId) {
        setComments(prevComments => addReplyToTree(prevComments, parentId, newComment));
      } else {
        setComments(prevComments => [newComment, ...prevComments]);
        setComment("");
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setIsPostingComment(false);
    }
  };
  const addReplyToTree = (nodes: CommentData[], parentId: string, newReply: CommentData): CommentData[] => {
    return nodes.map(node => {
      if (node.id === parentId) {
        const updatedReplies = node.replies ? [...node.replies, newReply] : [newReply];
        return { ...node, replies: updatedReplies };
      }
      if (node.replies) {
        return { ...node, replies: addReplyToTree(node.replies, parentId, newReply) };
      }
      return node;
    });
  };
  
  const getSafeFileName = (fileName: string) => fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');

  // --- NOVA E ROBUSTA FUNÇÃO getLocalFileUri ---
  const getLocalFileUri = useCallback(async (fileToDownload: FileData): Promise<string | null> => {
    if (!fileToDownload?.fileName || !fileToDownload?.fileUrl) {
      console.error("Dados do arquivo inválidos:", fileToDownload);
      return null;
    }

    const safeFileName = getSafeFileName(fileToDownload.fileName);
    const localUri = `${FileSystem.cacheDirectory}${safeFileName}`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        console.log(`Arquivo encontrado no cache: ${localUri}`);
        return localUri;
      }
      setLoading(true);

      console.log(`Arquivo não está no cache. Baixando via Axios...`);

      const response = await apiClient.get(fileToDownload.fileUrl, {
        responseType: 'blob',
      });

      const reader = new FileReader();
      reader.readAsDataURL(response.data);
      
      const base64Data = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = (error) => {
          reject(error);
        };
      });

      await FileSystem.writeAsStringAsync(localUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setLoading(false);
      console.log(`Download finalizado com Axios. Salvo em: ${localUri}`);
      return localUri;

    } catch (error) {
      console.error("ERRO DURANTE O PROCESSO DE DOWNLOAD/ESCRITA:", error);
      RNAlert.alert("Erro", "Não foi possível obter o arquivo.");
      return null;
    }
  }, []); 


  const handleDownloadAndOpenFile = async () => {
    if (!file) return;

    const localUri = await getLocalFileUri(file);
    if (!localUri) return;

    try {
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(localUri);
        const mimeType = file.fileName.endsWith('.pdf') ? 'application/pdf' : 'image/*';
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, 
          type: mimeType,
        });
      } else {
        await Sharing.shareAsync(localUri);
      }
    } catch (error) {
      console.error("Erro ao abrir o arquivo:", error);
      RNAlert.alert("Erro", "Não foi possível abrir o arquivo. Você pode encontrá-lo na pasta de downloads do seu dispositivo.");
    }
  };


  const handleShareFile = async () => {
    if (!file) return;
    
    if (!(await Sharing.isAvailableAsync())) {
      RNAlert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
      return;
    }

    const localUri = await getLocalFileUri(file);
    if (!localUri) return;
    
    await Sharing.shareAsync(localUri, {
      dialogTitle: `Compartilhar "${file.title}"`,
    });
  };



  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#1976d2" /></View>;
  }

  if (error || !file) {
    return <View style={styles.centerContainer}><Text style={styles.errorText}>{error || "Material não encontrado."}</Text></View>;
  }

  const backendUrl = 'http://192.168.15.14:8080'; 

  return (
    <ScrollView style={styles.container}>
      <ExpoStack.Screen options={{ title: file.title }} />
      <View style={styles.content}>
        {/* Título e Tags */}
        <Text style={styles.title}>{file.title}</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.chip}><Text style={styles.chipText}>{file.type}</Text></View>
          {(file.tags || []).map(tag => <View key={tag} style={[styles.chip, styles.chipPrimary]}><Text style={[styles.chipText, styles.chipTextPrimary]}>{tag}</Text></View>)}
        </View>

        <View style={styles.previewWrapper}>
          <FilePreviewerMobile file={file} backendUrl={backendUrl} />
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons name={hasLiked(id!) ? "heart" : "heart-outline"} size={22} color="#1976d2" />
                <Text style={styles.actionText}>Útil ({file.likes})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDownloadAndOpenFile}>
                <Ionicons name="download-outline" size={22} color="#1976d2" />
                <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShareFile}>  
                <Ionicons name="share-social-outline" size={22} color="#1976d2" />
                <Text style={styles.actionText}>Compartilhar</Text>
            </TouchableOpacity>
        </View>

        {/* Descrição */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.description}>{file.description || "Sem descrição disponível."}</Text>
        
        <View style={styles.divider} />

        <View style={styles.sidebar}>
            <Text style={styles.sectionTitle}>Informações do Material</Text>
            <View style={styles.infoContainer}>
              {/* Disciplina */}
              <View style={styles.infoRow}>
                <Ionicons name="book-outline" size={20} color="#555" style={styles.infoIcon} />
                <Text style={styles.infoText}>{file.course} ({file.courseCode})</Text>
              </View>
              {/* Professor */}
              <View style={styles.infoRow}>
                {file.professorAvatar ? (
                  <Image source={{ uri: `${backendUrl}${file.professorAvatar}` }} style={styles.infoAvatar} />
                ) : (
                  <Ionicons name="person-circle-outline" size={20} color="#555" style={styles.infoIcon} />
                )}
                <Text style={styles.infoText}>{file.professorName || "Não informado"}</Text>
              </View>
              {/* Semestre */}
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#555" style={styles.infoIcon} />
                <Text style={styles.infoText}>{file.semester}</Text>
              </View>
              {/* Uploader */}
              <View style={styles.infoRow}>
                <Image source={{ uri: file.uploaderAvatar ? `${backendUrl}${file.uploaderAvatar}`: undefined }} style={styles.infoAvatar} />
                <Text style={styles.infoText}>{file.uploaderName || "Anônimo"}</Text>
              </View>
              {/* Data de Upload */}
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#555" style={styles.infoIcon} />
                <Text style={styles.infoText}>Enviado em: {new Date(file.uploadDate).toLocaleDateString("pt-BR")}</Text>
              </View>
            </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* Comentários */}
        <Text style={styles.sectionTitle}>Comentários ({comments.length})</Text>
        {isAuthenticated ? (
          <View style={styles.commentForm}>
            <TextInput
              style={styles.commentInput}
              placeholder="Adicione um comentário..."
              placeholderTextColor='#808080'
              value={comment}
              onChangeText={setComment}
              multiline
              editable={!isPostingComment}
            />
            <TouchableOpacity
              style={[styles.commentButton, (!comment.trim() || isPostingComment) && styles.buttonDisabled]}
              onPress={() => handleComment(comment, null)}
              disabled={!comment.trim() || isPostingComment}
            >
              {isPostingComment ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Comentar</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginPrompt}>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Faça login</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.promptText}> para deixar um comentário.</Text>
          </View>
        )}

        <View style={{ gap: 12, marginTop: 24 }}>
            {comments.length > 0 ? (
                comments.map(c => <CommentThread key={c.id} comment={c} onReplySubmit={handleComment} highlightedId={null} />)
            ) : (
                <Text style={styles.emptyText}>Seja o primeiro a comentar!</Text>
            )}
        </View>

      </View>
    </ScrollView>
  );
}

// --- ESTILIZAÇÃO NATIVA ---
const styles = StyleSheet.create({
  // ... (Todos os estilos que definimos na resposta anterior)
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  title: { fontSize: 28, fontWeight: 'bold' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  chip: { backgroundColor: '#eee', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipPrimary: { backgroundColor: '#e3f2fd' },
  chipText: { color: '#555', fontWeight: '500' },
  chipTextPrimary: { color: '#1976d2' },
  previewImage: { width: '100%', height: 250, borderRadius: 8 },
  previewPlaceholder: { height: 250, backgroundColor: '#f0f0f0', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  previewText: { color: '#888', marginTop: 8, fontSize: 16 },
  previewButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginTop: 16, borderWidth: 1, borderColor: '#ccc' },
  previewButtonText: { fontWeight: 'bold' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', marginTop: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, color: '#1976d2', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 8 },
  description: { fontSize: 16, color: '#444', lineHeight: 24 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 24 },
  sidebar: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 24, fontSize: 16 },
  linkText: { color: '#1976d2', fontWeight: '600' },
  
  // Estilos para a nova seção de comentários
  commentForm: {
    marginTop: 8,
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  commentButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  promptText: {
    fontSize: 16,
    color: '#555',
  },

  infoContainer: {
    gap: 16, // Espaçamento entre as linhas
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    flex: 1, // Permite que o texto quebre a linha se for muito longo
  },
  previewWrapper: {
    marginVertical: 16,
},
});