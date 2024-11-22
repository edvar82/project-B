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
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import RadioComponent from '../components/RadioComponent';
import logo from '../assets/logo.png';
import loanding2 from '../assets/loanding2.png';
import { useFonts, NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';

import * as ImagePicker from 'expo-image-picker';

export default function Home() {
  let [fontsLoaded] = useFonts({ NunitoSans_400Regular });
  const [selectedOptions, setSelectedOptions] = useState(Array(10).fill(null));
  const [modalVisible, setModalVisible] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      setSelectedOptions(Array(10).fill(null));
      setImages([]);
      setLoading(false);
    }, [])
  );

  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#CADBE1"
      />
    );
  }

  const handleAddImage = () => {
    if (selectedOptions.includes(null)) {
      Alert.alert('Atenção', 'Por favor, marque todas as respostas do gabarito oficial.');
      return;
    }

    setModalVisible(true);
  };

  const handleSelectOption = (index, optionIndex) => {
    let updatedOptions = [...selectedOptions];
    updatedOptions[index] = updatedOptions[index] === optionIndex ? null : optionIndex;
    setSelectedOptions(updatedOptions);
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
      } else {
        setModalVisible(false);
        await ImagePicker.requestCameraPermissionsAsync();

        // Take multiple photos
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

            // Ask if user wants to take another photo
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

        // Format result to match gallery mode structure
        result = {
          canceled: photos.length === 0,
          assets: photos,
        };
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
    if (selectedOptions.includes(null)) {
      Alert.alert('Atenção', 'Por favor, marque todas as respostas do gabarito oficial.');
      return;
    }

    const formattedOptions = selectedOptions.map((option, index) =>
      option !== null
        ? `${index + 1}-${String.fromCharCode(65 + option)}`
        : `${index + 1}-A`
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
      const response = await fetch('http://192.168.1.108:5000/answer', {
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
                  initialSelectedOption={selectedOptions[index]}
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

      {/* Modal para selecionar imagem */}
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

      {/* Loading spinner */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#CADBE1"
          />
          <Image
            source={loanding2}
            style={styles.loadingLogo}
          />
        </View>
      )}
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
  loadingLogo: {
    width: 168,
    height: 47,
    marginTop: 20,
  },
});
