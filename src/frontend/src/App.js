import './App.css';
import ForceGraph from './forcegraph';
import './index.css';

function App() {
  return (
    <div className="App">
      <h1>Simple D3 Force-Directed Graph</h1>
      <ForceGraph width={600} height={400} />
    </div>
  );
}

export default App;
