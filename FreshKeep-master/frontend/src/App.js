import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import AddFoodItem from "./pages/AddFoodItem";
import InventoryPage from "./pages/InventoryPage";
import RecipePage from "./pages/RecipePage";
import "./styles/App.css"; // 💡 This is the crucial import for global styles

// Assuming these are placeholders from a previous version
const AboutPage = () => (
    <div className="page-content">
        <h2>About FreshKeep</h2>
        <p>FreshKeep helps reduce food waste by tracking your inventory and generating recipes with what you already have.</p>
    </div>
);

const App = () => {
    return (
        <Router>
            <div className="App">
                <NavBar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/add-food" element={<AddFoodItem />} />
                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/recipe" element={<RecipePage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;