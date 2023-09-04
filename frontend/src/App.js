import "./App.css";
import { Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";
import { ChatState } from "./context/ChatProvider";

function App() {
  const { user } = ChatState();
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      {user && <Route path="/chats" component={ChatPage} />}
    </div>
  );
}

export default App;
