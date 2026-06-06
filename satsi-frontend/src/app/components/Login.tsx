import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Estados simplificados (quitamos el selectedRole)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!email.includes("@")) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Solo enviamos credenciales puras
      const user = await login(email, password);
      
      // 2. Redirección basada estrictamente en el rol que devolvió la base de datos
      if (user.role === 'manager') {
        navigate('/analytics');
      } else if (user.role === 'sysadmin') {
        navigate('/inventory');
      } else if (user.role === 'technician') {
        navigate('/kanban');
      } else {
        navigate('/tickets');
      }
      
    } catch (loginError) {
      console.error(loginError);
      setError("Credenciales inválidas o error de conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-4">
      <div className="w-full max-w-[480px] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-[32px] font-bold text-[#D32F2F]">
              SATSIWM
            </h1>
            <p className="text-[12px] text-[#757575] mt-1">
              Sistema de Atención de Tickets
            </p>
          </div>
          <div className="text-[10px] text-[#757575]">
            Wong / Cencosud
          </div>
        </div>

        {/* Título */}
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#212121] mb-2">
              Bienvenido
            </h1>
            <p className="text-[14px] text-[#757575]">
              Inicia sesión para continuar
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <div
              className={`flex items-center gap-3 px-4 py-3 border rounded-md bg-white transition-all ${error && !email
                  ? "border-[#D32F2F]"
                  : "border-[#E0E0E0] focus-within:border-[#D32F2F]"
                }`}
            >
              <Mail className="w-5 h-5 text-[#757575]" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 outline-none text-[14px] text-[#212121]"
              />
            </div>
            {error && !email && (
              <div className="flex items-center gap-2 mt-2 text-[#D32F2F]">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[12px]">
                  Este campo es requerido
                </span>
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <div
              className={`flex items-center gap-3 px-4 py-3 border rounded-md bg-white transition-all ${error && !password
                  ? "border-[#D32F2F]"
                  : "border-[#E0E0E0] focus-within:border-[#D32F2F]"
                }`}
            >
              <Lock className="w-5 h-5 text-[#757575]" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 outline-none text-[14px] text-[#212121]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#757575] hover:text-[#212121]"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {error && !password && (
              <div className="flex items-center gap-2 mt-2 text-[#D32F2F]">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[12px]">
                  Este campo es requerido
                </span>
              </div>
            )}
            {error && email && password && (
              <div className="flex items-center gap-2 mt-2 text-[#D32F2F]">
                <AlertCircle className="w-4 h-4" />
                <span className="text-[12px]">{error}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#D32F2F] text-white rounded-md font-medium text-[14px] hover:bg-[#B71C1C] transition-all disabled:bg-[#BDBDBD]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando..." : "Iniciar Sesión"}
          </button>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button
              type="button"
              className="text-[14px] text-[#D32F2F] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E0E0E0] text-center">
          <p className="text-[12px] text-[#757575]">
            Soporte IT:{" "}
            <span className="text-[#D32F2F]">
              soporte@wong.com.pe
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}