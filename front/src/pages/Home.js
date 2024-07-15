import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import RadioComponent from '../components/RadioComponent';
import logo from '../assets/logo.png';
import { useFonts, NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';

export default function Home() {
  let [fontsLoaded] = useFonts({ NunitoSans_400Regular });
  const [selectedOptions, setSelectedOptions] = useState(Array(10).fill(null));

  const handleAddImage = () => {
    if (selectedOptions.includes(null)) {
      Alert.alert('Atenção', 'Por favor, marque todas as respostas do gabarito oficial.');
      return;
    }

    const options = ['A', 'B', 'C', 'D', 'E'];
    const selectedAnswers = selectedOptions.map(
      (optionIndex, index) => `${index + 1}-${options[optionIndex]}`
    );
    Alert.alert('Respostas selecionadas:', JSON.stringify(selectedAnswers));
  };

  const handleSelectOption = (index, optionIndex) => {
    let updatedOptions = [...selectedOptions];
    if (updatedOptions[index] === optionIndex) {
      updatedOptions[index] = null;
    } else {
      updatedOptions[index] = optionIndex;
    }
    setSelectedOptions(updatedOptions);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          {/* View da imagem */}
          <View style={styles.imageContainer}>
            <Image
              source={logo}
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Marque as respostas do {'\n'}
                <Text
                  style={{
                    fontFamily: 'NunitoSans_400Regular',
                    fontWeight: 'bold',
                    color: '#395F6F',
                  }}
                >
                  gabarito oficial:
                </Text>
              </Text>
            </View>
          </View>

          {/* View do conteúdo central */}
          <View style={styles.centralBody}>
            <View style={styles.questionsContainer}>
              {[...Array(10).keys()].map((_, index) => (
                <RadioComponent
                  key={index}
                  questionNumber={index + 1}
                  selectedColor="#0067B3"
                  emoji={null}
                  textColor="#395F6F"
                  onSelect={(optionIndex) => handleSelectOption(index, optionIndex)}
                />
              ))}
            </View>
          </View>

          {/* View para adicionar imagem e enviar */}
          <View style={styles.addImageContainer}>
            <Text style={styles.addImageText}>Envie sua folha de respostas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddImage}
            >
              <Text style={styles.addButtonLabel}>Adicionar imagem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    width: width * 0.85,
    alignSelf: 'center',
    marginTop: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,
  },
  image: {
    width: 40,
    height: 41,
  },
  textContainer: {
    marginLeft: 15,
  },
  title: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 24,
    color: '#395F6F',
    paddingBottom: 2,
  },
  centralBody: {
    marginTop: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  questionsContainer: {
    borderWidth: 1,
    borderColor: '#CADBE1',
    borderRadius: 10,
    paddingTop: 10,
  },
  addImageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 18,
    color: '#395F6F',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#f47721',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
