import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/layout/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { PlaceholderPage } from './components/ui/PlaceholderPage'
import { navCategories } from './components/layout/NavConfig'
import { LoginPage } from './features/auth/LoginPage'
import { PortalTopPage } from './features/portal/PortalTopPage'
import { PerformanceDashboardPage } from './features/dashboard/PerformanceDashboardPage'
import { DataImportPage } from './features/data-import/DataImportPage'
import { ProofreadingPage } from './features/proofreading/ProofreadingPage'
import { KarteCreatePage } from './features/karte/KarteCreatePage'
import { ClientListPage } from './features/clients/ClientListPage'
import { ClientDetailPage } from './features/clients/ClientDetailPage'
import { CompanyNewsPage, CompanySchedulePage } from './features/company/CompanyInfoPage'

// 準備中プレースホルダーで表示するページ一覧（作り込み済みのパスは除く）
const BUILT_PATHS = new Set([
  '/dashboard',
  '/company/news',
  '/company/schedule',
  '/clients',
  '/karte/new',
  '/proofreading',
  '/data-import',
])

const placeholderRoutes = navCategories.flatMap((category) =>
  category.items
    .filter((item) => item.placeholder && !BUILT_PATHS.has(item.path))
    .map((item) => ({ path: item.path, label: item.label, categoryLabel: category.label })),
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<PortalTopPage />} />
            <Route path="/dashboard" element={<PerformanceDashboardPage />} />
            <Route path="/data-import" element={<DataImportPage />} />
            <Route path="/proofreading" element={<ProofreadingPage />} />
            <Route path="/karte/new" element={<KarteCreatePage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/company/news" element={<CompanyNewsPage />} />
            <Route path="/company/schedule" element={<CompanySchedulePage />} />

            {placeholderRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<PlaceholderPage title={route.label} categoryLabel={route.categoryLabel} />}
              />
            ))}

            <Route path="*" element={<PlaceholderPage title="ページが見つかりません" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
