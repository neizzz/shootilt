import React from 'react';
import { StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

const fs = require('fs');

fs.readFile;

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
    />
    <script type="module" src="./src/index.ts"></script>
  </head>

  <body></body>

  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
  </style>
</html>
`;

const styles = StyleSheet.create({
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
  },
});

export default function App() {
  return (
    <WebView
      styles={styles.webview}
      originWhitelist={['*']}
      source={{ html }}
    />
  );
}

