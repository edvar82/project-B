import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';

import logo from '../assets/logo.png';
import { useFonts, NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';

export default function Home() {
  let [fontsLoaded] = useFonts({ NunitoSans_400Regular });
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={logo}
          style={styles.image}
        />
      </View>
      {/* Conteúdo central */}
      <View style={styles.centralBody}>
        {/* Somente o texto da imagem */}
        <View>
          <Text style={{ fontFamily: 'NunitoSans_400Regular', fontSize: 18 }}>
            Marque as respostas do gabarito:
          </Text>
        </View>
        {/* Tabela do gabarito */}
        <View></View>
      </View>
    </View>
  );
}

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
  },
  image: {
    width: 140,
    height: 40,
  },
  centralBody: {
    alignItems: 'center',
    height: height * 0.7,
    width: width * 0.9,
    alignSelf: 'center',
    marginTop: 30,
  },
});
