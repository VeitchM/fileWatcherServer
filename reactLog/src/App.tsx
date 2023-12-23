
import "./App.css";
import { useLog } from "./fetchLog";

function App() {
  const log = useLog();

  return (
    <div className="card">
      <p>
        <code>{log}</code>
      </p>
    </div>
  );
}

export default App;
