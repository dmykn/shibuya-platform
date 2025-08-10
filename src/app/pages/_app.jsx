// src/pages/_app.jsx
import "../app/globals.css";
import { ToastProvider } from "../components/toast.jsx";

export default function MyApp({ Component, pageProps }) {
  return (
    <ToastProvider>
      <Component {...pageProps} />
    </ToastProvider>
  );
}
