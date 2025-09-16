import React, { useState, FC } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import Pdf from 'react-native-pdf';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// --- Interfaces (sem alterações) ---
interface FileData {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
}
interface FilePreviewerProps {
  file: FileData;
  backendUrl: string;
}


export const FilePreviewerMobile: FC<FilePreviewerProps> = ({ file, backendUrl }) => {
  const fileFullUrl = `${backendUrl}${file.fileUrl}`;
  const fileExtension = file.fileName.split('.').pop()?.toLowerCase() || '';

  // Estado para o modal de imagem (lightbox)
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const images = [{ uri: fileFullUrl }];

  // --- LÓGICA ATUALIZADA PARA O MODAL DE PDF ---
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const source = { uri: fileFullUrl, cache: true };

  const handleDownload = async () => {
    // 1. Verifica se a plataforma atual suporta o compartilhamento
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(
        "Funcionalidade não suportada",
        "O compartilhamento de arquivos não está disponível neste dispositivo/emulador."
      );
      return;
    }

    Alert.alert("Download", "Iniciando o download do arquivo...");
    
    // Define um nome de arquivo local
    const localUri = FileSystem.documentDirectory + file.fileName.replace(/\s+/g, '_'); // Remove espaços do nome

    try {
      // 2. Baixa o arquivo da sua API para o armazenamento temporário do app
      const { uri } = await FileSystem.downloadAsync(fileFullUrl, localUri);
      console.log('Download finalizado, arquivo em:', uri);

      // 3. Usa o Sharing para abrir o menu nativo com o arquivo baixado
      await Sharing.shareAsync(uri, {
          dialogTitle: 'Salvar ou compartilhar este arquivo',
          mimeType: 'application/octet-stream', // Tipo genérico
      });

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível baixar ou compartilhar o arquivo.");
    }
  };

  // --- Renderização Condicional ---

  // 1. Para Imagens (continua igual)
  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
    return (
      <>
        <TouchableOpacity onPress={() => setImageViewerVisible(true)}>
          <Image source={{ uri: fileFullUrl }} style={styles.previewImage} resizeMode="cover" />
        </TouchableOpacity>
        <ImageViewing
          images={images}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      </>
    );
  }
  
  // --- RENDERIZAÇÃO ATUALIZADA PARA PDFs ---
  if (fileExtension === 'pdf') {
    return (
      <>
        {/* Este é o "gatilho" que o usuário vê na página */}
        <TouchableOpacity onPress={() => setPdfModalVisible(true)} style={styles.previewPlaceholder}>
            <Pdf
            trustAllCerts={false} 
            source={source}
            onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Número de páginas: ${numberOfPages}`);
            }}
            onError={(error) => {
                console.log(error);
                Alert.alert("Erro", "Não foi possível carregar o PDF.");
            }}
            style={styles.pdf}
            />
        </TouchableOpacity>

        {/* Este é o Modal que abre em tela cheia */}
        <Modal
          visible={pdfModalVisible}
          animationType="slide"
          onRequestClose={() => setPdfModalVisible(false)}
        >
          <SafeAreaView style={styles.pdfModalContainer}>
            {/* Cabeçalho do Modal */}
            <View style={styles.pdfModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pdfModalTitle} numberOfLines={1}>{file.title}</Text>
                <Text style={styles.pdfPageCounter}>Página {currentPage} de {totalPages}</Text>
              </View>
              <TouchableOpacity onPress={() => setPdfModalVisible(false)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* O Componente PDF que renderiza o documento */}
            <Pdf
              trustAllCerts={false}
              source={source}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Página atual: ${page}`);
                setCurrentPage(page);
                setTotalPages(numberOfPages);
              }}
              onError={(error) => { console.log(error); }}
              style={styles.pdf}
            />
          </SafeAreaView>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.previewPlaceholder}>
      <Ionicons name="document-text-outline" size={60} color="#888" />
      <Text style={styles.previewTitle}>Pré-visualização não disponível</Text>
      <Text style={styles.previewSubtitle}>O arquivo `{file.fileName}` não pode ser exibido.</Text>
      <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
        <Ionicons name="download-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.downloadButtonText}>Fazer Download</Text>
      </TouchableOpacity>
    </View>
  );
};


// --- ESTILIZAÇÃO (com novos estilos para o modal de PDF) ---
const styles = StyleSheet.create({
  previewImage: { width: '100%', height: 250, borderRadius: 8, backgroundColor: '#eee' },
  previewPlaceholder: { height: 250, backgroundColor: '#f5f5f5', borderRadius: 8, justifyContent: 'center', alignItems: 'center', padding: 16 },
  previewTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#333' },
  previewSubtitle: { color: '#888', marginTop: 4, textAlign: 'center' },
  // ... (seus outros estilos de download, etc.)

  // --- NOVOS ESTILOS PARA O MODAL DE PDF ---
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pdfModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pdfPageCounter: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f0f0f0',
  },
  pdfContainer: {
    width: '100%',
    height: 500,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },

  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 16,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});