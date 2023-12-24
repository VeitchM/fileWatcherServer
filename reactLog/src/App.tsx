
import "./App.css";
import { useLog } from "./fetchLog";

function App() {
  const log = useLog();

  return (
    <div className="card">
      <h2>File changed: {log.path}</h2>
      <p>
        <code>{log.data}</code>
      </p>
    </div>
  );
}

export default App;
