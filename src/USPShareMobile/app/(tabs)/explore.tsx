import React, { useState, useMemo, FC, SyntheticEvent, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Modal, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { Link, Stack as ExpoStack, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/axios';
import { FileCardMobile } from '../../components/FileCardMobile';

// --- Interfaces de Dados (Tipagem) ---
// (Estas podem ser movidas para um arquivo de tipos global)
interface Resource {
  id: string;
  title: string;
  type: string;
  course: string;
  courseCode: string;
  uploadDate: string;
  likes: number;
  semester: string;
  comments: number;
  tags?: string[];
  professorName?: string;
}

interface SubjectGroup {
  courseCode: string;
  course: string;
  files: Resource[];
}

interface FilterOptions {
  tags: { id: string; name: string }[];
  professors: { id: string; name: string; avatarUrl?: string }[];
}

// --- Componente de Acordeão para Mobile ---
const SubjectAccordion: FC<{ subject: SubjectGroup }> = ({ subject }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity style={styles.accordionHeader} onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.accordionTitle}>{`${subject.courseCode} - ${subject.course}`}</Text>
        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#555" />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionContent}>
          {/* O SubjectDetail que era um componente separado na web, aqui é a lógica de grid */}
          <FlatList
            data={subject.files}
            renderItem={({ item }) => <FileCardMobile file={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2} // Um grid de 2 colunas
            columnWrapperStyle={{ gap: 8 }}
            contentContainerStyle={{ gap: 8 }}
          />
        </View>
      )}
    </View>
  );
};

// --- Componente Principal da Tela de Exploração ---
export default function ExplorePage() {
  // --- LÓGICA DE ESTADO E DADOS (QUASE IDÊNTICA À DA WEB) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedFileType, setSelectedFileType] = useState("all");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    tags: [], professors: []
  });

  useFocusEffect(
    useCallback(() => {
      const fetchInitialData = async () => {
        try {
          // Não resetamos o loading para true se já tivermos dados,
          // para uma atualização mais suave em segundo plano.
          if (allResources.length === 0) {
            setLoading(true);
          }
          
          const [resourcesRes, tagsRes, profsRes] = await Promise.all([
            apiClient.get('/api/resources'),
            apiClient.get('/api/data/tags'),
            apiClient.get('/api/data/professors'),
          ]);

          setAllResources(resourcesRes.data || []);
          setFilterOptions({
            tags: tagsRes.data || [],
            professors: (profsRes.data || []).map((prof: any) => prof.name),
          });
        } catch (err) {
          setError('Não foi possível carregar os materiais.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchInitialData();

      // A função de limpeza não é estritamente necessária aqui, mas é boa prática
      return () => console.log('Saindo da tela Explore...');
    }, []) // useCallback com array vazio garante que a função de fetch não seja recriada
  );


  const sortedAndFilteredSubjects = useMemo(() => {
    // Adicionamos um log para você ver no console quando este cálculo caro é executado
    console.log("Calculando e ordenando a lista de matérias...");

    // 1. AGRUPAMENTO: Agrupa todos os recursos por 'courseCode'
    const subjectGroups = allResources.reduce((groups: Record<string, { courseCode: string; course: string; files: any[] }>, file) => {
        const key = file.courseCode;
        if (!groups[key]) {
            groups[key] = { courseCode: file.courseCode, course: file.course, files: [] };
        }
        groups[key].files.push(file);
        return groups;
    }, {});

    // Converte o objeto de grupos em um array de matérias e ordena alfabeticamente
    const subjects = Object.values(subjectGroups).sort((a, b) => a.courseCode.localeCompare(b.courseCode));

    // 2. FILTRAGEM: Aplica todos os filtros selecionados pelo usuário
    const filteredSubjects = subjects.filter((subject) => {
        // Filtro da barra de busca principal
        const matchesSearch =
            subject.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filtro do seletor de tipo de material
        const hasMatchingFileType =
            selectedFileType === "all" || subject.files.some((file) => file.type === selectedFileType);

        // Filtro do Drawer (tags, professores, semestres)
        const hasMatchingFilters =
            activeFilters.length === 0 ||
            // Verifica se pelo menos UM dos arquivos da disciplina passa em TODOS os filtros ativos.
            subject.files.some(file => {
                return activeFilters.every(filterValue => 
                    (file.tags && file.tags.includes(filterValue)) ||
                    (file.semester === filterValue) ||
                    (file.professorName === filterValue) // Usando o 'professorName' que vem da API
                );
            });
            
        return matchesSearch && hasMatchingFileType && hasMatchingFilters;
    });

    // 3. ORDENAÇÃO FINAL: Aplica a ordenação baseada na aba ativa
    let sorted = [...filteredSubjects];
    if (activeTab === 1) { // Aba "Mais Recentes"
        sorted.sort((a, b) => {
            const latestA = Math.max(...a.files.map(f => new Date(f.uploadDate).getTime()));
            const latestB = Math.max(...b.files.map(f => new Date(f.uploadDate).getTime()));
            return latestB - latestA;
        });
    } else if (activeTab === 2) { // Aba "Mais Populares"
        sorted.sort((a, b) => {
            const likesA = a.files.reduce((sum, file) => sum + file.likes, 0);
            const likesB = b.files.reduce((sum, file) => sum + file.likes, 0);
            return likesB - likesA;
        });
    }
    // A aba 0 ("Mais Relevantes") usa a ordenação alfabética padrão.

    return sorted;

  }, [allResources, searchQuery, activeFilters, selectedFileType, activeTab]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
  };

  // --- LÓGICA DE RENDERIZAÇÃO PARA MOBILE ---
  const renderHeader = () => (
    <>
      <Text style={styles.headerTitle}>Explorar Materiais</Text>
      <Text style={styles.headerSubtitle}>Encontre provas, listas, resumos e outros materiais...</Text>
      
      {/* Barra de Busca e Filtros */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por disciplina ou código..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalOpen(true)}>
        <Ionicons name="filter" size={20} color="#1976d2" />
        <Text style={styles.filterButtonText}>Filtros Avançados</Text>
      </TouchableOpacity>
      
      {/* Abas */}
      {/* ... (Implementação de abas customizadas) ... */}
    </>
  );
  
  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;
  }
  if (error) {
    return <View style={styles.centerContainer}><Text>{error}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStack.Screen options={{ headerShown: false }} />
      <FlatList
        data={sortedAndFilteredSubjects}
        renderItem={({ item }) => <SubjectAccordion subject={item} />}
        keyExtractor={(item) => item.courseCode}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}><Text>Nenhum material encontrado.</Text></View>
        )}
      />
      
      {/* Modal de Filtros */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isFilterModalOpen}
        onRequestClose={() => setFilterModalOpen(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros Avançados</Text>
            <TouchableOpacity onPress={() => setFilterModalOpen(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          {/* Aqui você renderizaria a lista de filtros (tags, professores, etc.) */}
          <Text>Filtros de Tags, Professores e Semestres apareceriam aqui.</Text>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- ESTILIZAÇÃO NATIVA ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: '#666', marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 16 },
  filterButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: '#e3f2fd', borderRadius: 8, marginBottom: 16 },
  filterButtonText: { color: '#1976d2', fontWeight: '600', marginLeft: 8 },
  accordionContainer: { backgroundColor: '#fff', borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  accordionTitle: { fontSize: 16, fontWeight: '600' },
  accordionContent: { padding: 16 },
  modalContainer: { flex: 1, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  // Adicione mais estilos conforme necessário
});