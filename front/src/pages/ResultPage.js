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
import loanding2 from '../assets/loanding2.png';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ResultPage({ route }) {
  const { resultData } = route.params;
  const [images, setImages] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
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
        }
      } catch (error) {
        console.error('Failed to fetch correct answers:', error);
      }
    };
    fetchCorrectAnswers();
  }, []);

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
          allowsMultipleSelection: true,
          aspect: [1, 1],
          quality: 1,
        });

        if (!result.canceled) {
          result.assets = await Promise.all(
            result.assets.map(async (asset) => {
              const manipulatedImage = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ rotate: 0 }], 
                { format: ImageManipulator.SaveFormat.JPEG } 
              );
              return { ...asset, uri: manipulatedImage.uri };
            })
          );
        }
      } else {
        setModalVisible(false);
        await ImagePicker.requestCameraPermissionsAsync();
        let photos = [];
        let keepTaking = true;
        while (keepTaking) {
          const photo = await ImagePicker.launchCameraAsync({
            cameraType: ImagePicker.CameraType.back,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });
          if (!photo.canceled) {
            photos.push(photo.assets[0]);
            const takeAnother = await new Promise((resolve) => {
              Alert.alert(
                'Adicionar foto',
                'Deseja tirar outra foto?',
                [
                  { text: 'Não', onPress: () => resolve(false) },
                  { text: 'Sim', onPress: () => resolve(true) },
                ],
                { cancelable: false }
              );
            });
            keepTaking = takeAnother;
          } else {
            keepTaking = false;
          }
        }
        result = { canceled: photos.length === 0, assets: photos };
      }
      if (!result.canceled) {
        setLoading(true);
        const selectedImages = result.assets.map((asset) => asset.uri);
        setImages(selectedImages);
        await sendFormData(selectedImages);
      }
    } catch (erro) {
      alert('ERRO uploadind Image: ' + erro.message);
      setModalVisible(false);
    }
  };

  const sendFormData = async (imageUris) => {
    const formattedOptions = correctAnswers.map(
      (option, index) => option || `${index + 1}-A`
    );
    await AsyncStorage.setItem('correct_answer', JSON.stringify(formattedOptions));
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      formData.append('images', {
        uri,
        name: `image${index}.jpeg`,
        type: 'image/jpeg',
      });
    });
    formData.append('correct_answer', JSON.stringify(formattedOptions));

    try {
      const response = await fetch('https://project-b-oeux.onrender.com/answer', {
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
                Resultado da avaliação:
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
            {resultData.resultados.map((resultado, index) => (
              <View
                key={index}
                style={styles.resultItem}
              >
                <Text style={styles.resultItemText}>
                  Prova {index + 1}:{' '}
                  <Text style={styles.boldText}>{resultado.acertos} acertos</Text>
                </Text>
              </View>
            ))}
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
    alignItems: 'flex-start',
  },
  resultItem: {
    marginTop: 10,
    marginBottom: 10,
  },
  resultItemText: {
    fontSize: 16,
    color: '#395F6F',
    textAlign: 'left',
  },
  boldText: {
    fontWeight: 'bold',
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
