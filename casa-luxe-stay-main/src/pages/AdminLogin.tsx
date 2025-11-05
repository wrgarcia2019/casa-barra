import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast({ title: "Login realizado", description: "Bem-vindo, administrador." });
      navigate("/admin");
    } else {
      toast({
        title: "Falha no login",
        description: result.error || "Credenciais inválidas. Verifique usuário e senha.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={onSubmit} className="card-elevated w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Login do Administrador</h1>
          <p className="text-muted-foreground mt-2">Acesse para gerenciar preço e ocupação</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-card p-3"
              placeholder="admin@exemplo.com"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-input bg-card p-3"
              placeholder="••••••••"
            />
          </div>
        </div>
        <button type="submit" className="w-full gradient-ocean text-white py-3 rounded-lg font-semibold">
          Entrar
        </button>
        <p className="text-xs text-muted-foreground text-center">Use seu e-mail e senha do Supabase</p>
      </form>
    </div>
  );
};

export default AdminLogin;