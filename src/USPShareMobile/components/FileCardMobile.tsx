import React, { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Interface para as props, garantindo que os dados estejam corretos
interface FileCardProps {
  file: {
    id: string;
    title: string;
    type: string;
    courseCode: string;
    semester: string;
    likes: number;
    comments: number;
  };
}

export const FileCardMobile: FC<FileCardProps> = ({ file }) => {
  return (
    // O componente Link do Expo Router pode envolver outros componentes.
    // Usamos 'asChild' para que o TouchableOpacity (o botão) receba as propriedades de navegação.
    <Link href={`/file/${file.id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{file.type}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {file.title}
          </Text>
          <View style={styles.metadataRow}>
            <Ionicons name="book-outline" size={14} color="#666" />
            <Text style={styles.metadataText}>{file.courseCode}</Text>
          </View>
          <View style={styles.metadataRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.metadataText}>{file.semester}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color="#666" />
              <Text style={styles.statText}>{file.likes}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={14} color="#666" />
              <Text style={styles.statText}>{file.comments}</Text>
            </View>
          </View>
          {/* Futuramente, podemos adicionar o avatar do uploader aqui */}
        </View>
      </TouchableOpacity>
    </Link>
  );
};

// --- ESTILIZAÇÃO NATIVA COM StyleSheet ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    flex: 1, // Garante que o card ocupe o espaço disponível no grid
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  typeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardContent: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});