import { Wifi, Waves, Utensils, Wind, Palmtree, Car, Flame } from "lucide-react";

const features = [
  {
    icon: Wifi,
    title: "WiFi de Alta Velocidade",
    description: "Internet fibra óptica para você ficar sempre conectado"
  },
  {
    icon: Utensils,
    title: "Cozinha Integral",
    description: "Equipada para 10 pessoas: utensílios, micro-ondas, cafeteira e freezer para bebidas"
  },
  {
    icon: Wind,
    title: "Na Quadra do Mar",
    description: "A 70 metros da praia — sem precisar atravessar a rua"
  },
  {
    icon: Palmtree,
    title: "Acesso à Praia",
    description: "Poucos passos até a areia"
  },
  {
    icon: Car,
    title: "Estacionamento",
    description: "Garagem coberta para até 4 veículos"
  },
  {
    icon: Flame,
    title: "Churrasqueira",
    description: "Espaço externo com churrasqueira para confraternizar"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Comodidades
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para um refúgio em Itapoa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-elevated p-8 hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
