import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'; 
import App from './App';
import { store, persistor } from './features/store';
import { LanguageProvider } from './features/translation/LanguageContext';



const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={true} persistor={persistor}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
