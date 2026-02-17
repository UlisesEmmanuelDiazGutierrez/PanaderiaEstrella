import React from "react";
import { Toaster } from "react-hot-toast";
import { Mail } from "lucide-react";

const LoginView = ({ loginForm, setLoginForm, handleLogin, loading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="text-5xl">🥖</div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Panadería Artesanal
            </h1>
            <p className="text-amber-100 text-sm">Pan fresco recién horneado</p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Iniciar Sesión
            </h2>

            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                    placeholder="tu@email.com"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Recordarme */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <span className="ml-2 text-gray-600">Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                  onClick={() => alert("Contacta al administrador")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Botón de Login */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-amber-300 transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  "Ingresar"
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Google
                </span>
              </button>

              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Facebook
                </span>
              </button>
            </div>

            {/* Registro */}
            <p className="mt-6 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                className="font-medium text-amber-600 hover:text-amber-700"
                onClick={() =>
                  alert("Contacta al administrador para crear tu cuenta")
                }
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        {/* Cuentas de Prueba */}
        <div className="mt-6 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
          <p className="font-semibold mb-2 text-center">
            🔒 Cuentas de Prueba (Contraseña: 123)
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
              <span>👤 Cliente:</span>
              <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                cliente@test.com
              </code>
            </div>
            <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
              <span>🚚 Repartidor:</span>
              <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                repartidor@test.com
              </code>
            </div>
            <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
              <span>📦 Paquetería:</span>
              <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                paqueteria@test.com
              </code>
            </div>
            <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
              <span>👨‍💼 Admin:</span>
              <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                admin@test.com
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
