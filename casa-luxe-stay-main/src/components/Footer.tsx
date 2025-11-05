import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Casa da Barra
            </h3>
            <p className="text-muted-foreground">
              Seu refúgio em Itapoá, perto de tudo que você precisa.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Links Rápidos</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Comodidades</a></li>
              <li><a href="#calendar" className="hover:text-primary transition-colors">Reservar</a></li>
              <li><a href="#map" className="hover:text-primary transition-colors">Localização</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Entre em Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">E-mail:</span>
                <span>wrgarcia2003@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Telefone/WhatsApp:</span>
                <span>+55 (47) 99696-0667</span>
                <span className="text-muted-foreground">|</span>
                <span>+55 (47) 99653-8040</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Local:</span>
                <span>Barra do Sai, Itapoá - SC, Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; 2025 Casa da Barra. Todos os direitos reservados.</p>
          <a
            href="/admin/login"
            aria-label="Acessar login de administrador"
            className="inline-block mt-2 text-xs opacity-20 hover:opacity-100 focus:opacity-100 transition-opacity underline-offset-2 hover:underline"
          >
            Admin
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
