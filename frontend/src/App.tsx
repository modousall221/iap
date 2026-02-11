import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import KYCUpload from './pages/Auth/KYCUpload'
import Dashboard from './pages/Dashboard'
import KYCQueue from './pages/Admin/KYCQueue'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/kyc"
                element={
                  <PrivateRoute>
                    <KYCUpload />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/kyc-queue"
                element={
                  <PrivateRoute>
                    <KYCQueue />
                  </PrivateRoute>
                }
              />
              {/* Additional routes to be added in Week 3+ */}
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  )
}

export default App
