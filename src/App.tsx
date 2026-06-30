import { AppProvider } from "@/stores/appStore";
import { AppLayout } from "@/components/layout/AppLayout";

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
