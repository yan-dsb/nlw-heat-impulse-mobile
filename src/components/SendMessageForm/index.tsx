import React, { useState } from 'react';

import {
  Alert,
  Keyboard,
  TextInput,
  View
} from 'react-native';
import { api } from '../../services/api';
import { COLORS } from '../../theme';
import { Button } from '../Button';

import { styles } from './styles';

export function SendMessageForm(){
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  async function handleMessageSubmit(){
    const messageFormatted = message.trim();

    if(messageFormatted.length === 0){
      Alert.alert('Escreva uma mensagem antes de enviar');
      return;
    }

    setSendingMessage(true);
    await api.post('/messages', { message: messageFormatted });
    Keyboard.dismiss();
    setMessage('');
    setSendingMessage(false);
    Alert.alert('Mensagem enviada com sucesso!');
  }

  return (
    <View style={styles.container}>
      <TextInput
        keyboardAppearance="dark"
        placeholder="Qual a sua expectativa para o evento?"
        placeholderTextColor={COLORS.GRAY_PRIMARY}
        style={styles.input}
        multiline
        maxLength={140}
        onChangeText={setMessage}
        value={message}
        editable={!sendingMessage}
      />

      <Button
        onPress={handleMessageSubmit}
        title="ENVIAR MENSAGEM"
        backgroundColor={COLORS.PINK}
        color={COLORS.WHITE}
        isLoading={sendingMessage}
      />
    </View>
  );
}
