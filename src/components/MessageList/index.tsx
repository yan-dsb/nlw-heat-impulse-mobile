import React, { useEffect, useState } from 'react';

import {
  ScrollView
} from 'react-native';
import { api } from '../../services/api';
import { Message } from '../Message';

import { io } from 'socket.io-client';

import { styles } from './styles';
import { MESSAGES_EXAMPLE } from '../../utils/messages';

interface IUserData {
  name: string;
  avatar_url: string;
}

interface IMessageItem {
  id: string;
  text: string;
  user: IUserData;
}

const socket = io(String(api.defaults.baseURL));

const messagesQueue:IMessageItem[] = MESSAGES_EXAMPLE;

socket.on('new_message', (newMessage: IMessageItem) => {
  messagesQueue.push(newMessage);
});

export function MessageList(){
  const [messages, setMessages] = useState<IMessageItem[]>([]);

  useEffect(() => {
    api.get<IMessageItem[]>('/messages/last-three').then(response => {
      const { data } = response;
      setMessages(data);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(()=>{
      if(messagesQueue.length > 0){
        setMessages(messages => [
          messagesQueue[0],
          messages[0],
          messages[1],
        ])
        messagesQueue.shift();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {
        messages.map(message =>  <Message key={message.id} message={message} />)
      }

    </ScrollView>
  );
}
