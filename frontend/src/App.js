import React from "react";
import Header from "./components/Header";
import UserRegistration from "./pages/UserRegistration";

function App() {
  return (
    <div style={styles.container}>
      <Header />

      <main style={styles.main}>
        <UserRegistration />
      </main>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#001233",
    minHeight: "100vh",
  },
  main: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "40px",
  },
};

export default App;