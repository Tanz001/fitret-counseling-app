import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, TextInput } from 'react-native';
import CustomIcon from '../components/CustomIcon';
import RBSheet from "react-native-raw-bottom-sheet";

const MOCK_REVIEWS = [
  { id: '1', user: 'John D.', rating: 5, comment: 'Dr. Aisha is wonderful. She really listens.' },
  { id: '2', user: 'Sarah M.', rating: 4, comment: 'Great session, very helpful techniques for managing stress.' },
];

const ReviewsScreen = ({ navigation }) => {
  const addReviewSheetRef = useRef();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.user}</Text>
        <View style={styles.stars}>
          {[1,2,3,4,5].map(star => (
            <CustomIcon key={star} name="star" size={14} color={star <= item.rating ? '#FFD700' : '#E0E0E0'} iconType="Ionicons" touchable={false} />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <CustomIcon name="chevron-back" size={24} color="#333" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <TouchableOpacity onPress={() => addReviewSheetRef.current.open()}>
          <CustomIcon name="add" size={26} color="#84bca4" iconType="Ionicons" touchable={false} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_REVIEWS}
        renderItem={renderReview}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <RBSheet
        ref={addReviewSheetRef}
        height={350}
        closeOnDragDown={true}
        customStyles={{
          container: styles.sheetContainer,
          draggableIcon: { backgroundColor: "#ccc" }
        }}
      >
        <Text style={styles.sheetTitle}>Add a Review</Text>
        <TextInput 
          style={styles.textInput}
          placeholder="Share your experience..."
          multiline
          numberOfLines={4}
          value={reviewText}
          onChangeText={setReviewText}
        />
        <View style={styles.ratingSelector}>
           <Text>Rating: </Text>
           {[1,2,3,4,5].map(num => (
             <TouchableOpacity key={num} onPress={() => setRating(num)}>
               <CustomIcon name="star" size={24} color={num <= rating ? '#FFD700' : '#E0E0E0'} style={{marginRight: 5}} iconType="Ionicons" touchable={false} />
             </TouchableOpacity>
           ))}
        </View>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={() => {
            // Handle submission logic here
            addReviewSheetRef.current.close();
          }}
        >
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </RBSheet>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#333' },
  listContainer: { padding: 20 },
  reviewCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  reviewerName: { fontWeight: '600', color: '#333' },
  stars: { flexDirection: 'row' },
  reviewComment: { color: '#666', lineHeight: 20 },

  sheetContainer: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  sheetTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  textInput: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, textAlignVertical: 'top', height: 100, marginBottom: 15 },
  ratingSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  submitButton: { backgroundColor: '#84bca4', padding: 15, borderRadius: 25, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ReviewsScreen;
