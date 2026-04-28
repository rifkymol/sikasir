import { Routes, Route, NavLink } from "react-router-dom";
import { ShoppingCart, Package, History } from "lucide-react";
import POSPage from "./pages/POSPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

function App() {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <nav className="w-16 bg-gray-900 flex flex-col items-center py-6 gap-6 shadow-xl">
                <div className="text-white font-bold text-xs text-center">SIKASIR</div>
                    <NavLink 
                        to="/" 
                        className={({ isActive }) =>
                            `p-3 rounded-xl transition-colors 
                                ${isActive 
                                ? 'bg-primary-600 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                        title="Sikasir POS"
                    >
                        <ShoppingCart size={22} />
                    </NavLink>
                    <NavLink 
                        to="/inventory" 
                        className={({ isActive }) =>
                            `p-3 rounded-xl transition-colors 
                                ${isActive 
                                ? 'bg-primary-600 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                        title="Sikasir Inventory"
                    >
                        <Package size={22} />
                    </NavLink>
                    
                    <NavLink 
                        to="/history" 
                        className={({ isActive }) =>
                            `p-3 rounded-xl transition-colors 
                                ${isActive 
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                        title="Transaction History"
                    >
                    <History size={22} />
                </NavLink>
            </nav>
            
            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <Routes>
                    <Route path="/" element={<POSPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                </Routes>
            </main>
        </div>
    )
}

export default App;