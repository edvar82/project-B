import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
          <Text style={styles.checkText}>{emoji}</Text>
        </View>
      )}
      <Text
        style={[styles.questionText, { color: textColor }]}
      >{`Q${questionNumber}.`}</Text>
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
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  checkText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 5,
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
    marginRight: 5,
    width: 45,
    paddingBottom: 10,
  },
});

export default RadioButton;
