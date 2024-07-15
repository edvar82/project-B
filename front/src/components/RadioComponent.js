import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const RadioButton = ({ questionNumber, selectedColor, emoji, textColor, onSelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleSelectOption = (optionIndex) => {
    if (selectedOption === optionIndex) {
      setSelectedOption(null);
      onSelect(null);
    } else {
      setSelectedOption(optionIndex);
      onSelect(optionIndex);
    }
  };

  const renderOptions = () => {
    const options = ['A', 'B', 'C', 'D', 'E'];

    return options.map((option, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.checkbox,
          selectedOption === index && { backgroundColor: selectedColor, borderWidth: 0 },
        ]}
        onPress={() => handleSelectOption(index)}
      >
        <Text
          style={{
            color: selectedOption === index ? '#FFFFFF' : textColor,
            fontSize: 20,
          }}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.questionContainer}>
      {emoji && (
        <View style={styles.checkContainer}>
          <Image source={emoji} />
        </View>
      )}
      <View style={styles.questionContent}>
        <View style={styles.numberContainer}>
          <Text
            style={[styles.questionText, { color: textColor }]}
          >{`${questionNumber}.`}</Text>
        </View>
        <View style={styles.checkboxContainer}>{renderOptions()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'center',
  },
  checkContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
    marginRight: 9,
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  numberContainer: {
    width: 50, // Largura fixa para acomodar números de dois dígitos
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#395F6F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  questionText: {
    fontSize: 20,
  },
});

export default RadioButton;
