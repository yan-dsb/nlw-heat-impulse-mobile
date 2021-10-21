import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSessions  from 'expo-auth-session';
import { api } from "../services/api";
import { Alert } from "react-native";

const CLIENT_ID = 'fd7f33c362a018e4f916';
const SCOPE = 'read:user';
const USER_STORAGE = '@dowhile:user';
const TOKEN_STORAGE = '@dowhile:token';

interface IUserData {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}


interface IAuthContextData {
  user: IUserData | null;
  isSigninIn: boolean;
  signIn(): Promise<void>;
  signOut(): Promise<void>;
}

const AuthContext = createContext({} as IAuthContextData);


interface IAuthProviderProps {
  children: React.ReactNode;
}

interface IAuthResponse {
  token: string;
  user: IUserData;
}

interface IAuthorizationResponse {
  params: {
    code?: string;
    error?: string;
  }
  type?: string;
}

export function AuthProvider({ children }: IAuthProviderProps){
  const [isSigninIn, setIsSigninIn] = useState(true);
  const [user, setUser] = useState<IUserData | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=${SCOPE}&client_id=${CLIENT_ID}`
  async function signIn(){
    try {
      setIsSigninIn(true);
      const authSessionResponse = await AuthSessions.startAsync({ authUrl: signInUrl}) as IAuthorizationResponse;

      if(authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied'){
        const authResponse = await api.post<IAuthResponse>('/authenticate', { code: authSessionResponse.params.code });

        const { user, token } = authResponse.data;
        setUser(user);
        api.defaults.headers.common.authorization = `Bearer ${token}`;
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user));
        await AsyncStorage.setItem(TOKEN_STORAGE, token);
      }
    } catch (error) {
      Alert.alert('Ocorreu um ao fazer o login', 'Tente novamente');
    } finally {
      setIsSigninIn(false);
    }
  }

  async function signOut(){
    setUser(null);
    await AsyncStorage.removeItem(USER_STORAGE);
    await AsyncStorage.removeItem(TOKEN_STORAGE);
  }

  useEffect(() => {
    async function loadUserStorageData(){
      const userStorage = await AsyncStorage.getItem(USER_STORAGE);
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

      if(userStorage && tokenStorage) {
        api.defaults.headers.common.authorization = `Bearer ${tokenStorage}`;
        setUser(JSON.parse(userStorage));
      }
      setIsSigninIn(false);
    }
    loadUserStorageData();
  },[]);
  return(
    <AuthContext.Provider value={{ user, isSigninIn, signIn, signOut }} >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): IAuthContextData{
  const context = useContext(AuthContext);

  if(!context){
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
