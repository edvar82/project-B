import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const RadioButton = ({
  questionNumber,
  selectedColor,
  correctColor,
  emoji,
  textColor,
  onSelect,
  initialSelectedOption,
  correctOption,
  disableSelection, // Add this line
}) => {
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption);

  useEffect(() => {
    setSelectedOption(initialSelectedOption);
  }, [initialSelectedOption]);

  const handleSelectOption = (optionIndex) => {
    if (disableSelection) return; // Add this line to disable selection

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

    return options.map((option, index) => {
      let backgroundColor = null;
      if (selectedOption === index) {
        backgroundColor = selectedColor;
      } else if (correctOption === index) {
        backgroundColor = correctColor;
      }

      return (
        <TouchableOpacity
          key={index}
          style={[
            styles.checkbox,
            backgroundColor && { backgroundColor, borderWidth: 0 },
          ]}
          onPress={() => handleSelectOption(index)}
        >
          <Text
            style={{
              color: backgroundColor ? '#FFFFFF' : textColor,
              fontSize: 20,
            }}
          >
            {option}
          </Text>
        </TouchableOpacity>
      );
    });
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
  },
  questionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  numberContainer: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
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
