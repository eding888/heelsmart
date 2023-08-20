import axios, { AxiosError } from 'axios';
import { useState } from 'react';
const csrf = '';
const backendUrl = 'http://localhost:8080';

export const newUser = async (username: string, email: string, password: string) => {
  console.log(username, email);
  try {
    await axios.post(`${backendUrl}/api/newUser`, { username, email, password });
    return 'OK';
  } catch (error: any) {
    const errorMsg: string = error.response.data.error;
    if (errorMsg.includes('email')) {
      return 'Email is already in use.';
    }
    if (errorMsg.includes('username')) {
      return 'Username is already in use.';
    }
    return errorMsg;
  }
};

export const login = async (email: string, password: string) => {
  try {
    await axios.post(`${backendUrl}/api/login`, { email, password });
    return 'OK';
  } catch (error: any) {
    const errorMsg: string = error.response.data.error;
    if (errorMsg.includes('not verified')) {
      return 'CONFIRMATION';
    }
    return errorMsg;
  }
};

export const confirm = async (code: string, username: string) => {
  try {
    await axios.post(`${backendUrl}/api/login/confirm`, { code, username });
    return 'OK';
  } catch (error: any) {
    const errorMsg: string = error.response.data.error;
    return errorMsg;
  }
};