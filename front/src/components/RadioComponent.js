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
      <Text
        style={[styles.questionText, { color: textColor }]}
      >{`${questionNumber}.`}</Text>
      <View style={styles.checkboxContainer}>{renderOptions()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkContainer: {
    width: 15,
    height: 15,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 9,
    marginLeft: -5,
    marginRight: 9,
  },
  checkText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    marginLeft: 5,
    width: 45,
    paddingBottom: 10,
  },
});

export default RadioButton;
