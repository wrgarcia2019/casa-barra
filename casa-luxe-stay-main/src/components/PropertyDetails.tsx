import { MapPin, Users, Bed, Bath, Car } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const PropertyDetails = () => {
  const { nightlyPrice, selectedDates } = useSettings();
  return (
    <section className="py-24 px-4 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Casa da Barra em Itapoá
              </h2>
              <div className="flex items-center gap-2 text-xl text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span>Barra do Sai, Itapoá - SC, Brasil</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hóspedes</p>
                  <p className="text-lg font-semibold text-foreground">Até 10 pessoas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Bed className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quartos</p>
                  <p className="text-lg font-semibold text-foreground">3 quartos, sendo 1 suíte</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Bath className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Banheiros</p>
                  <p className="text-lg font-semibold text-foreground">3</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:justify-self-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Car className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vagas</p>
                  <p className="text-lg font-semibold text-foreground">Até 4 veículos</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Sobre Esta Casa</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                 Desfrute de dias inesquecíveis em uma casa acolhedora à beira-mar, perfeita para quem busca descanso e momentos especiais com a família ou amigos. Localizada em Itapoá, a poucos passos da praia, esta propriedade oferece o equilíbrio ideal entre conforto e praticidade.

Com amplos ambientes e uma área externa ideal para confraternizações, você terá o espaço perfeito para preparar um churrasco, relaxar na rede e aproveitar o som do mar. A casa comporta até 10 pessoas, sendo ótima para grupos que desejam viver dias de lazer, tranquilidade e conexão com a natureza.

Venha conhecer Itapoá e permita-se viver uma experiência única em um dos destinos mais charmosos do litoral catarinense.
              </p>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-24">
            <div className="card-elevated p-8 shadow-2xl">

              <div className="space-y-4 mb-6">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedDates.length > 0
                      ? format(selectedDates[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Selecione as datas"}
                  </p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedDates.length === 2
                      ? format(selectedDates[1], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : "Selecione as datas"}
                  </p>
                </div>
              </div>

              <button 
                className="w-full gradient-ocean text-white text-lg font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => document.getElementById('calendar')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Verificar Disponibilidade
              </button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Você não será cobrado ainda
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Star = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
  </svg>
);

export default PropertyDetails;
