import { Routes, Route, NavLink } from "react-router-dom";
import { ShoppingCart, Package, History, LayoutDashboard, ShieldAlert } from "lucide-react";
import POSPage from "./pages/POSPage.jsx";
import InventoryPage from "./pages/InventoryPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

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
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                        title="Sikasir POS"
                    >
                        <ShoppingCart size={22} />
                    </NavLink>
                    <NavLink 
                        to="/dashboard" 
                        className={({ isActive }) =>
                            `p-3 rounded-xl transition-colors 
                                ${isActive 
                                ? 'bg-blue-600 text-white' 
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                        title="Dashboard"
                    >
                        <LayoutDashboard size={22} />
                    </NavLink>
                    <NavLink 
                        to="/inventory" 
                        className={({ isActive }) =>
                            `p-3 rounded-xl transition-colors 
                                ${isActive 
                                ? 'bg-blue-600 text-white' 
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

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `p-3 rounded-xl transition-colors
                            ${isActive
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`
                    }
                    title="Admin Settings"
                >
                    <ShieldAlert size={22} />
                </NavLink>
            </nav>
            
            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <Routes>
                    <Route path="/" element={<ErrorBoundary><POSPage /></ErrorBoundary>} />
                    <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                    <Route path="/inventory" element={<ErrorBoundary><InventoryPage /></ErrorBoundary>} />
                    <Route path="/history" element={<ErrorBoundary><HistoryPage /></ErrorBoundary>} />
                    <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
                </Routes>
            </main>
        </div>
    )
}

export default App;
