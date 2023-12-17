// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import "./stylesheets/App.css";
import "./stylesheets/index.css";
// import FakeStackOverflow from './components/fakestackoverflow.js'
import FirstPageView from "./components/firstpageview.js";

function App() {
  return (
    <section className="fakeso">
      <FirstPageView />
      {/* <FakeStackOverflow /> */}
    </section>
  );
}

export default App;
