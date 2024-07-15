import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RadioComponent from '../components/RadioComponent';
import checkEmoji from '../assets/check.png';
import wrongEmoji from '../assets/x.png';
import loanding2 from '../assets/loanding2.png';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function ResultPage({ route }) {
  const { resultData } = route.params;
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCorrectAnswers = async () => {
      try {
        const storedAnswers = await AsyncStorage.getItem('correct_answer');
        if (storedAnswers) {
          const parsedAnswers = JSON.parse(storedAnswers);
          setCorrectAnswers(parsedAnswers);
          calculateTotalCorrect(parsedAnswers, resultData.respostas);
        }
      } catch (error) {
        console.error('Failed to fetch correct answers:', error);
      }
    };

    fetchCorrectAnswers();
  }, []);

  const calculateTotalCorrect = (storedAnswers, apiAnswers) => {
    let correctCount = 0;
    storedAnswers.forEach((answer, index) => {
      if (answer === apiAnswers[index]) {
        correctCount++;
      }
    });
    setTotalCorrect(correctCount);
  };

  const getOptionIndex = (option) => {
    return option ? option.split('-')[1].charCodeAt(0) - 65 : null;
  };

  const handleAddImage = () => {
    setModalVisible(true);
  };

  const handleGoHome = async () => {
    try {
      await AsyncStorage.removeItem('correct_answer');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  const uploadImage = async (mode) => {
    try {
      let result = {};

      if (mode === 'gallery') {
        setModalVisible(false);
        await ImagePicker.requestMediaLibraryPermissionsAsync();
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      } else {
        setModalVisible(false);
        await ImagePicker.requestCameraPermissionsAsync();
        result = await ImagePicker.launchCameraAsync({
          cameraType: ImagePicker.CameraType.back,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
      }

      if (!result.canceled) {
        setLoading(true);
        await sendFormData(result.assets[0].uri);
      }
    } catch (erro) {
      alert('ERRO uploadind Image: ' + erro.message);
      setModalVisible(false);
    }
  };

  const sendFormData = async (imageUri) => {
    const formattedOptions = correctAnswers.map(
      (option, index) => option || `${index + 1}-A`
    );
    await AsyncStorage.setItem('correct_answer', JSON.stringify(formattedOptions));
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'epi.jpeg',
      type: 'image/jpeg',
    });
    formData.append('correct_answer', JSON.stringify(formattedOptions));

    try {
      const response = await fetch('https://project-b-h50c.onrender.com/answer', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);

      if (response.ok) {
        const resultData = await response.json();
        navigation.navigate('ResultPage', { resultData });
      } else {
        Alert.alert('Erro', 'Falha ao enviar imagem e respostas.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Erro ao enviar dados: ' + error.message);
    }
  };

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.image}
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Resultado da avalação:
                <Text
                  style={{
                    fontFamily: 'NunitoSans_400Regular',
                    fontWeight: 'bold',
                    color: '#395F6F',
                  }}
                ></Text>
              </Text>
            </View>
          </View>
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>O total de acertos foi:</Text>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.resultScore}>{totalCorrect}</Text>
              <Text style={styles.totalQuestions}>/{resultData.respostas.length}</Text>
            </View>
          </View>
          <View style={styles.questionsContainer}>
            {resultData.respostas.map((option, index) => {
              const storedOption = correctAnswers[index];
              const isCorrect = storedOption === option;
              const selectedColor = isCorrect ? '#A3CB38' : '#EA2027';
              const correctColor = '#7A949F';
              const emoji = isCorrect ? checkEmoji : wrongEmoji;
              const initialSelectedOption = getOptionIndex(storedOption);
              const correctOption = getOptionIndex(option);

              return (
                <RadioComponent
                  key={index}
                  questionNumber={index + 1}
                  selectedColor={selectedColor}
                  correctColor={correctColor}
                  emoji={emoji}
                  textColor="#395F6F"
                  initialSelectedOption={initialSelectedOption}
                  correctOption={correctOption}
                  onSelect={() => {}}
                  disableSelection={true}
                />
              );
            })}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddImage}
            >
              <Text style={styles.addButtonLabel}>Enviar outra folha de respostas</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.goHomeButton}
              onPress={handleGoHome}
            >
              <Text style={styles.goHomeButtonLabel}>Voltar à tela inicial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.containerModal}>
          <View style={styles.containerButtonModal}>
            <TouchableOpacity
              style={[styles.buttonModal, styles.firstButtonModal]}
              activeOpacity={0.8}
              onPress={() => uploadImage('gallery')}
            >
              <Text style={styles.textButtonModal}>Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonModal, styles.secondyButtonModal]}
              activeOpacity={0.8}
              onPress={() => uploadImage()}
            >
              <Text style={styles.textButtonModal}>Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonModal, styles.containerCancelButtonModal]}
              activeOpacity={0.8}
              onPress={toggleModal}
            >
              <Text style={[styles.textButton, styles.textCancelButtonModal]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#0000ff"
          />
          <Image
            source={loanding2}
            style={styles.loadingImage}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  mainContent: {
    width: '88%',
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
  resultContainer: {
    borderWidth: 1,
    borderColor: '#CADBE1',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
    color: '#395F6F',
  },
  resultScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#395F6F',
  },
  totalQuestions: {
    fontSize: 16,
    color: '#395F6F',
    paddingTop: 15,
    paddingLeft: 2,
  },
  questionsContainer: {
    borderWidth: 1,
    borderColor: '#CADBE1',
    borderRadius: 10,
    paddingTop: 10,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#fff',
    borderColor: '#395F6F',
    borderWidth: 1,
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
    color: '#395F6F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goHomeButton: {
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
  goHomeButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerModal: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(64, 64, 64, 0.69)',
    justifyContent: 'flex-end',
  },
  buttonModal: {
    width: 355,
    maxWidth: 355,
    height: 61,
    backgroundColor: '#FFFFFFDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonModal: {
    fontSize: 20,
    fontWeight: '400',
  },
  firstButtonModal: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'black',
  },
  secondyButtonModal: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  containerButtonModal: {
    marginBottom: 20,
  },
  textCancelButtonModal: {
    fontWeight: '700',
    color: 'black',
    fontSize: 20,
  },
  containerCancelButtonModal: {
    marginTop: 10,
    borderRadius: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingImage: {
    width: 168,
    height: 47,
    marginTop: 20,
  },
});
