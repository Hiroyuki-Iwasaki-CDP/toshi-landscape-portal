import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/layout/RequireAuth'
import { AppLayout } from './components/layout/AppLayout'
import { PlaceholderPage } from './components/ui/PlaceholderPage'
import { navCategories } from './components/layout/NavConfig'
import { LoginPage } from './features/auth/LoginPage'
import { PortalTopPage } from './features/portal/PortalTopPage'
import { PerformanceDashboardPage } from './features/dashboard/PerformanceDashboardPage'
import { DataImportPage } from './features/data-import/DataImportPage'
import { ClientListPage } from './features/clients/ClientListPage'
import { ClientDetailPage } from './features/clients/ClientDetailPage'
import { CompanyNewsPage, CompanySchedulePage } from './features/company/CompanyInfoPage'
import { UserManagementPage } from './features/admin/UserManagementPage'
import { SimulationEmbedPage } from './features/landscape-consulting/SimulationEmbedPage'
import { DriveFolderPage } from './features/library/DriveFolderPage'

// マニュアル/フォーマット系はGoogleドライブ連携（モック）のファイル一覧ページとして表示する
const driveRoutes = navCategories.flatMap((category) =>
  category.items
    .filter((item) => item.editable)
    .map((item) => ({ path: item.path, label: item.label, categoryLabel: category.label })),
)

// 準備中プレースホルダーで表示するページ一覧（作り込み済みのパスは除く）
const BUILT_PATHS = new Set([
  '/dashboard',
  '/company/news',
  '/company/schedule',
  '/clients',
  '/data-import',
  '/admin/users',
  '/landscape-consulting/simulation-ap',
  ...driveRoutes.map((r) => r.path),
])

const placeholderRoutes = navCategories.flatMap((category) =>
  category.items
    .filter((item) => item.placeholder && !BUILT_PATHS.has(item.path))
    .map((item) => ({
      path: item.path,
      label: item.label,
      categoryLabel: category.label,
      editable: item.editable,
    })),
)

function App() {
  return (
    <HashRouter>
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
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/landscape-consulting/simulation-ap" element={<SimulationEmbedPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/company/news" element={<CompanyNewsPage />} />
            <Route path="/company/schedule" element={<CompanySchedulePage />} />

            {driveRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<DriveFolderPage path={route.path} title={route.label} categoryLabel={route.categoryLabel} />}
              />
            ))}

            {placeholderRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <PlaceholderPage title={route.label} categoryLabel={route.categoryLabel} editable={route.editable} />
                }
              />
            ))}

            <Route path="*" element={<PlaceholderPage title="ページが見つかりません" />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}

export default App
